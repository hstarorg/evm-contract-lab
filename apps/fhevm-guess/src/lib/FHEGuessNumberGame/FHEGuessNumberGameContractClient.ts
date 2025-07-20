import { ContractClientBase } from '@bizjs/chainkit-evm';

import { abi } from './abi';
import {
  type Address,
  type Chain,
  type Hash,
  type Hex,
  type MulticallParameters,
  type WalletClient,
} from 'viem';

export type FHEGuessNumberGameContractClientOptions = {
  contractAddress: string;
  chain: Chain;
  endppoint?: string;
  walletClient?: WalletClient | undefined;
};

export class FHEGuessNumberGameContractClient extends ContractClientBase<
  typeof abi
> {
  constructor(options: FHEGuessNumberGameContractClientOptions) {
    super({
      abi,
      chain: options.chain,
      contractAddress: options.contractAddress as Address,
      endpoint: options.endppoint,
      walletClient: options.walletClient,
    });
  }

  setWalletClient(walletClient: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).walletClient = walletClient;
  }

  async createGame(ddlType: '1' | '6' | '12' | '24') {
    const hash = await this.simulateAndWriteContract({
      functionName: 'createGame',
      args: [Number(ddlType)],
    });
    return hash;
  }

  async guess(gameId: bigint, handle: Hex, inputProof: Hex) {
    const hash = await this.simulateAndWriteContract({
      functionName: 'guess',
      args: [gameId, handle, inputProof],
    });
    return hash;
  }

  async endGame(gameId: bigint) {
    const hash = await this.simulateAndWriteContract({
      functionName: 'endGame',
      args: [gameId],
    });
    return hash;
  }

  async gameCounter() {
    const value = await this.readContract({
      functionName: 'gameCounter',
    });
    return Number(value);
  }

  async getGame(gameId: bigint) {
    const value = await this.readContract({
      functionName: 'games',
      args: [gameId],
    });
    return value as unknown[];
  }

  async getGameList(ids: number[]) {
    if (ids.length > 10) {
      throw new Error('Too many game IDs requested. Maximum is 10.');
    }

    const contracts: MulticallParameters['contracts'] = ids.map((id) => {
      return {
        address: this.contractAddress!,
        functionName: 'games',
        args: [id],
        abi: this.abi!,
      };
    });
    const results = await this.multicall({
      contracts,
      allowFailure: false,
    });
    return results as unknown[][];
  }

  async getGuesses(gameId: bigint) {
    const guesses = (await this.readContract({
      functionName: 'getGuesses',
      args: [gameId],
    })) as { player: string; guessValue: string }[];
    const guessMap = guesses.reduce((acc: Record<string, string>, item) => {
      acc[item.player] = item.guessValue;
      return acc;
    }, {});
    return {
      guesses,
      guessMap,
    };
  }

  async waitForTransaction(hash: Hash) {
    return await this.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });
  }
}
