# Monetize

A platform that empowers creators to monetize digital content and Discord communities through seamless crypto payments on **Base**.

## Overview

**Monetize** lets you sell digital products or gated community access using fast, low-cost USDC payments on the Base blockchain.
Creators can launch their own monetization pages, manage payments, and link Discord roles or content access automatically.

## Features

- **Digital Product Sales:** Upload and sell any digital product with instant USDC payments.
- **Base Blockchain Integration:** Receive USDC directly to your Base wallet, with near-zero gas fees.
- **Dashboard Analytics:** Track product sales, total revenue, and recent transactions in a clean, minimal dashboard.
- **Discord Monetization (Coming Soon):** Connect Discord servers to sell community access or roles using crypto.
- **Modern UI:** Built with Next.js, Tailwind CSS, and shadcn/ui for a smooth and modern experience.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **UI Components:** shadcn/ui
- **Auth & Database:** Supabase
- **Payments:** Base Pay sdk (USDC)
- **Styling Enhancements:** CSS noise texture, smooth gradients, and blurred cards

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/fozagtx/monetize.git
cd monetize
npm install

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

monetize/
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
