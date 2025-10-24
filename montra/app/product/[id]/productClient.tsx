"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CopyLinkButton } from "@/components/copyLinkButton";
import { ProductPayButton } from "@/components/basePay";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/useProduct";

export default function ProductClient({
  id,
  currentUserId,
}: {
  id: string;
  currentUserId: string | null;
}) {
  const { product, loading, error } = useProduct(id);

  if (loading) return <ProductSkeleton />;
  if (error || !product)
    return (
      <p className="text-center mt-20 text-muted-foreground">
        Product not found.
      </p>
    );

  const isCreator = currentUserId === product.user_id;
  const paymentLink = `/product/${id}`;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F9FAFB] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.1] mix-blend-soft-light" />

      <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="Monetize Logo"
              width={48}
              height={48}
              className="rounded-lg shadow-sm"
            />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Monetize
            </h1>
          </div>
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left column */}
          <div className="space-y-8">
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">
                    {product.title}
                  </h1>
                  {product.creator_name && (
                    <p className="text-sm text-gray-500">
                      by{" "}
                      <span className="font-medium text-gray-800">
                        {product.creator_name}
                      </span>
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 font-semibold px-3 py-1"
                >
                  {Number(product.price_usdc).toFixed(2)} USDC
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                About this product
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                What you'll get
              </h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                  <span className="text-gray-600">
                    Instant access to your digital content
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                  <span className="text-gray-600">
                    Secure Base network payment
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="sticky top-20">
            <Card className="shadow-sm bg-white border border-gray-100">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {isCreator ? "Your Product" : "Complete Your Purchase"}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {isCreator
                    ? "Share your payment link below"
                    : "Pay securely with USDC on Base network"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {isCreator ? (
                  <>
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                      <p className="mb-2 text-sm font-medium text-gray-800">
                        Payment Link
                      </p>
                      <p className="break-all font-mono text-sm text-gray-600">
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : ""}
                        {paymentLink}
                      </p>
                    </div>
                    <CopyLinkButton url={paymentLink} />
                  </>
                ) : (
                  <>
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
                      <p className="mb-1 font-medium text-gray-800">
                        After payment:
                      </p>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <span>
                          You’ll receive instant access to download your product
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ProductPayButton
                        amount={product.price_usdc}
                        to={product.payment_address}
                        productUrl={product.product_url}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F9FAFB] overflow-hidden animate-pulse">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.1] mix-blend-soft-light" />
      <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10">
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <Card className="p-6 bg-white border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </Card>
            <Separator />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
