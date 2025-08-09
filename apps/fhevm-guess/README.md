# fhevm-guess(GuessGo)

## Contract Info

### Code Repository

https://github.com/hstarorg/evm-contract-lab/blob/main/contracts/fhevm-zama/FHEGuessNumberGame.sol

### Contract Address List:

```
https://sepolia.etherscan.io/address/0x6286EfD9cB3d29345F742C8159846Fb3a96828FB#code
```

## 🎯 Game Guide

A homomorphic-encryption-based guessing game where players can either host or join a match.

- **Hosting a Game**

  As the host, you can create a new game by setting a duration — choose from 1h, 6h, 12h, or 24h.
  When the game is created, a lucky number will be generated automatically by the system.

- **Joining a Game**

  Browse the list of active games and select one to join.
  Once you’ve joined, you can submit your guess for the lucky number.
  Your guess will remain private and visible only to you until the game ends.

- **Game End Conditions**

  A game can end in two ways:

  - _Time Expiry_
    If the set duration runs out, the game is marked as “Expired.”
    The host must manually end the game, after which all guesses and the lucky number will be revealed.

  - _Lucky Number Guessed_
    If any player correctly guesses the lucky number, the game will end automatically.
    All guesses and the lucky number will be revealed immediately.

## Reference

1. Zamamind Project: https://github.dev/immortal-tofu/zamamind
