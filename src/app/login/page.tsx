import { LoginButton } from "@/components/auth/LoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-xl shadow-black/5 p-8 flex flex-col gap-8">
          {/* Logo + Branding */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                SyncDocs
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Your collaborative workspace
              </p>
            </div>
          </div>

          {/* Divider with text */}
          <div className="flex flex-col gap-4">
            <p className="text-xs text-center text-gray-400 font-medium uppercase tracking-wider">
              Sign in to continue
            </p>
            <LoginButton />
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By signing in, you agree to our{" "}
            <span className="text-gray-600 underline underline-offset-2 cursor-pointer hover:text-gray-900 transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-gray-600 underline underline-offset-2 cursor-pointer hover:text-gray-900 transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>

        {/* Below card tagline */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Secure sign-in powered by Google
        </p>
      </div>
    </div>
  );
}
