import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="relative flex flex-col min-h-screen bg-[#F9FAFB] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.1] mix-blend-soft-light" />

      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-white/70 backdrop-blur-md border-b border-gray-200 px-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          My Products
        </h1>
      </header>

      <main className="flex-1 space-y-10 p-8 max-w-6xl mx-auto w-full relative z-10">
        {products && products.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="relative rounded-2xl bg-white shadow-sm border border-gray-100 p-4 transition-all duration-300 hover:shadow-md"
              >
                <CardHeader className="relative z-10">
                  <div className="mb-2 flex items-start justify-between">
                    <CardTitle className="line-clamp-2 text-gray-800 font-semibold">
                      {product.title}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-800 font-semibold"
                    >
                      {Number(product.price_usdc).toFixed(2)} USDC
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3 text-gray-500">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3 relative z-10">
                  <div className="text-sm text-gray-500">
                    Created {new Date(product.created_at).toLocaleDateString()}
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="w-full rounded-full bg-black text-white hover:bg-gray-900 transition-all font-medium flex items-center justify-center"
                  >
                    <Link href={`/product/${product.id}`}>
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View Product
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="relative rounded-2xl bg-white shadow-sm border border-gray-100 p-8 transition-all duration-300 text-center">
            <CardContent className="relative z-10 flex flex-col items-center justify-center py-12">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                No products yet
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Create your first product to start accepting payments
              </p>
              <Button
                asChild
                className="relative bg-black text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-gray-900"
              >
                <Link href="/dashboard/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
