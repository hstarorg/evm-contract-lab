import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, fhevm } from "hardhat";
import { FHEGuessNumberGame, FHEGuessNumberGame__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHEGuessNumberGame")) as FHEGuessNumberGame__factory;
  const gameContract = (await factory.deploy()) as FHEGuessNumberGame;
  const gameContractAddress = await gameContract.getAddress();

  return { gameContract, gameContractAddress };
}

describe("FHEGuessNumberGame", function () {
  let signers: Signers;
  let gameContract: FHEGuessNumberGame;
  let gameContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async () => {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      throw new Error(`This hardhat test suite cannot run on Sepolia Testnet`);
    }
    ({ gameContract, gameContractAddress } = await deployFixture());
  });

  it("encrypted count should be uninitialized after deployment", async function () {
    const encryptedCount = await gameContract.gameCounter();
    // Expect initial count to be bytes32(0) after deployment,
    // (meaning the encrypted count value is uninitialized)
    expect(encryptedCount).to.eq(0);
  });

  it("create a game(old mode)", async function () {
    const answer = 55;
    const encrypted = await fhevm
      .createEncryptedInput(gameContractAddress, signers.alice.address)
      .add8(answer)
      .encrypt();

    const tx = await gameContract.connect(signers.alice).createGameOld(encrypted.handles[0], encrypted.inputProof, 1);
    await tx.wait();
    const counter = await gameContract.gameCounter();
    expect(counter).to.eq(1);

    const game = await gameContract.games(1);
    console.log("Game created:", game[1]);

    const value = await fhevm.userDecryptEuint(FhevmType.euint8, game[1], gameContractAddress, signers.alice);
    console.log("Decrypted value:", value);

    expect(value).to.eq(55n);
  });

  it("create a game", async function () {
    const tx = await gameContract.connect(signers.alice).createGame(1);
    await tx.wait();
    const counter = await gameContract.gameCounter();
    expect(counter).to.eq(1);

    const game = await gameContract.games(1);
    expect(game.creator).to.eq(signers.alice.address);
  });

  async function guessGame(guessValue: number, signer: HardhatEthersSigner) {
    const guessNumEncrypted = await fhevm
      .createEncryptedInput(gameContractAddress, signer.address)
      .add8(guessValue)
      .encrypt();
    const tx1 = await gameContract
      .connect(signer)
      .guess(1n, guessNumEncrypted.handles[0], guessNumEncrypted.inputProof);
    await tx1.wait();
  }

  it("guess a game", async function () {
    // prepare a game - owner: signers.deployer
    const encrypted = await fhevm
      .createEncryptedInput(gameContractAddress, signers.deployer.address)
      .add8(55)
      .encrypt();
    const tx = await gameContract
      .connect(signers.deployer)
      .createGameOld(encrypted.handles[0], encrypted.inputProof, 1);
    await tx.wait();

    async function getGuessResult(gameId: number) {
      const guesses = await gameContract.getGuesses(gameId);
      console.log(guesses.length, "guesses");
      const guessRes = guesses.reduce((acc: Record<string, string>, item) => {
        acc[item.player] = item.guessValue;
        return acc;
      }, {});
      return guessRes;
    }

    // ---------- guess 1 ----------
    await guessGame(44, signers.alice);
    await fhevm.awaitDecryptionOracle();

    const guessRes = await getGuessResult(1);
    const value = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      guessRes[signers.alice.address],
      gameContractAddress,
      signers.alice,
    );
    console.log("Decrypted value:", value);

    const res = await gameContract.games(1);
    expect(res.guessCount).to.eq(1);
    expect(res.status).to.eq(0); // Active
    // console.log("Game after guess:", res);

    // -------guess 2------
    await expect(guessGame(55, signers.alice)).to.be.revertedWith("You have already guessed");

    // -------guess 3------
    await guessGame(54, signers.bob);
    await fhevm.awaitDecryptionOracle();
    const res3 = await gameContract.games(1);
    expect(res3.guessCount).to.eq(2);
    expect(res3.status).to.eq(0); // Active
    try {
      await fhevm.publicDecryptEuint(FhevmType.euint8, res3.answer);
      expect.fail("Expected function to throw, but it did not");
    } catch (err: unknown) {
      expect((err as Error).message).to.include("Handle 0x");
    }

    // -------guess 4------
    await guessGame(55, signers.deployer);
    await fhevm.awaitDecryptionOracle();
    const res4 = await gameContract.games(1);
    expect(res4.guessCount).to.eq(3);
    expect(res4.status).to.eq(2); // WinAndEnded
    expect(res4.winner).to.eq(signers.deployer.address);

    // Can decrypt the answer and guesses
    const answer = await fhevm.publicDecryptEuint(FhevmType.euint8, res4.answer);
    expect(answer).to.eq(55n);
    const guessResFinal = await getGuessResult(1);
    for (const [player, guess] of Object.entries(guessResFinal)) {
      const decryptedGuess = await fhevm.publicDecryptEuint(FhevmType.euint8, guess);
      console.log(`Decrypted guess for ${player}:`, decryptedGuess);
      if (player === signers.deployer.address) {
        expect(decryptedGuess).to.eq(55n);
      } else if (player === signers.bob.address) {
        expect(decryptedGuess).to.eq(54n);
      } else if (player === signers.alice.address) {
        expect(decryptedGuess).to.eq(44n);
      } else {
        throw new Error(`Unexpected player: ${player}`);
      }
    }
  });

  it("end a game", async function () {
    // prepare a game - owner: signers.deployer
    const tx = await gameContract.connect(signers.deployer).createGame(1);
    await tx.wait();

    // end the game
    await expect(gameContract.connect(signers.deployer).endGame(1)).to.be.revertedWith(
      "Deadline not reached, cannot close game",
    );
    await expect(gameContract.connect(signers.alice).endGame(1)).to.be.revertedWith("Not creator");

    await time.increase(86400); // Increase time by 1 day to reach the deadline
    await gameContract.connect(signers.deployer).endGame(1);
    const res = await gameContract.games(1);
    expect(res.status).to.eq(3); // Ended
  });
});
