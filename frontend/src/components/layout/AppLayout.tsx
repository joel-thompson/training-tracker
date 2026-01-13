import { Outlet, Link, useLocation, Navigate } from "@tanstack/react-router";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { Home, Plus, Clock, MoreHorizontal, Loader2, Bot } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/about" />;
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <nav className="hidden md:flex items-center gap-6">
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
            {/* Game isn't that useful yet, so we'll hide it for now */}
            {/* <Link
              to="/game"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Game
            </Link> */}
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
              to="/coach"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Coach
            </Link>
            <Link
              to="/settings"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-8 pb-20 md:pb-8 flex flex-col h-[calc(100vh-4rem-1px)] md:h-[calc(100vh-4rem-1px)] min-h-0 overflow-hidden">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
        <div className="flex h-16 items-center justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive("/")
                ? "text-foreground"
                : "text-foreground/60 hover:text-foreground/80"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/sessions/new"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive("/sessions/new")
                ? "text-foreground"
                : "text-foreground/60 hover:text-foreground/80"
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">New</span>
          </Link>
          <Link
            to="/history"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive("/history")
                ? "text-foreground"
                : "text-foreground/60 hover:text-foreground/80"
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs font-medium">History</span>
          </Link>
          <Link
            to="/coach"
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive("/coach")
                ? "text-foreground"
                : "text-foreground/60 hover:text-foreground/80"
            }`}
          >
            <Bot className="h-5 w-5" />
            <span className="text-xs font-medium">Coach</span>
          </Link>
          <Popover>
            <PopoverTrigger
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                pathname === "/week" ||
                pathname === "/goals" ||
                pathname === "/stats" ||
                pathname === "/settings" ||
                pathname === "/game"
                  ? "text-foreground"
                  : "text-foreground/60 hover:text-foreground/80"
              }`}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs font-medium">More</span>
            </PopoverTrigger>
            <PopoverContent side="top" className="mb-2 w-48 p-2">
              <div className="flex flex-col gap-1">
                {/* Game isn't that useful yet, so we'll hide it for now */}
                {/* <Link
                  to="/game"
                  className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Game
                </Link> */}
                <Link
                  to="/week"
                  search={{}}
                  className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Week
                </Link>
                <Link
                  to="/goals"
                  className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Goals
                </Link>
                <Link
                  to="/stats"
                  className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Stats
                </Link>
                <Link
                  to="/settings"
                  className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Settings
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </>
  );
}
