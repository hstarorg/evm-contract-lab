import {
  initSDK,
  createInstance,
  SepoliaConfig,
} from '@zama-fhe/relayer-sdk/bundle';
import type {
  EIP712,
  FhevmInstance,
  RelayerEncryptedInput,
} from '@zama-fhe/relayer-sdk/bundle';
import type { Address, TypedDataDomain, WalletClient } from 'viem';

export class FhevmClient {
  private ins: FhevmInstance | null = null;
  private kp: { publicKey: string; privateKey: string } | null = null;
  private eip: EIP712 | null = null;
  private contractAddress: Address | null = null;
  private initArgs: { timestamp: number; durationDays: number } | null = null;
  private walletClient: WalletClient | null = null;

  async init(
    contractAddress: Address,
    durationDays: number,
    walletClient: WalletClient
  ) {
    this.contractAddress = contractAddress;
    this.walletClient = walletClient;

    await initSDK();
    this.ins = await createInstance({
      ...SepoliaConfig,
      network: walletClient,
    });
    this.kp = this.ins.generateKeypair();

    this.initArgs = { timestamp: Date.now(), durationDays };
    this.eip = this.ins.createEIP712(
      this.kp.publicKey,
      [contractAddress],
      this.initArgs.timestamp,
      this.initArgs.durationDays
    );
  }

  async userDecrypt(handle: string) {
    const signature = await this._requestSignature(this.eip!);
    const { privateKey, publicKey } = this.kp!;
    const r = await this.ins!.userDecrypt(
      [{ handle, contractAddress: this.contractAddress! }],
      privateKey,
      publicKey,
      signature,
      [this.contractAddress!],
      this.walletClient!.account!.address,
      this.initArgs!.timestamp,
      this.initArgs!.durationDays
    );
    return r[handle] as bigint;
  }

  private async _requestSignature(eip712: EIP712) {
    const signature = await this.walletClient!.signTypedData({
      account: this.walletClient!.account!.address,
      domain: eip712.domain as TypedDataDomain,
      types: eip712.types,
      primaryType: eip712.primaryType,
      message: eip712.message,
    });
    return signature;
  }

  async publicDecrypt(handles: string[]) {
    return await this.ins!.publicDecrypt(handles);
  }

  async encrypt(inputFn: (input: RelayerEncryptedInput) => void) {
    const encryptedInput = this.ins!.createEncryptedInput(
      this.contractAddress!,
      this.walletClient!.account!.address
    );
    // Call the input function to add data to the encrypted input
    inputFn(encryptedInput);
    return encryptedInput.encrypt();
  }
}
