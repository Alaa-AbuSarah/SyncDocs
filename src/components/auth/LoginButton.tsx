"use client";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/shared/Button";

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button className="w-full" onClick={handleLogin}>
      Sign in with Google
    </Button>
  );
}
