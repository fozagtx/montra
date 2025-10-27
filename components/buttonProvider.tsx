"use client";

import {
  PushUniversalAccountButton,
  PushUniversalWalletProvider,
  PushUI,
  usePushChainClient,
  usePushWalletContext,
} from "@pushchain/ui-kit";
import type {
  PushChainContractConfig,
  PushChainNetworkConfig,
} from "@/lib/pushchain/config";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Unlock } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { encodeFunctionData, parseUnits } from "viem";

type PushChainButtonProps = {
  productId: string;
  productTitle: string;
  priceUsdc: string;
  payoutAddress: `0x${string}`;
  contract: PushChainContractConfig;
  network: PushChainNetworkConfig;
};

type InnerButtonProps = PushChainButtonProps & {
  explorerBaseUrl?: string;
};

const CONNECTION_STATUS = PushUI.CONSTANTS.CONNECTION.STATUS;

type WalletNetworkValue = (typeof PushUI.CONSTANTS.PUSH_NETWORK)[keyof typeof PushUI.CONSTANTS.PUSH_NETWORK];

function resolveWalletNetwork(key?: string): WalletNetworkValue {
  const fallback =
    PushUI.CONSTANTS.PUSH_NETWORK.TESTNET_DONUT ??
    PushUI.CONSTANTS.PUSH_NETWORK.TESTNET ??
    PushUI.CONSTANTS.PUSH_NETWORK.MAINNET;

  const normalised = key?.toUpperCase();
  switch (normalised) {
    case "MAINNET":
      return PushUI.CONSTANTS.PUSH_NETWORK.MAINNET;
    case "TESTNET":
      return PushUI.CONSTANTS.PUSH_NETWORK.TESTNET ?? fallback;
    case "LOCALNET":
      return PushUI.CONSTANTS.PUSH_NETWORK.LOCALNET;
    case "TESTNET_DONUT":
      return PushUI.CONSTANTS.PUSH_NETWORK.TESTNET_DONUT ?? fallback;
    default:
      return fallback;
  }
}

function formatPriceDisplay(amount: string) {
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) {
    return amount;
  }
  return numeric.toFixed(2);
}

function InnerPurchaseButton({
  productId,
  productTitle,
  priceUsdc,
  payoutAddress,
  contract,
  explorerBaseUrl,
}: InnerButtonProps) {
  const { pushChainClient } = usePushChainClient();
  const {
    connectionStatus,
    universalAccount,
    handleConnectToPushWallet,
  } = usePushWalletContext();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [purchaseVerified, setPurchaseVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastCheckedAddress = useRef<string | null>(null);

  const canPurchase =
    connectionStatus === CONNECTION_STATUS.CONNECTED &&
    Boolean(universalAccount?.address);

  const verifyAccess = useCallback(
    async (hash?: string) => {
      if (!universalAccount?.address) {
        return false;
      }

      setIsVerifying(true);
      setError(null);
      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            buyer: universalAccount.address,
            transactionHash: hash,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Verification failed");
        }

        if (payload.verified) {
          setAccessUrl(payload.productUrl ?? null);
          setPurchaseVerified(true);
          return true;
        }

        setPurchaseVerified(false);
        setAccessUrl(null);
        return false;
      } catch (err) {
        console.error("[PushChainButton] verification failed", err);
        setError(err instanceof Error ? err.message : "Verification failed");
        setAccessUrl(null);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [productId, universalAccount?.address],
  );

  useEffect(() => {
    if (
      connectionStatus !== CONNECTION_STATUS.CONNECTED ||
      !universalAccount?.address
    ) {
      return;
    }

    if (lastCheckedAddress.current === universalAccount.address) {
      return;
    }

    const address = universalAccount.address;
    lastCheckedAddress.current = address;
    void (async () => {
      const success = await verifyAccess();
      if (!success) {
        lastCheckedAddress.current = null;
      }
    })();
  }, [connectionStatus, universalAccount?.address, verifyAccess]);

  const handlePurchase = useCallback(async () => {
    if (!pushChainClient) {
      setError("Wallet client is not ready yet. Please retry.");
      return;
    }

    if (!canPurchase) {
      await handleConnectToPushWallet();
      return;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      const amount = parseUnits(priceUsdc, contract.paymentTokenDecimals);

      const data = encodeFunctionData({
        abi: contract.abi,
        functionName: contract.purchaseFunction as any,
        args: [payoutAddress, productId] as const,
      });

      const response = await pushChainClient.universal.sendTransaction({
        to: contract.address,
        data: data as `0x${string}`,
        value: amount,
      });

      const hash = typeof response === "string" ? response : response.hash;
      setTxHash(hash);

      if (typeof response !== "string" && typeof response.wait === "function") {
        await response.wait();
      }

      await verifyAccess(hash);
    } catch (err) {
      console.error("[PushChainButton] purchase failed", err);
      setError(
        err instanceof Error ? err.message : "Unable to process payment",
      );
    } finally {
      setIsPurchasing(false);
    }
  }, [
    pushChainClient,
    canPurchase,
    handleConnectToPushWallet,
    priceUsdc,
    contract,
    productId,
    payoutAddress,
    verifyAccess,
  ]);

  const explorerUrl = useMemo(() => {
    if (!txHash) {
      return null;
    }

    if (pushChainClient?.explorer) {
      return pushChainClient.explorer.getTransactionUrl(txHash);
    }

    if (explorerBaseUrl) {
      return `${explorerBaseUrl.replace(/\/$/, "")}/tx/${txHash}`;
    }

    return null;
  }, [txHash, pushChainClient?.explorer, explorerBaseUrl]);

  const buttonLabel = isPurchasing
    ? "Processing payment…"
    : isVerifying
      ? "Verifying purchase…"
      : purchaseVerified
        ? "Purchase verified"
        : `Pay ${formatPriceDisplay(priceUsdc)} PUSH`;

  return (
    <div className="w-full space-y-4">
      <PushUniversalAccountButton />

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          View transaction on explorer
        </a>
      )}

      {accessUrl ? (
        <Button asChild className="w-full">
          <a href={accessUrl} target="_blank" rel="noopener noreferrer">
            <Unlock className="mr-2 h-4 w-4" />
            Access your product
          </a>
        </Button>
      ) : (
        <Button
          onClick={handlePurchase}
          className="w-full"
          disabled={isPurchasing || isVerifying}
        >
          {(isPurchasing || isVerifying) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {!(isPurchasing || isVerifying) && <Lock className="mr-2 h-4 w-4" />}
          {buttonLabel}
        </Button>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Payment unlocks access to <span className="font-medium">{productTitle}</span>.
      </p>
    </div>
  );
}

export function PushChainButton(props: PushChainButtonProps) {
  const walletNetwork = resolveWalletNetwork(props.network.walletNetwork);

  const providerConfig = useMemo(
    () => ({
      network: walletNetwork,
    }),
    [walletNetwork],
  );

  return (
    <PushUniversalWalletProvider config={providerConfig}>
      <InnerPurchaseButton
        {...props}
        explorerBaseUrl={props.network.explorerUrl}
      />
    </PushUniversalWalletProvider>
  );
}
