import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('FHEGuessNumberGame', (m) => {
  const fheGuessNumberGame = m.contract('FHEGuessNumberGame');

  return { fheGuessNumberGame };
});
