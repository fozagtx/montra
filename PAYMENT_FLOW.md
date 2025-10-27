# Payment Flow Diagram

## Complete End-to-End Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CREATOR WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

1. Creator signs up/logs in
   ↓
2. Creates product via /dashboard/create
   - Title, Description, Product URL
   - Wallet Address (payee)
   - Price in PUSH
   ↓
3. Product saved to Supabase
   - UUID generated as product ID
   - Stored in products table
   ↓
4. Creator shares payment link
   - /product/{uuid}


┌─────────────────────────────────────────────────────────────────────────┐
│                          BUYER WORKFLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

5. Buyer visits product page
   - /product/{uuid}
   ↓
6. Buyer clicks "Pay X PUSH"
   ↓
7. Connect Wallet (if not connected)
   - PushUniversalWalletProvider
   - TESTNET_DONUT network
   ↓
8. Frontend encodes transaction
   components/buttonProvider.tsx:
   ```
   encodeFunctionData({
     functionName: 'pay',
     args: [creatorAddress, productUuid]
   })
   ```
   ↓
9. Transaction sent with PUSH value
   ```
   sendTransaction({
     to: '0x64f07b7be711b4e85043f29d4fe2e04776111b51',
     data: encodedData,
     value: parseUnits(price, 18)  // PUSH in wei
   })
   ```
   ↓
10. Smart Contract executes
    Contract: 0x64f07b7be711b4e85043f29d4fe2e04776111b51
    Function: pay(payee, productRef)
    - Receives PUSH tokens
    - Records payment in contract state
    - Emits PaymentMade event
    ↓
11. Transaction confirmed on-chain
    ↓
12. Frontend verifies payment
    POST /api/payments/verify
    Body: { productId, buyer, transactionHash }


┌─────────────────────────────────────────────────────────────────────────┐
│                      VERIFICATION WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

13. Backend calls smart contract
    app/api/payments/verify/route.ts:
    ```
    publicClient.readContract({
      functionName: 'verifyPayment',
      args: [productUuid, buyerAddress]
    })
    ```
    ↓
14. Contract returns payment status
    - true if payment exists
    - false if no payment
    ↓
15. Backend retrieves product from Supabase
    - Query products table by UUID
    - Get product_url
    ↓
16. Backend saves payment record (optional)
    - Insert into payments table
    - transaction_hash, buyer_address, amount, status
    ↓
17. Backend returns response
    ```
    {
      verified: true,
      productUrl: "https://..."
    }
    ```


┌─────────────────────────────────────────────────────────────────────────┐
│                       PRODUCT DELIVERY                                   │
└─────────────────────────────────────────────────────────────────────────┘

18. Frontend displays success
    - "Purchase verified"
    - "Access your product" button
    ↓
19. Buyer clicks button
    ↓
20. Opens product URL in new tab
    - Direct access to digital product
    - Download file, course access, etc.
```

## Data Flow

```
┌──────────────┐
│   Supabase   │
│   Database   │
└──────┬───────┘
       │
       │ Store/Retrieve Product Info
       │
┌──────▼───────────────────────────────────┐
│         Next.js Application              │
│  ┌────────────────────────────────────┐  │
│  │  Frontend (React Components)       │  │
│  │  - buttonProvider.tsx              │  │
│  │  - Product pages                   │  │
│  └────────┬────────────────────────────┘  │
│           │                                │
│           │ Transaction signed by user    │
│           │                                │
│  ┌────────▼────────────────────────────┐  │
│  │  Backend (API Routes)              │  │
│  │  - /api/payments/verify            │  │
│  └────────┬────────────────────────────┘  │
└───────────┼────────────────────────────────┘
            │
            │ Read payment status
            │
┌───────────▼──────────────────────────────┐
│      PushChain Smart Contract            │
│  0x64f07b7be711b4e85043f29d4fe2e04776... │
│                                           │
│  State:                                   │
│  mapping(string => Payment) payments;     │
│                                           │
│  Functions:                               │
│  - pay(payee, productRef) payable         │
│  - verifyPayment(productRef, payer) view  │
│  - payments(productRef) view              │
└───────────────────────────────────────────┘
```

## Contract State After Payment

When a buyer pays, the contract stores:

```solidity
payments[productUuid] = Payment({
  payer: 0xBUYER_ADDRESS,
  payee: 0xCREATOR_ADDRESS,
  amount: 1.5e18,  // 1.5 PUSH in wei
  paid: true,
  timestamp: 1234567890
})
```

## Verification Logic

```typescript
// Frontend initiates verification
const response = await fetch('/api/payments/verify', {
  method: 'POST',
  body: JSON.stringify({
    productId: '550e8400-e29b-41d4-a716-446655440000',
    buyer: '0xabc...123',
    transactionHash: '0xdef...456'
  })
})

// Backend queries contract
const isPaid = await contract.verifyPayment(
  '550e8400-e29b-41d4-a716-446655440000',  // product UUID as string
  '0xabc...123'                            // buyer address
)

// Returns
{
  verified: true,  // isPaid from contract
  productUrl: 'https://...'  // from Supabase
}
```

## Security Considerations

1. **On-chain verification**: Payment status stored immutably on blockchain
2. **Address validation**: Regex checks ensure valid Ethereum addresses
3. **Product URL protection**: Only revealed after verified payment
4. **Transaction confirmation**: Wait for block confirmation before verification
5. **RLS policies**: Supabase row-level security protects product data

## Error Handling

### Payment Failures
- Insufficient balance → User notified, transaction reverted
- Network issues → Retry mechanism in wallet
- Contract error → Error displayed to user

### Verification Failures  
- Contract unreachable → 502 error returned
- Product not found → 404 error returned
- Payment not confirmed → verified: false returned

### Recovery
- Payment completed but verification failed → User can re-verify anytime
- Transaction hash stored → Can verify later using transaction
- No double-payment possible → Contract prevents duplicate payments
