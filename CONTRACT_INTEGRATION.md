# Smart Contract Integration Guide

This document describes how the deployed PushChain payment contract is integrated with the Montra application.

## Contract Details

- **Contract Address**: `0x64f07b7be711b4e85043f29d4fe2e04776111b51`
- **Network**: Push Testnet Donut
- **Chain ID**: 42101
- **RPC URL**: https://evm.rpc-testnet-donut-node1.push.org
- **Explorer**: https://testnet-explorer.push.org

## Architecture Overview

```
┌─────────────────┐
│   User Wallet   │
│  (PushChain)    │
└────────┬────────┘
         │
         │ 1. Connect wallet
         │ 2. Sign transaction
         │
┌────────▼────────────────────────────────────┐
│           Frontend (Next.js)                │
│  ┌──────────────────────────────────────┐  │
│  │  components/buttonProvider.tsx       │  │
│  │  - Encodes pay() transaction         │  │
│  │  - Sends with PUSH value             │  │
│  └──────────────────────────────────────┘  │
└────────┬────────────────────────────────────┘
         │
         │ 3. Transaction submitted
         │
┌────────▼────────────────────────────────────┐
│      Smart Contract (PushChain)             │
│  0x64f07b7be711b4e85043f29d4fe2e04776111b51│
│                                             │
│  pay(payee, productRef) payable             │
│  - Receives PUSH tokens                     │
│  - Records payment                          │
│  - Emits PaymentMade event                  │
│                                             │
│  verifyPayment(productRef, payer) view      │
│  - Returns payment status                   │
└────────┬────────────────────────────────────┘
         │
         │ 4. Verify payment
         │
┌────────▼────────────────────────────────────┐
│      Backend API (Next.js)                  │
│  ┌──────────────────────────────────────┐  │
│  │  app/api/payments/verify/route.ts    │  │
│  │  - Calls verifyPayment()             │  │
│  │  - Returns product URL if verified   │  │
│  └──────────────────────────────────────┘  │
└────────┬────────────────────────────────────┘
         │
         │ 5. Product access granted
         │
┌────────▼────────────────────────────────────┐
│         User receives product URL           │
└─────────────────────────────────────────────┘
```

## Contract Functions

### 1. pay(address payable payee, string productRef)

**Type**: Payable function  
**Purpose**: Process payment for a product  
**Parameters**:
- `payee`: The creator's wallet address where PUSH tokens will be sent
- `productRef`: The product UUID as a string

**Usage in Code** (`components/buttonProvider.tsx`):
```typescript
const data = encodeFunctionData({
  abi: contract.abi,
  functionName: 'pay',
  args: [payoutAddress, productId],
});

await pushChainClient.universal.sendTransaction({
  to: contract.address,
  data: data,
  value: amount, // PUSH tokens in wei (18 decimals)
});
```

### 2. verifyPayment(string productRef, address payer)

**Type**: View function  
**Purpose**: Verify if a payment has been made  
**Parameters**:
- `productRef`: The product UUID as a string
- `payer`: The buyer's wallet address

**Returns**: `bool` - true if payment exists, false otherwise

**Usage in Code** (`app/api/payments/verify/route.ts`):
```typescript
const result = await publicClient.readContract({
  abi: contract.abi,
  address: contract.address,
  functionName: 'verifyPayment',
  args: [productId, buyer],
});

const purchaseConfirmed = Boolean(result);
```

### 3. payments(string productRef)

**Type**: View function  
**Purpose**: Get payment details for a product  
**Returns**: Struct with payer, payee, amount, paid status, timestamp

**Note**: Currently not used in the app but available for future features like detailed payment history.

## Configuration

The contract configuration is stored in `contract.md` and parsed at runtime by `lib/pushchain/config.ts`.

### contract.md Structure

```json
{
  "network": {
    "name": "Push Testnet Donut",
    "chainId": 42101,
    "rpcUrl": "...",
    "explorerUrl": "...",
    "walletNetwork": "TESTNET_DONUT"
  },
  "contract": {
    "address": "0x64f07b7be711b4e85043f29d4fe2e04776111b51",
    "purchaseFunction": "pay",
    "verifyFunction": "verifyPayment",
    "paymentTokenDecimals": 18,
    "abi": [...]
  }
}
```

### Configuration Loading

The `lib/pushchain/config.ts` module provides:
- `getPushChainConfig()`: Returns the full configuration
- `getPushChainPublicClient()`: Returns a viem PublicClient for reading contract state
- `getWalletNetworkKey()`: Returns the wallet network identifier

## Payment Flow

### 1. Product Creation

1. Creator fills out product form (`components/createProductForm.tsx`)
2. Includes title, description, product URL, wallet address, and price in PUSH
3. Product saved to Supabase with UUID
4. Price stored in `price_usdc` column (despite name, it's PUSH)

### 2. Payment Transaction

1. Buyer visits product page `/product/[id]`
2. Clicks "Pay X PUSH" button
3. Frontend encodes `pay(payeeAddress, productId)` transaction
4. Transaction includes `value` field with PUSH token amount (18 decimals)
5. User signs transaction in their wallet
6. Transaction submitted to PushChain

### 3. Payment Verification

1. After transaction confirmation, frontend calls `/api/payments/verify`
2. Backend calls contract's `verifyPayment(productId, buyerAddress)`
3. Contract returns true if payment exists
4. Backend retrieves product URL from Supabase
5. Frontend displays "Access your product" button

### 4. Product Delivery

1. User clicks "Access your product" button
2. Opens product URL in new tab
3. Payment record saved to Supabase `payments` table

## Key Differences from Previous Contract

| Aspect | Old Contract | New Contract |
|--------|-------------|-------------|
| Token Type | USDC (ERC-20) | PUSH (native) |
| Decimals | 6 | 18 |
| Product ID Type | `uint256` | `string` |
| Purchase Function | `purchaseProduct(uint256, address, uint256)` | `pay(address payable, string)` |
| Verify Function | `hasPurchased(address, uint256)` | `verifyPayment(string, address)` |
| Transaction Type | Contract call with approval | Payable with value |

## Testing

Run the verification scripts to ensure correct integration:

```bash
# Test contract configuration parsing
node test-contract-config.js

# Test transaction encoding
node test-transaction-encoding.js
```

## Troubleshooting

### Common Issues

1. **"Wallet client is not ready"**
   - User needs to connect their PushChain wallet first
   - Click "Connect Wallet" button before paying

2. **"Unable to verify purchase on-chain"**
   - Check RPC URL is accessible
   - Verify contract address is correct
   - Ensure buyer address matches the one used for payment

3. **Transaction fails**
   - Check user has enough PUSH balance
   - Verify payout address is valid
   - Confirm product ID exists in database

### Debug Logging

Frontend logs are prefixed with `[PushChainButton]`  
Backend logs are prefixed with `[payments.verify]`

Check browser console and server logs for detailed error messages.

## Future Enhancements

Potential improvements:
1. Use `payments()` view function to display payment history
2. Add event listening for `PaymentMade` events
3. Implement automatic product delivery via webhook
4. Add support for partial payments or subscriptions
5. Multi-currency support

## Security Considerations

- Product URLs should be securely stored and only revealed after verified payment
- Wallet addresses are validated with regex pattern
- On-chain verification prevents payment spoofing
- Row-level security enabled on Supabase tables
- Payment confirmation requires blockchain verification

## Support

For issues with:
- Smart contract: Check contract on Push Explorer
- Frontend integration: Review `components/buttonProvider.tsx`
- Backend verification: Check `app/api/payments/verify/route.ts`
- Configuration: Validate `contract.md` JSON format
