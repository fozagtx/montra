"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function useProduct(productRef: string) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productRef) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").eq("id", productRef).single();

      if (error) setError(error.message);
      else setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [productRef]);

  return { product, loading, error };
}
