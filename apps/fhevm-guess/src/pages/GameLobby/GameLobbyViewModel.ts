import { proxy, useSnapshot } from 'valtio';
import { bytesToHex } from 'viem';
import type { GameFormValues } from './gameForm';
import {
  createGuessGame,
  endGuessGame,
  getGameList,
  guessGame,
} from '@/services/guess-game.service';
import type { UIGameItem } from '@/types/game-types';
import { fhevmUserEncrypt } from '@/services/fhe.service';

type Model = {
  newGameDrawer: {
    open: boolean;
  };
  loaded?: boolean;
  games: UIGameItem[];
  listArgs: {
    filter: Record<string, string | number | boolean>;
    page: number;
    total: number;
    size: number;
  };
};

export class GameLobbyViewModel {
  private state = proxy<Model>({
    newGameDrawer: { open: false },
    games: [],
    listArgs: {
      page: 1,
      total: 0,
      size: 10,
      filter: {},
    },
  });

  $useSnapshot() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSnapshot(this.state);
  }

  loadGames = async () => {
    const { page } = this.state.listArgs;
    const res = await getGameList(page);
    if (!this.state.loaded) {
      this.state.loaded = true;
    }
    this.state.games = res.rows;
    this.state.listArgs.total = res.total;
  };

  openNewGameDrawer = () => {
    this.state.newGameDrawer.open = true;
  };
  closeNewGameDrawer = () => {
    this.state.newGameDrawer.open = false;
  };

  createGame = async (data: GameFormValues) => {
    await createGuessGame(data.deadline as '1' | '6' | '12' | '24');
    this.closeNewGameDrawer();
    this.loadGames();
  };

  endGame = async (id: number) => {
    await endGuessGame(id);
    this.loadGames();
  };

  guessGame = async (gameId: number, guessValue: string): Promise<boolean> => {
    const encrypted = await fhevmUserEncrypt((input) =>
      input.add8(Number(guessValue))
    );

    const handle = bytesToHex(encrypted.handles[0] as Uint8Array);
    const inputProof = bytesToHex(encrypted.inputProof as Uint8Array);

    console.log(encrypted, 'encrypted guess input');
    const result = await guessGame(gameId, handle, inputProof);
    this.loadGames();
    return result;
  };
}
