import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { GameLobbyViewModel } from './GameLobbyViewModel';
import { NewGame } from './NewGame';
import { useMounted } from '@/hooks/useMounted';
import { GameCard } from './GameCard';
import { PageContent } from '@/components/page-content';
import { useAccount } from 'wagmi';

function GameLobby() {
  const vm = useMemo(() => new GameLobbyViewModel(), []);
  const account = useAccount();
  const vmData = vm.$useSnapshot();

  useMounted(() => {
    vm.loadGames();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Game Lobby</h2>
        <Button onClick={vm.openNewGameDrawer}>New Game</Button>
      </div>

      <PageContent loaded={vmData.loaded} empty={vmData.games.length === 0}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vmData.games.map((game) => (
            <GameCard
              key={game.answer}
              game={game}
              accountAddress={account.address}
              onGuess={vm.guessGame} // Pass the makeGuess method to handle guessing
              onEndGame={vm.endGame} // Pass the endGame
            />
          ))}
        </div>
      </PageContent>

      <NewGame
        open={vmData.newGameDrawer.open}
        onClose={vm.closeNewGameDrawer}
        onFinish={vm.createGame} // Pass the createGame method to handle game creation
      />
    </div>
  );
}

export default GameLobby;
