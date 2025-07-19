import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

const config = getDefaultConfig({
  appName: 'FHEVM GUESS',
  projectId: '10751c7c45f02a907cf49889960fb63f',
  chains: [sepolia],
});

const queryClient = new QueryClient();

export function Web3Provider(props: PropsWithChildren<unknown>) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{props.children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
