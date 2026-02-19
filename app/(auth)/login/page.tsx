"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Pizza image — decorative, top-right corner */}
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 select-none opacity-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pizza-slice.svg" alt="" className="h-full w-full object-contain" />
      </div>

      {/* Logo */}
      <div className="mb-10">
        <p className="font-display font-bold text-[50px] leading-none tracking-[-0.03em] text-[#1D2532]">
          NYP KPI
        </p>
        <p className="mt-2 text-[12px] font-sans font-normal uppercase tracking-[1.2px] text-[#6B6B6B]">
          Restaurant Dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-[540px] flex-col gap-7">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="font-sans text-[28px] font-bold leading-tight tracking-[-0.08em] text-[#1D2532]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="naam@restaurant.nl"
            className="w-full rounded-[5px] border border-[#E5E7EB] bg-[rgba(245,245,245,0.5)] px-4 py-2.5 font-sans text-sm text-[#1D2532] outline-none transition-all placeholder:text-[#6B6B6B] focus:border-[#009A44] focus:ring-2 focus:ring-[#009A44]/20"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="font-sans text-[28px] font-bold leading-tight tracking-[-0.08em] text-[#1D2532]"
          >
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full rounded-[5px] border border-[#E5E7EB] bg-[rgba(245,245,245,0.5)] px-4 py-2.5 font-sans text-sm text-[#1D2532] outline-none transition-all placeholder:text-[#6B6B6B] focus:border-[#009A44] focus:ring-2 focus:ring-[#009A44]/20"
          />
        </div>

        {error && (
          <p className="text-sm text-[#F3001D]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[5px] bg-[#1F1F1F] px-4 py-2.5 font-sans text-[24px] font-bold leading-tight tracking-[-0.08em] text-[#FFF6E9] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </>
  );
}
