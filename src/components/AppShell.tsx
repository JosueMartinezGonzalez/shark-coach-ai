import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/tiburon.png";

const NAV = [
  { to: "/", label: "Panel" },
  { to: "/chat", label: "Coach" },
  { to: "/biblioteca", label: "Biblioteca" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-body text-foreground">
      <div className="pointer-events-none absolute -top-40 left-1/4 size-[33rem] rounded-full bg-ice/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 size-[33rem] rounded-full bg-bite/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-[33rem] rounded-full bg-water-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 py-7 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Coach Tiburón"
              width={36}
              height={36}
              className="size-9 rounded-[10px] bg-water-900/60 p-0.5 ring-1 ring-white/10"
            />
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold tracking-tight">
                MORDIDA
              </span>
              <span className="-mt-0.5 block font-mono text-[11px] text-water-300">
                centro de comando
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-water-900/50 p-1 ring-1 ring-white/10 backdrop-blur-xl sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-water-200 transition-colors hover:text-water-50 [&.active]:bg-water-50 [&.active]:text-water-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/chat"
            className="flex items-center gap-2 rounded-full bg-ice/15 px-3.5 py-2 text-[13px] font-medium text-ice-2 ring-1 ring-ice/30 backdrop-blur-xl transition-transform hover:-translate-y-px"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-bite" />
            Hablar con Tiburón
          </Link>
        </header>

        {children}
      </div>
    </div>
  );
}
