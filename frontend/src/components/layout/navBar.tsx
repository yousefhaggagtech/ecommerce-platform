"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/application/hooks/useAuth";
import { useCartStore } from "@/application/store/cartStore";
import { useCartDrawer } from "@/application/store/cartStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Nav Links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Shop All",   href: "/collections/shop-all" },
  { label: "T-Shirts",   href: "/collections/t-shirts" },
  { label: "Hoodies",    href: "/collections/hoodies" },
  { label: "Denim",      href: "/collections/denim" },
  { label: "Outerwear",  href: "/collections/outerwear" },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

export const Navbar = () => {
  const pathname        = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const totalItems      = useCartStore((state) => state.totalItems);
  const openCart        = useCartDrawer((state) => state.open);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-widest text-zinc-900 uppercase"
        >
          StyleShop
        </Link>

        {/* Nav Links — hidden on mobile */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm transition hover:text-zinc-900 ${
                  pathname.startsWith(link.href)
                    ? "font-medium text-zinc-900"
                    : "text-zinc-500"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative p-2 text-zinc-600 transition hover:text-zinc-900"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-medium text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-full p-1.5 text-sm text-zinc-600 transition hover:text-zinc-900">
                  <User className="h-5 w-5" />
                  <span className="hidden text-sm sm:block">
                    {user?.name.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    My Orders
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/dashboard"
                        className="cursor-pointer"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};