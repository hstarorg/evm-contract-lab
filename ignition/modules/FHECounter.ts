import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('FHECounter', (m) => {
  const fheCounter = m.contract('FHECounter');

  return { fheCounter };
});
