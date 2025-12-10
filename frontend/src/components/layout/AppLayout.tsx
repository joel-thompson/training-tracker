import { Outlet, Link } from "@tanstack/react-router";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export function AppLayout() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </Link>
            <Link
              to="/sessions/new"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              New Session
            </Link>
            <Link
              to="/history"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              History
            </Link>
            <Link
              to="/week"
              search={{}}
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Week
            </Link>
            <Link
              to="/goals"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Goals
            </Link>
            <Link
              to="/stats"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Stats
            </Link>
            <Link
              to="/settings"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </>
  );
}
