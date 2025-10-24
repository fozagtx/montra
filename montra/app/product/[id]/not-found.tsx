import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PackageX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mb-6 inline-flex rounded-full bg-muted p-6">
          <PackageX className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="mb-3 text-4xl font-bold">Product Not Found</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
