import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPushChainConfig, getPushChainPublicClient } from "@/lib/pushchain/config";
import { uuidToBigInt } from "@/lib/pushchain/helpers";

export const dynamic = "force-dynamic";

type VerifyRequestPayload = {
  productId?: string;
  buyer?: string;
  transactionHash?: string;
};

export async function POST(request: Request) {
  try {
    const { productId, buyer, transactionHash }: VerifyRequestPayload = await request.json();

    if (!productId || !buyer) {
      return NextResponse.json(
        { error: "productId and buyer are required" },
        { status: 400 },
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(buyer)) {
      return NextResponse.json(
        { error: "buyer must be a valid EVM address" },
        { status: 400 },
      );
    }

    let productBigInt: bigint;
    try {
      productBigInt = uuidToBigInt(productId);
    } catch (error) {
      console.error("[payments.verify] Invalid product id provided", error);
      return NextResponse.json(
        { error: "Invalid product identifier" },
        { status: 400 },
      );
    }

    const { contract } = getPushChainConfig();
    const publicClient = getPushChainPublicClient();

    let purchaseConfirmed = false;
    try {
      const result = await publicClient.readContract({
        abi: contract.abi,
        address: contract.address,
        functionName: contract.verifyFunction as any,
        args: [buyer as `0x${string}`, productBigInt] as const,
      });

      purchaseConfirmed = Boolean(result);
    } catch (error) {
      console.error("[payments.verify] Failed to read contract", error);
      return NextResponse.json(
        { error: "Unable to verify purchase on-chain" },
        { status: 502 },
      );
    }

    if (!purchaseConfirmed) {
      return NextResponse.json({ verified: false });
    }

    const supabase = await getSupabaseServerClient();
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, product_url, price_usdc")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("[payments.verify] Failed to load product", productError);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    if (transactionHash) {
      try {
        await supabase
          .from("payments")
          .upsert(
            {
              product_id: productId,
              transaction_hash: transactionHash,
              buyer_address: buyer,
              amount_usdc: product.price_usdc,
              status: "confirmed",
            },
            { onConflict: "transaction_hash" },
          );
      } catch (error) {
        console.error("[payments.verify] Failed to upsert payment record", error);
      }
    }

    return NextResponse.json({
      verified: true,
      productUrl: product.product_url,
    });
  } catch (error) {
    console.error("[payments.verify] Unexpected error", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
