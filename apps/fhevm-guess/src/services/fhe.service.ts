import { AppConf } from '@/constants';
import { FhevmClient } from '@/lib/fhevm-client';
import type { RelayerEncryptedInput } from '@zama-fhe/relayer-sdk/web';
import type { Address, WalletClient } from 'viem';

const fhevmClient = new FhevmClient();

export async function initFhevmClient(
  walletClient: WalletClient
): Promise<void> {
  await fhevmClient.init(AppConf.contractAddress as Address, 1, walletClient);
  console.log('FHEVM client initialized with contract address:', AppConf.contractAddress);
}

export async function fhevmUserEncrypt(
  inputFn: (input: RelayerEncryptedInput) => void
) {
  return fhevmClient.encrypt(inputFn);
}

export async function fhevmUserDecrypt(handle: string) {
  return fhevmClient.userDecrypt(handle);
}

export async function fhevmPublicDecrypt(handles: string[]) {
  return fhevmClient.publicDecrypt(handles);
}
