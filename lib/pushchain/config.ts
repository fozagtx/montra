import "server-only";

import fs from "node:fs";
import path from "node:path";
import { Abi, Chain, PublicClient, createPublicClient, defineChain, http } from "viem";

export type PushChainNetworkConfig = {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl?: string;
  walletNetwork?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

export type PushChainContractConfig = {
  address: `0x${string}`;
  abi: Abi;
  purchaseFunction: string;
  verifyFunction: string;
  paymentTokenDecimals: number;
};

type PushChainConfigDocument = {
  network: PushChainNetworkConfig;
  contract: PushChainContractConfig;
};

let cachedConfig: PushChainConfigDocument | null = null;
let cachedChain: Chain | null = null;
let cachedPublicClient: PublicClient | null = null;

function parseContractMarkdown(): PushChainConfigDocument {
  if (cachedConfig) {
    return cachedConfig;
  }

  const filePath = path.join(process.cwd(), "contract.md");
  const contents = fs.readFileSync(filePath, "utf8");
  const jsonBlockMatch = contents.match(/```json\s*([\s\S]*?)\s*```/i);

  if (!jsonBlockMatch) {
    throw new Error("PushChain configuration JSON block not found in contract.md");
  }

  const raw = JSON.parse(jsonBlockMatch[1]);

  const rpcUrl: string | undefined = raw?.network?.rpcUrl ?? process.env.NEXT_PUBLIC_PUSHCHAIN_RPC_URL;
  const chainId: number = Number(raw?.network?.chainId ?? process.env.NEXT_PUBLIC_PUSHCHAIN_CHAIN_ID);

  if (!rpcUrl) {
    throw new Error("PushChain RPC URL missing from contract.md configuration");
  }

  if (!chainId || Number.isNaN(chainId)) {
    throw new Error("PushChain chain id missing from contract.md configuration");
  }

  const network: PushChainNetworkConfig = {
    name: raw?.network?.name ?? "Push Testnet Donut",
    chainId,
    rpcUrl,
    explorerUrl: raw?.network?.explorerUrl ?? process.env.NEXT_PUBLIC_PUSHCHAIN_EXPLORER_URL,
    walletNetwork: raw?.network?.walletNetwork ?? process.env.NEXT_PUBLIC_PUSHCHAIN_NETWORK_KEY,
    nativeCurrency: raw?.network?.nativeCurrency,
  };

  const address: string | undefined = raw?.contract?.address ?? process.env.NEXT_PUBLIC_MONTRA_CONTRACT;
  if (!address) {
    throw new Error("PushChain contract address missing from contract.md configuration");
  }

  const abi: Abi | undefined = Array.isArray(raw?.contract?.abi) ? (raw.contract.abi as Abi) : undefined;
  if (!abi) {
    throw new Error("PushChain contract ABI missing from contract.md configuration");
  }

  const contract: PushChainContractConfig = {
    address: address as `0x${string}`,
    abi,
    purchaseFunction: raw?.contract?.purchaseFunction ?? "purchaseProduct",
    verifyFunction: raw?.contract?.verifyFunction ?? "hasPurchased",
    paymentTokenDecimals: Number(raw?.contract?.paymentTokenDecimals ?? 6),
  };

  cachedConfig = { network, contract };
  return cachedConfig;
}

function getDefinedChain(): Chain {
  if (cachedChain) {
    return cachedChain;
  }

  const { network } = parseContractMarkdown();

  cachedChain = defineChain({
    id: network.chainId,
    name: network.name,
    network: network.name.toLowerCase().replace(/\s+/g, "-"),
    nativeCurrency:
      network.nativeCurrency ?? {
        name: "Push",
        symbol: "PUSH",
        decimals: 18,
      },
    rpcUrls: {
      default: {
        http: [network.rpcUrl],
      },
      public: {
        http: [network.rpcUrl],
      },
    },
    blockExplorers: network.explorerUrl
      ? {
          default: {
            name: network.name,
            url: network.explorerUrl,
          },
        }
      : undefined,
  });

  return cachedChain;
}

export function getPushChainConfig(): PushChainConfigDocument {
  return parseContractMarkdown();
}

export function getPushChainPublicClient(): PublicClient {
  if (cachedPublicClient) {
    return cachedPublicClient;
  }

  const { network } = parseContractMarkdown();

  cachedPublicClient = createPublicClient({
    chain: getDefinedChain(),
    transport: http(network.rpcUrl),
  });

  return cachedPublicClient;
}

export function getWalletNetworkKey(): string | undefined {
  const { network } = parseContractMarkdown();
  return network.walletNetwork;
}
