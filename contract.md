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
    "address": "0xcecbf89ad2db3601b6cc7803470cfa15ce8c213a",
    "purchaseFunction": "purchaseProduct",
    "verifyFunction": "hasPurchased",
    "paymentTokenDecimals": 6,
    "abi": [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "productId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "payoutAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "expectedPrice",
            "type": "uint256"
          }
        ],
        "name": "purchaseProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "buyer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "productId",
            "type": "uint256"
          }
        ],
        "name": "hasPurchased",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "productId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "ProductPurchased",
        "type": "event"
      }
    ]
  }
}
```
