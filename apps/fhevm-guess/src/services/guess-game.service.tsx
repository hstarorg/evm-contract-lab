import { AppConf } from '@/constants';
import { FHEGuessNumberGameContractClient } from '@/lib/FHEGuessNumberGame/FHEGuessNumberGameContractClient';
import { sepolia } from 'viem/chains';
import type { Hex, WalletClient } from 'viem';
import { toastTransaction } from '@/utils';
import { toast } from 'sonner';
import type { UIGameItem } from '@/types/game-types';
import { Check } from 'lucide-react';

let contractClient = new FHEGuessNumberGameContractClient({
  contractAddress: AppConf.contractAddress,
  chain: sepolia,
});

export function setWalletClientToContractClient(walletClient: unknown) {
  contractClient = new FHEGuessNumberGameContractClient({
    contractAddress: AppConf.contractAddress,
    chain: sepolia,
    walletClient: walletClient as WalletClient,
  });
}

export async function getGameList(
  page: number = 1
): Promise<{ total: number; rows: UIGameItem[]; size: number }> {
  console.debug(page);
  const gameCounter = await contractClient.gameCounter();
  const ids: number[] = [];
  for (let i = gameCounter; i > Math.max(gameCounter - 10, 0); i--) {
    ids.push(i);
  }
  const games = await contractClient.getGameList(ids);

  const rows: UIGameItem[] = games.map((x, idx) => ({
    id: ids[idx],
    creator: x[0] as string,
    answer: x[1] as string,
    guessCount: Number(x[2]),
    ddl: Number(x[3]),
    status: x[4] as number,
    winner: x[5] as string,
  }));

  return {
    total: gameCounter,
    rows,
    size: 10,
  };
}

export async function createGuessGame(ddlType: '1' | '6' | '12' | '24') {
  if (!['1', '6', '12', '24'].includes(ddlType)) {
    throw new Error('Invalid ddlType');
  }
  console.log('Creating game with ddlType:', ddlType);
  const hash = await contractClient.createGame(ddlType);
  console.log('Transaction hash:', hash);
  const id = toastTransaction(hash);
  await contractClient.waitForTransaction(hash);
  toast.success(`Game created successfully!`, {
    id,
    icon: <Check />,
  });
}

export async function endGuessGame(id: number) {
  if (id <= 0) {
    throw new Error('Invalid game ID');
  }
  console.log('Ending game with ID:', id);
  const hash = await contractClient.endGame(BigInt(id));
  console.log('Transaction hash:', hash);
  const toastId = toastTransaction(hash);
  await contractClient.waitForTransaction(hash);
  toast.success(`Game ended successfully!`, {
    id: toastId,
    icon: <Check />,
  });
}

export async function guessGame(gameId: number, handle: Hex, inputProof: Hex) {
  if (gameId <= 0) {
    throw new Error('Invalid game ID');
  }

  const hash = await contractClient.guess(BigInt(gameId), handle, inputProof);
  console.log('Transaction hash:', hash);
  const toastId = toastTransaction(hash);
  contractClient.waitForTransaction(hash).then(() => {
    toast.success(`Guess submitted successfully!`, {
      id: toastId,
      icon: <Check />,
    });
  });

  return true;
}
