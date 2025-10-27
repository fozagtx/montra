# Push Chain Configuration

This document tracks the deployed PushChain payment contract used by Montra. The JSON block below is consumed at runtime by the app to configure on-chain interactions.

```json
{
  "network": {
    "name": "Push Testnet Donut",
    "chainId": 42101,
    "rpcUrl": "https://evm.rpc-testnet-donut-node1.push.org",
    "explorerUrl": "https://testnet-explorer.push.org",
    "walletNetwork": "TESTNET_DONUT"
  },
  "contract": {
    "address": "0x64f07b7be711b4e85043f29d4fe2e04776111b51",
    "purchaseFunction": "pay",
    "verifyFunction": "verifyPayment",
    "paymentTokenDecimals": 18,
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address payable",
            "name": "payee",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "productRef",
            "type": "string"
          }
        ],
        "name": "pay",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "string",
            "name": "productRef",
            "type": "string"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "payer",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "payee",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "PaymentMade",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "name": "payments",
        "outputs": [
          {
            "internalType": "address",
            "name": "payer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "payee",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "paid",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "productRef",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "payer",
            "type": "address"
          }
        ],
        "name": "verifyPayment",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }
}
```
