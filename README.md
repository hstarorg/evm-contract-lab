# evm-contract lab

> **WARNING**: This example project uses Hardhat 3, which is still in development. Hardhat 3 is not yet intended for production use.

Welcome to the Hardhat 3 alpha version! This project showcases some of the changes and new features coming in Hardhat 3.

To learn more about the Hardhat 3 Alpha, please visit [its tutorial](https://hardhat.org/hardhat3-alpha). To share your feedback, join our [Hardhat 3 Alpha](https://hardhat.org/hardhat3-alpha-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new?template=hardhat-3-alpha.yml) in our GitHub issue tracker.

## Project Overview

This repository is a playground of many evm contracts.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
pnpm test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
pnpm test:sol
pnpm test:node # default, alias pnpm test
```

### Compile

```bash
# Compile all contracts
pnpm compile

# Compile special contract
pnpm compile ./contracts/fhevm-zama/FHEGuessNumberGame.sol
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
pnpm hh ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
pnpm ks set SEPOLIA_RPC_URL # and then type sepolia rpc url: https://eth-sepolia.public.blastapi.io
pnpm ks set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
pnpm hh ignition deploy --network sepolia ignition/modules/Counter.ts

# clean old deployment
pnpm hh ignition wipe <deploymentId> <futureId>
pnpm hh ignition wipe "chain-11155111" "FHEGuessNumberGame#FHEGuessNumberGame"
```

### Verify Contracts

> https://hardhat.org/hardhat3-alpha/learn-more/smart-contract-verification

```bash
pnpm verify --network sepolia <contract address>
```

---

Feel free to explore the project and provide feedback on your experience with Hardhat 3 Alpha!
