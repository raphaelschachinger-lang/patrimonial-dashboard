"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur de connexion");
      setLoading(false);
      return;
    }

    const from = searchParams.get("from") ?? "/patrimoine";
    router.push(from);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs border-t hairline pt-8">
      <h1 className="mb-8 text-lg font-medium tracking-tight">Patrimoine</h1>

      <label className="mb-2 block text-sm text-muted" htmlFor="password">
        Mot de passe
      </label>
      <input
        id="password"
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full border-b hairline bg-transparent pb-2 text-foreground outline-none focus:border-accent"
      />

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={loading || password.length === 0}
        className="w-full border hairline py-2 text-sm text-foreground transition-opacity hover:opacity-70 disabled:opacity-40"
      >
        {loading ? "…" : "Entrer"}
      </button>
    </form>
  );
}
