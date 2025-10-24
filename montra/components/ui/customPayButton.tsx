"use client";

import { BasePayButton } from "@base-org/account-ui/react";
import { pay } from "@base-org/account";

export function CustomPayButton({
  amount,
  to,
  productUrl,
}: {
  amount: number;
  to: string;
  productUrl: string;
}) {
  const handlePayment = async () => {
    try {
      const payment = await pay({
        testnet: true,
        amount: amount.toFixed(2),
        to,
      });
      console.log(`Payment sent! Transaction ID: ${payment.id}`);
      alert(`Payment successful! Transaction ID: ${payment.id}`);
      window.open(productUrl, "_blank");
    } catch (error: any) {
      console.error(`Payment failed: ${error.message}`);
      alert(`Payment failed: ${error.message}`);
    }
  };

  return <BasePayButton colorScheme="light" onClick={handlePayment} />;
}
