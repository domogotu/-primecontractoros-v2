import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); if (password !== confirm) return setError("Passwords do not match."); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) }); const result = await response.json().catch(() => ({})); if (!response.ok) return setError(result.error || "Unable to replace password."); setMessage("Your password has been replaced. You can now sign in."); }
  return <main className="min-h-screen flex items-center justify-center bg-white p-4"><div className="w-full max-w-md space-y-6"><h1 className="text-3xl font-bold">Choose a new password</h1><form onSubmit={submit} className="space-y-4"><Label htmlFor="password">New password</Label><Input id="password" type="password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} /><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" type="password" minLength={12} required value={confirm} onChange={e => setConfirm(e.target.value)} />{error && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}{message && <div role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div>}<Button type="submit" className="w-full">Replace password</Button></form>{message && <Button variant="outline" onClick={() => navigate("/login")} className="w-full">Go to sign in</Button>}</div></main>;
}
