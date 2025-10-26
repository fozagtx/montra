````md
# Montra

A platform that empowers creators to monetize digital content and Discord communities through seamless crypto payments on **PushChain**.

## Overview

**Montra** enables creators to sell digital products or gated community access using fast, low-cost crypto payments across multiple EVM networks.  
Creators can launch monetization pages, manage payments, and link Discord roles or content access automatically — all powered by **PushChain’s** multichain payment infrastructure.

## Features

- **Digital Product Sales:** Upload and sell digital goods with instant crypto payments.  
- **PushChain Integration:** Receive payments directly to your wallet with cross-chain support and low fees.  
- **Dashboard Analytics:** Track sales, revenue, and blockchain transactions in a clean, modern dashboard.  
- **Discord Monetization (Coming Soon):** Connect Discord servers to sell access or roles via PushChain.  
- **Modern UI:** Built with Next.js, Tailwind CSS, and shadcn/ui for a clean, professional experience.  
- **Multichain Support:** Built on PushChain to seamlessly serve users across Base, Ethereum, Polygon, and other EVM-compatible chains.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS  
- **UI Components:** shadcn/ui  
- **Auth & Database:** Supabase  
- **Payments:** PushChain SDK (universal payment layer)  
- **Styling Enhancements:** Gradients, soft shadows, and subtle textures for refined visual depth  

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/fozagtx/montra.git
cd montra
npm install
````

Set environment variables:

```
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

**Montra** — build once, earn everywhere with multichain payments powered by PushChain.

```
```
