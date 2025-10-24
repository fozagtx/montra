````markdown
# Montra

A cross-chain payment platform built on **Push Chain**, empowering creators to monetize digital products and communities through seamless crypto transactions.

## Overview

**Montra** enables creators to sell digital products or gated community access using secure, fast, and low-cost crypto payments across multiple chains via **Push Chain** infrastructure.
Users can create payment links, manage earnings, and verify on-chain transactions directly from an intuitive dashboard.

## Features

- **Cross-Chain Payments:** Accept payments across different blockchains powered by Push Chain’s interoperability.
- **Smart Contract Verification:** On-chain proof of payment ensures trust and transparency between buyer and seller.
- **Product Payments:** Connect product URLs to verified payments for automatic content or link delivery.
- **Creator Dashboard:** Track transactions, revenue, and customer payments in real time.
- **Modern UI:** Built with Next.js, Tailwind CSS, and shadcn/ui for a minimal and elegant experience.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **UI Components:** shadcn/ui
- **Auth & Database:** Supabase
- **Payments:** Custom Smart Contract on **Push Chain**
- **Styling Enhancements:** Gradient backgrounds, glassmorphism, and smooth transitions

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/fozagtx/montra.git
cd montra
npm install
````

Create a `.env` file with the following configuration:

```bash
# Push Chain Configuration
NEXT_PUBLIC_PUSHCHAIN_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org
NEXT_PUBLIC_PUSHCHAIN_CHAIN_ID=42101
NEXT_PUBLIC_PUSHCHAIN_EXPLORER_URL=https://testnet-explorer.push.org
NEXT_PUBLIC_PUSHCHAIN_NAME=Push Testnet Donut
NEXT_PUBLIC_PUSHCHAIN_SYMBOL=PC

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
montra/
│
├── app/
│   ├── dashboard/
│   ├── product/
│   └── (auth)/
│
├── components/
│   ├── ui/
│   └── layout/
│
├── lib/
│   ├── supabase/
│   └── utils.ts
│
└── public/
    ├── logo.jpeg
    ├── discord.png
    └── noise.jpeg
```

```
```
