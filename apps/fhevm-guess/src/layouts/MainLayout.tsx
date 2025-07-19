import { Outlet, Link } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { setWalletClientToContractClient } from '@/services/guess-game.service';
import { initFhevmClient } from '@/services/fhe.service';

export function MainLayout() {
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  useEffect(() => {
    if (walletClient) {
      setWalletClientToContractClient(walletClient);
      initFhevmClient(walletClient);
    }
  }, [walletClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="bg-white shadow-sm border-b sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/lobby" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-900">FHEVM GUESS</h1>
          </Link>

          <nav className="flex space-x-6">
            {/* <Link
              to="/lobby"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/lobby'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Game Lobby
            </Link> */}
            <ConnectButton />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {account.isConnected ? (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        ) : (
          <div className="text-center">
            <h1>Please connect wallet first.</h1>
          </div>
        )}
      </main>

      <footer className="text-center py-2 bg-gray-50 border-t sticky bottom-0">
        Made with ❤️ by{' '}
        <a
          href="https://github.com/hstarorg"
          rel="noopener noreferrer"
          target="_blank"
          className="text-blue-600"
        >
          hstarorg
        </a>
      </footer>
    </div>
  );
}
