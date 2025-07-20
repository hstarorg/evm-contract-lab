import { Loader } from 'lucide-react';
import { useState } from 'react';
import { zeroAddress } from 'viem';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UIGameItem } from '@/types/game-types';
import { formatDateFromUnixTimestamp, shortAddress } from '@/utils';
import { GameGuessRecord } from './GameGuessRecord';

export type GameCardProps = {
  game: UIGameItem;
  accountAddress?: string;
  onEndGame?: (id: number) => void; // Optional callback for ending the game
  onGuess: (id: number, guessValue: string) => Promise<boolean>; // Callback for making a guess
};

function getFinalStatusInfo(status: number, ddl: number) {
  const map: Record<number, string> = {
    0: 'Active',
    1: 'In Status Syncing',
    2: 'Ended With Winner',
    3: 'Ended',
  };
  let statusStr = map[status] || 'Unknown';
  let needEndButton = false;
  if (status === 0 && ddl * 1000 < Date.now()) {
    statusStr = 'Ended(Expired)';
    needEndButton = true;
  }
  return {
    status: statusStr,
    needEndButton,
  };
}

export function GameCard(props: GameCardProps) {
  const { game, onEndGame, onGuess, accountAddress } = props;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [guessValue, setGuessValue] = useState<string>(
    String(Math.floor(Math.random() * 255))
  );
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [detailShown, setDetailShown] = useState(false);

  async function handleConfirm() {
    try {
      setConfirmLoading(true);
      const result = await onGuess(game.id, guessValue);
      if (result) {
        setDialogOpen(false);
      }
    } finally {
      setConfirmLoading(false);
    }
  }

  const statusInfo = getFinalStatusInfo(game.status, game.ddl);
  const isOwner = accountAddress === game.creator;
  const guessAvailable = game.status === 0 && !statusInfo.needEndButton;
  const gameWinner =
    game.winner === zeroAddress ? 'No Winner Yet' : shortAddress(game.winner);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        ID: {game.id}
      </h3>
      <div className="space-y-2 text-sm text-gray-600 mb-2">
        <p>Creator: {shortAddress(game.creator)}</p>
        <p>
          Status:{' '}
          <Badge
            variant="destructive"
            className="bg-blue-500 text-white dark:bg-blue-600"
          >
            {statusInfo.status}
          </Badge>
          {isOwner && statusInfo.needEndButton ? (
            <span className="pl-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEndGame?.(game.id)}
              >
                End game
              </Button>
            </span>
          ) : null}
        </p>
        <p>Deadline: {formatDateFromUnixTimestamp(game.ddl)}</p>
        <p>
          Player Count: <strong>{game.guessCount}</strong>&nbsp;
          <Button variant="link" size="sm" onClick={() => setDetailShown(true)}>
            Show Detail
          </Button>
        </p>
        <p>
          Winner: <strong>{gameWinner}</strong>
        </p>
      </div>

      <AlertDialog open={dialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            className="w-full"
            disabled={!guessAvailable}
            onClick={() => setDialogOpen(true)}
          >
            Make a Guess
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure to make a guess?</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a number between 0 and 255 to make your guess.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Input
              type="number"
              min="0"
              max="255"
              value={guessValue}
              onChange={(e) => {
                let v = Number(e.target.value) || 0;
                v = Math.floor(v); // integer value
                v = Math.max(0, Math.min(255, v)); // clamp to
                setGuessValue(v.toString());
              }}
              placeholder="0-255"
            />
            Entered value: {guessValue}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={confirmLoading}
            >
              {confirmLoading ? <Loader className="animate-spin" /> : null}{' '}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {detailShown ? (
        <GameGuessRecord
          gameId={game.id}
          ended={game.status === 2 || game.status === 3}
          onClose={() => setDetailShown(false)}
        />
      ) : null}
    </div>
  );
}
