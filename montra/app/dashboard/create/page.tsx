import { CreateProductForm } from "@/components/createProductForm";

export default function CreatePage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-b from-[#F9FAFB] to-[#F0F2F5] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-soft-light" />
      <main className="flex-1 p-8 relative z-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Add A New Product
            </h2>
          </div>
          <CreateProductForm />
        </div>
      </main>
    </div>
  );
}
