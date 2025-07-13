import { Account } from 'viem';

export const userDecryptSingleHandle = async (
  handle: string,
  contractAddress: string,
  instance: any,
  signer: Account,
  privateKey: string,
  publicKey: string
): Promise<bigint | boolean | string> => {
  const HandleContractPairs = [
    {
      handle: handle,
      contractAddress: contractAddress,
    },
  ];
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = '10'; // String for consistency
  const contractAddresses = [contractAddress];

  // Use the new createEIP712 function
  const eip712 = instance.createEIP712(
    publicKey,
    contractAddresses,
    startTimeStamp,
    durationDays
  );

  // Update the signing to match the new primaryType
  //   const signature = await signer.signTypedData(
  //     eip712.domain,
  //     {
  //       UserDecryptRequestVerification:
  //         eip712.types.UserDecryptRequestVerification,
  //     },
  //     eip712.message
  //   );
  const signature = await signer.signTypedData!({
    domain: eip712.domain,
    primaryType: eip712.primaryType,
    types: {
      UserDecryptRequestVerification:
        eip712.types.UserDecryptRequestVerification,
    },
    message: eip712.message,
  });

  const result = await instance.userDecrypt(
    HandleContractPairs,
    privateKey,
    publicKey,
    signature.replace('0x', ''),
    contractAddresses,
    signer.address,
    startTimeStamp,
    durationDays
  );

  const decryptedValue = result[handle];
  return decryptedValue;
};
