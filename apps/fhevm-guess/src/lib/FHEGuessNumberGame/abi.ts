import type { Abi } from 'viem';

export const abi: Abi = [
  {
    inputs: [],
    name: 'HandlesAlreadySavedForRequestID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidKMSSignatures',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoHandleFoundForRequestID',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnsupportedHandleType',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'requestID',
        type: 'uint256',
      },
    ],
    name: 'DecryptionFulfilled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
    ],
    name: 'GameCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'guessIdx',
        type: 'uint8',
      },
    ],
    name: 'PlayerGuessed',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'ddl',
        type: 'uint8',
      },
    ],
    name: 'createGame',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'externalEuint8',
        name: 'encryptedAnswer',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'inputProof',
        type: 'bytes',
      },
      {
        internalType: 'uint8',
        name: 'ddl',
        type: 'uint8',
      },
    ],
    name: 'createGameOld',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'requestId',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'guessCorrect',
        type: 'bool',
      },
      {
        internalType: 'bytes[]',
        name: 'signatures',
        type: 'bytes[]',
      },
    ],
    name: 'decryptGuessResultCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
    ],
    name: 'endGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gameCounter',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'games',
    outputs: [
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        internalType: 'euint8',
        name: 'answer',
        type: 'bytes32',
      },
      {
        internalType: 'uint8',
        name: 'guessCount',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'ddl',
        type: 'uint256',
      },
      {
        internalType: 'enum FHEGuessNumberGame.GameStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
    ],
    name: 'getGuesses',
    outputs: [
      {
        components: [
          {
            internalType: 'euint8',
            name: 'guessValue',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'player',
            type: 'address',
          },
        ],
        internalType: 'struct FHEGuessNumberGame.GuessItem[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
      {
        internalType: 'externalEuint8',
        name: 'encryptedGuess',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'inputProof',
        type: 'bytes',
      },
    ],
    name: 'guess',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
