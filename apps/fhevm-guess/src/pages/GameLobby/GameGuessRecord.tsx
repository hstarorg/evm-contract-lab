import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  //   DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  //   DrawerTrigger,
} from '@/components/ui/drawer';
import { useMounted } from '@/hooks/useMounted';
import { fhevmPublicDecrypt } from '@/services/fhe.service';
import { getGuessList } from '@/services/guess-game.service';
import { shortAddress } from '@/utils';
import { useState } from 'react';

export type GameGuessRecordProps = {
  gameId: number;
  ended: boolean;
  onClose?: () => void;
};
export function GameGuessRecord(props: GameGuessRecordProps) {
  const { gameId, ended, onClose } = props;

  const [loaded, setLoaded] = useState(false);
  const [guessList, setGuessList] = useState<
    { player: string; guessValue: string }[]
  >([]);

  useMounted(async () => {
    const res = await getGuessList(gameId);
    setLoaded(true);
    const guesses = res.guesses.concat(res.guesses);
    if (ended) {
      const guessValues = await fhevmPublicDecrypt(
        guesses.map((x) => x.guessValue)
      );
      guesses.forEach((x, i) => (x.guessValue = String(guessValues[i])));
    }
    setGuessList(guesses);
  });

  return (
    <Drawer open direction="right" onClose={onClose}>
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>Guess Detail</DrawerTitle>
          <DrawerDescription>Show all guess records</DrawerDescription>
        </DrawerHeader>
        <div>
          {loaded && guessList.length === 0 ? (
            <div className="text-center mt-32">
              There is no player's guess record yet
            </div>
          ) : null}
          {guessList.map((x, i) => {
            return (
              <div key={x.player} className="border-b px-4 py-2 flex">
                <div className="w-4 border-r">{i + 1}</div>
                <div className="px-2 border-r">
                  <strong>{shortAddress(x.player)}</strong> Guessed
                </div>
                <div className="px-2">
                  {ended ? x.guessValue : 'Decrypt After Ends'}
                </div>
              </div>
            );
          })}
        </div>
        <DrawerFooter>
          <div className="flex space-x-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
