import { LoginButton } from "@/components/auth/LoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">SyncDocs</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to continue</p>
        </div>
        <LoginButton />
      </div>
    </div>
  );
}
