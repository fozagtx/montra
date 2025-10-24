import { SignUpForm } from "@/components/auth/signupForm";

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"></div>
        <SignUpForm />
      </div>
    </div>
  );
}
