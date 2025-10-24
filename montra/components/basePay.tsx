import { CustomPayButton } from "@/components/ui/customPayButton";

export function ProductPayButton({
  amount,
  to,
  productUrl,
}: {
  amount: number;
  to: string;
  productUrl: string;
}) {
  return <CustomPayButton amount={amount} to={to} productUrl={productUrl} />;
}
