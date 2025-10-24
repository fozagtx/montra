"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function CreateProductForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const title = (formData.get("title") as string).trim();
      const description = (formData.get("description") as string).trim();
      const productUrl = (formData.get("productUrl") as string).trim();
      const paymentAddress = (formData.get("paymentAddress") as string).trim();
      const priceUsdcStr = (formData.get("priceUsdc") as string).trim();
      const creatorName =
        (formData.get("creatorName") as string).trim() || null;
      const creatorEmail =
        (formData.get("creatorEmail") as string).trim() || null;

      if (
        !title ||
        !description ||
        !productUrl ||
        !paymentAddress ||
        !priceUsdcStr
      ) {
        throw new Error("Please fill in all required fields.");
      }

      const priceUsdc = parseFloat(priceUsdcStr);
      if (isNaN(priceUsdc) || priceUsdc <= 0) {
        throw new Error("Price must be a positive number.");
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          productUrl,
          paymentAddress,
          priceUsdc,
          creatorName,
          creatorEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.details || errorData.error || "Failed to create product.";
        throw new Error(errorMessage);
      }

      const { productId } = await response.json();
      if (!productId) {
        throw new Error("Product ID not returned by server.");
      }

      router.push(`/dashboard/success?id=${productId}`);
    } catch (error) {
      console.error("[v0] Error creating product:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create product. Please try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F9FAFB] to-[#F0F2F5] overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-soft-light" />

      <Card className="relative w-full max-w-2xl rounded-2xl bg-white/80 backdrop-blur-xl  border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 z-10">
        <CardHeader>
          {/*<CardTitle className="text-xl font-semibold text-gray-900">
            Add A New Digital Product
          </CardTitle>*/}
          {/*<CardDescription className="text-gray-500">
            Fill out the details for your digital product
          </CardDescription>*/}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="My Awesome Digital Product"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what buyers will get..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productUrl">Product URL</Label>
              <Input
                id="productUrl"
                name="productUrl"
                type="url"
                placeholder="https://example.com/download/product"
                required
              />
              <p className="text-sm text-gray-500">
                Link where buyers can access the product after payment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAddress">Your Base Wallet Address</Label>
              <Input
                id="paymentAddress"
                name="paymentAddress"
                placeholder="0x..."
                pattern="^0x[a-fA-F0-9]{40}$"
                required
              />
              <p className="text-sm text-gray-500">
                USDC payments will be sent to this address on Base
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceUsdc">Price (USDC)</Label>
              <Input
                id="priceUsdc"
                name="priceUsdc"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="9.99"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="creatorName">Your Name (Optional)</Label>
                <Input
                  id="creatorName"
                  name="creatorName"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creatorEmail">Your Email (Optional)</Label>
                <Input
                  id="creatorEmail"
                  name="creatorEmail"
                  type="email"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-black text-white hover:bg-gray-900 transition-all font-medium"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Product…
                </>
              ) : (
                "Add product"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
