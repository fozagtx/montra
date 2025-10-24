"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Copy, ExternalLink, Share2 } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get("id")
  const [copied, setCopied] = useState(false)
  const [shareableLinkCopied, setShareableLinkCopied] = useState(false)
  
  const productUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/product/${productId}`
    : ""

  useEffect(() => {
    if (!productId) {
      router.push("/dashboard/create")
    }
  }, [productId, router])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out my product",
          url: productUrl,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      await navigator.clipboard.writeText(productUrl)
      setShareableLinkCopied(true)
      setTimeout(() => setShareableLinkCopied(false), 2000)
    }
  }

  if (!productId) {
    return null
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <h1 className="text-xl font-semibold">Product Created</h1>
      </header>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mb-3 text-3xl font-bold">Product Created Successfully!</h2>
            <p className="text-lg text-muted-foreground">
              Your payment link is ready to share with customers
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Shareable Payment Link
              </CardTitle>
              <CardDescription>
                Share this link with your customers so they can pay you with USDC on Base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={productUrl}
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopy} variant="outline" size="icon" className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              {copied && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Link copied to clipboard!
                </p>
              )}

              <div className="flex gap-2">
                <Button onClick={handleShare} variant="secondary" className="flex-1 gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Link
                </Button>
                <Button 
                  onClick={() => window.open(productUrl, "_blank")} 
                  variant="outline" 
                  className="flex-1 gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Product
                </Button>
              </div>

              {shareableLinkCopied && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Link copied to clipboard!
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Share your payment link</p>
                    <p className="text-sm text-muted-foreground">
                      Send the link to your customers via email, social media, or your website
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Customers pay with USDC</p>
                    <p className="text-sm text-muted-foreground">
                      They'll click "Pay" and complete the transaction on Base network
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Get paid instantly</p>
                    <p className="text-sm text-muted-foreground">
                      USDC is sent directly to your wallet address on Base
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button onClick={() => router.push("/dashboard/create")} variant="outline" className="flex-1">
                  Create Another Product
                </Button>
                <Button onClick={() => router.push("/dashboard")} className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CreateSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
