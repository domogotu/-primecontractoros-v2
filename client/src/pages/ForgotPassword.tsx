import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get("email") || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true);
    const response = await fetch("/api/auth/request-password-reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json().catch(() => ({}));
    setMessage(result.message || "If an active account matches that email, a password reset link has been sent."); setLoading(false);
  }
  return <main className="min-h-screen flex items-center justify-center bg-white p-4"><div className="w-full max-w-md space-y-6"><h1 className="text-3xl font-bold">Replace your password</h1><p className="text-gray-500">We will email you a secure, single-use link that expires in 30 minutes.</p><form onSubmit={submit} className="space-y-4"><Label htmlFor="email">Email address</Label><Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />{message && <div role="status" className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}<Button type="submit" disabled={loading} className="w-full">{loading ? "Sending…" : "Send password reset link"}</Button></form><button onClick={() => navigate("/login")} className="w-full text-sm text-primary hover:underline">Back to sign in</button></div></main>;
}
