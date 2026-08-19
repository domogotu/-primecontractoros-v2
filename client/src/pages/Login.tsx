import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Login() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/app/dashboard", { replace: true });
  }, [isAuthenticated, loading, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      await refresh();
      const returnPath = new URLSearchParams(window.location.search).get("returnPath");
      window.location.href = returnPath?.startsWith("/") ? returnPath : "/app/dashboard";
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white/95">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-primary">PrimeContractorOS</button>
          <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
        </div>
      </nav>
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4 space-y-8">
          <div className="text-center space-y-2">
            <LockKeyhole className="mx-auto h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-500">Sign in securely to your PrimeContractorOS workspace</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required minLength={12} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Button type="submit" disabled={submitting} className="w-full py-6 text-lg">
              {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LockKeyhole className="mr-2 h-5 w-5" />}
              Sign In
            </Button>
          </form>
          <button type="button" onClick={() => navigate(`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`)} className="block w-full text-center text-sm text-primary hover:underline">Forgot or replace your password?</button>\n          <p className="text-center text-xs text-gray-500">Credentials are protected by salted password hashing and secure session cookies.</p>
          <Button variant="outline" onClick={() => navigate("/get-started")} className="w-full">Create Account <ArrowRight className="ml-2 h-4 w-4" /></Button>
          <p className="text-center text-sm text-gray-500">Need access help? <button onClick={() => navigate("/support")} className="text-primary hover:underline">Contact support</button></p>
        </div>
      </main>
    </div>
  );
}
