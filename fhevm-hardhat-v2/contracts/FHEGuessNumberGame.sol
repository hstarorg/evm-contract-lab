pragma solidity ^0.8.24;

import {FHE, euint8, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEGuessNumberGame is SepoliaConfig {
    uint256 public gameCounter = 0;

    struct Game {
        address creator;
        euint8 answer;
        uint8 guessCount;
        bool active;
    }

    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator);
    event PlayerGuessed(uint256 indexed gameId, address indexed player);

    // Storage
    mapping(uint256 => Game) public games;
    // gameId => player => encrypted result
    mapping(uint256 => mapping(address => ebool)) public guesses;

    function createGame(euint8 encryptedAnswer) external returns (uint256) {
        uint256 gameId = ++gameCounter;

        games[gameId] = Game({
            creator: msg.sender,
            answer: encryptedAnswer,
            guessCount: 0,
            active: true
        });

        emit GameCreated(gameId, msg.sender);
        return gameId;
    }

    function guess(
        uint256 gameId,
        euint8 encryptedGuess
    ) external returns (ebool) {
        require(games[gameId].active, "Game not active");

        ebool result = FHE.eq(encryptedGuess, games[gameId].answer);
        guesses[gameId][msg.sender] = result;

        emit PlayerGuessed(gameId, msg.sender);
        return result;
    }

    function closeGame(uint256 gameId) external {
        require(msg.sender == games[gameId].creator, "Not creator");
        games[gameId].active = false;
    }

    function getResult(
        uint256 gameId,
        address player
    ) external view returns (ebool) {
        return guesses[gameId][player];
    }
}
