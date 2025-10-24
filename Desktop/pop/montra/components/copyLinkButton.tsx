"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CopyLinkButtonProps {
  url: string
  text?: string
}

export function CopyLinkButton({ url, text = "Copy Payment Link" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button 
      onClick={handleCopy} 
      variant="outline" 
      className="w-full gap-2"
      size="lg"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  )
}
