"use client";

import {
  PushUniversalWalletProvider,
  PushUniversalAccountButton,
  usePushWalletContext,
  usePushChainClient,
  PushUI,
} from "@pushchain/ui-kit";
import { useState } from "react";
import { PushChain } from "@pushchain/core";

export function PushChainButton() {
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  };

  function Inner() {
    const [txnHash, setTxnHash] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { connectionStatus } = usePushWalletContext();
    const { pushChainClient } = usePushChainClient();

    const handleSendTransaction = async () => {
      if (!pushChainClient) return;
      setIsLoading(true);
      try {
        const res = await pushChainClient.universal.sendTransaction({
          to: "0xFaE3594C68EDFc2A61b7527164BDAe80bC302108",
          value: PushChain.utils.helpers.parseUnits("1", 18),
        });
        setTxnHash(res.hash);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div>
        <PushUniversalAccountButton />
        {connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED && (
          <button
            disabled={isLoading}
            style={{
              background: "transparent",
              border: "1px solid",
              borderRadius: "10px",
              padding: "12px 18px",
              cursor: "pointer",
              margin: "8px 0",
            }}
            onClick={handleSendTransaction}
          >
            Send Transaction
          </button>
        )}
        {txnHash && (
          <>
            <p>Txn Hash: {txnHash}</p>
            <a href={pushChainClient?.explorer.getTransactionUrl(txnHash)} target="_blank" rel="noopener noreferrer">
              View in Explorer
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <PushUniversalWalletProvider config={walletConfig}>
      <Inner />
    </PushUniversalWalletProvider>
  );
}
