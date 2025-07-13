import { describe, it } from 'node:test';
import { network } from 'hardhat';
import assert from 'node:assert/strict';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/node';
import { isAddress, zeroHash } from 'viem';
import { userDecryptSingleHandle } from './utils.js';

describe('FHECounter', async function () {
  const { viem } = await network.connect({ network: 'hardhatMainnet' });
  // const publicClient = await viem.getPublicClient();
  const fhevm = await createInstance(SepoliaConfig);

  it('should be deployed', async function () {
    const counterContract = await viem.deployContract('FHECounter');
    console.log(
      `FHECounter has been deployed at address ${counterContract.address}`
    );
    // Test the deployed address is valid
    assert.ok(isAddress(counterContract.address));
  });

  it('count should be zero after deployment', async function () {
    const counterContract = await viem.deployContract('FHECounter');

    const count = await counterContract.read.getCount();

    console.log(`Counter.getCount() === ${count}`);
    assert.equal(count, zeroHash);
  });

  it.skip('increment the counter by 1', async function () {
    const counterContract = await viem.deployContract('FHECounter');
    const [a2] = await viem.getWalletClients();

    const encryptedOne = await fhevm
      .createEncryptedInput(counterContract.address, a2.account.address)
      .add32(1)
      .encrypt();

    const tx = await counterContract.write.increment(
      encryptedOne.handles[0] as any,
      encryptedOne.inputProof as any
    );
    assert.ok(tx);
    console.log(tx);

    // decrypt the result
    const countAfterInc = await counterContract.read.getCount();

    // const handle = await counterContract.xUint32();
    // const { publicKey, privateKey } = fhevm.generateKeypair();
    // const decryptedValue = (await userDecryptSingleHandle(
    //   handle,
    //   counterContract.address,
    //   a2.account.address,
    //   a2.account,
    //   privateKey,
    //   publicKey
    // )) as bigint;
    // // expect(decryptedValue).to.equal(32n);

    // assert.equal(countAfterInc, decryptedValue + 1n);
  });

  // it.skip('decrement the counter by 1', async function () {
  //   const counterContract = await viem.deployContract('FHECounter');

  //   // First increment, count becomes 1
  //   let tx = await counterContract.connect(signers.alice).increment();
  //   await tx.wait();
  //   // Then decrement, count goes back to 0
  //   tx = await counterContract.connect(signers.alice).decrement(1);
  //   await tx.wait();

  //   const count = await counterContract.read.getCount();
  //   assert.equal(count, 0);
  // });
});
