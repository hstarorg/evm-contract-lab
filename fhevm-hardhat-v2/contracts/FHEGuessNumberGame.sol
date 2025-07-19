pragma solidity ^0.8.24;

import {FHE, euint8, euint16, ebool, eaddress, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEGuessNumberGame is SepoliaConfig {
    uint256 public gameCounter = 0;

    enum GameStatus {
        Active, // 0
        Processing, // 1
        WinAndEnded, // 2
        Ended // 3
    }

    struct GuessItem {
        euint8 guessValue;
        address player;
    }

    struct Game {
        address creator;
        euint8 answer;
        uint8 guessCount;
        uint256 ddl; // deadline for the game
        GameStatus status;
        address winner;
        mapping(address => bool) guessed; // player => guessed
        mapping(uint8 => GuessItem) guesses; // player => encrypted guess
    }

    struct ReqeustItem {
        address player;
        uint256 gameId;
    }

    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator);
    event PlayerGuessed(uint256 indexed gameId, address indexed player, uint8 guessIdx);

    // Storage
    mapping(uint256 => Game) public games;
    mapping(uint256 => ReqeustItem) private requestMapping;

    function createGameOld(
        externalEuint8 encryptedAnswer,
        bytes calldata inputProof,
        uint8 ddl
    ) external returns (uint256) {
        require(ddl == 1 || ddl == 6 || ddl == 12 || ddl == 24, "Invalid ddl value");

        uint256 gameId = ++gameCounter;

        euint8 answer = FHE.fromExternal(encryptedAnswer, inputProof);

        Game storage game = games[gameId];
        game.creator = msg.sender;
        game.answer = answer;
        game.guessCount = 0;
        game.ddl = block.timestamp + ddl * 1 hours; // Set a deadline for the game
        game.status = GameStatus.Active;

        FHE.allowThis(answer);
        FHE.allow(answer, msg.sender);

        emit GameCreated(gameId, msg.sender);
        return gameId;
    }

    function createGame(uint8 ddl) external returns (uint256) {
        require(ddl == 1 || ddl == 6 || ddl == 12 || ddl == 24, "Invalid ddl value");

        uint256 gameId = ++gameCounter;

        // range: 0-255
        euint8 answer = FHE.randEuint8();

        Game storage game = games[gameId];
        game.creator = msg.sender;
        game.answer = answer;
        game.guessCount = 0;
        game.ddl = block.timestamp + ddl * 1 hours; // Set a deadline for the game
        game.status = GameStatus.Active;

        FHE.allowThis(answer);

        emit GameCreated(gameId, msg.sender);
        return gameId;
    }

    function guess(uint256 gameId, externalEuint8 encryptedGuess, bytes calldata inputProof) external {
        Game storage game = games[gameId];
        require(game.status != GameStatus.Processing, "Game status is updating");
        require(game.status != GameStatus.WinAndEnded && game.status != GameStatus.Ended, "Game already ended");
        require(game.ddl > block.timestamp, "Game ddl reached, cannot guess");
        require(game.guessed[msg.sender] == false, "You have already guessed");

        euint8 guessValue = FHE.fromExternal(encryptedGuess, inputProof);
        FHE.allowThis(guessValue);
        FHE.allow(guessValue, msg.sender);

        // record guess item

        uint8 idx = game.guessCount;
        game.guesses[idx] = GuessItem({guessValue: guessValue, player: msg.sender});
        game.guessed[msg.sender] = true;
        game.guessCount++;
        emit PlayerGuessed(gameId, msg.sender, idx);

        // update guess result
        ebool correct = FHE.eq(guessValue, game.answer);
        uint256 requestId = _requestDecryptBool(gameId, correct);
        requestMapping[requestId] = ReqeustItem({player: msg.sender, gameId: gameId});
        game.status = GameStatus.Processing;
    }

    function endGame(uint256 gameId) external {
        require(msg.sender == games[gameId].creator, "Not creator");
        require(games[gameId].ddl < block.timestamp, "Deadline not reached, cannot close game");
        games[gameId].status = GameStatus.Ended;
        _publicAnswerAndGuesses(gameId);
    }

    function getGuesses(uint256 gameId) external view returns (GuessItem[] memory) {
        Game storage game = games[gameId];
        require(game.ddl != 0, "Game does not exist");
        GuessItem[] memory guesses = new GuessItem[](game.guessCount);
        for (uint8 i = 0; i < game.guessCount; i++) {
            guesses[i] = game.guesses[i];
        }
        return guesses;
    }

    function _requestDecryptBool(uint256 gameId, ebool correct) private returns (uint256) {
        require(games[gameId].status == GameStatus.Active, "Game is not active");
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(correct);
        uint256 latestRequestId = FHE.requestDecryption(cts, this.decryptGuessResultCallback.selector);
        return latestRequestId;
    }

    function decryptGuessResultCallback(uint256 requestId, bool guessCorrect, bytes[] memory signatures) public {
        ReqeustItem memory requestItem = requestMapping[requestId];
        Game storage game = games[requestItem.gameId];
        require(requestItem.gameId > 0 && game.status == GameStatus.Processing, "Invalid requestId");

        FHE.checkSignatures(requestId, signatures);

        // guess correct, set winner and public guesses and answer
        if (guessCorrect) {
            game.status = GameStatus.WinAndEnded;
            game.winner = requestItem.player;
            _publicAnswerAndGuesses(requestItem.gameId);
        } else {
            // guess incorrect
            game.status = GameStatus.Active;
        }
    }

    function _publicAnswerAndGuesses(uint256 gameId) private {
        Game storage game = games[gameId];
        FHE.makePubliclyDecryptable(game.answer);
        for (uint8 i = 0; i < game.guessCount; i++) {
            FHE.makePubliclyDecryptable(game.guesses[i].guessValue);
        }
    }
}
