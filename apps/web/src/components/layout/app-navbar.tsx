"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ShoppingCart, Bell, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { useState } from "react";

interface AppNavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    id?: string;
  };
}

export function AppNavbar({ user }: AppNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glass border-b border-white/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🐢</span>
          <span className="font-black text-lg hidden sm:block">
            <span className="text-primary">Visual</span>
            <span className="text-yellow-500">App</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Início</Button>
          </Link>
          <Link href="/children">
            <Button variant="ghost" size="sm">Meus Filhos</Button>
          </Link>
          <Link href="/products">
            <Button variant="ghost" size="sm">Produtos</Button>
          </Link>
          <Link href="/orders">
            <Button variant="ghost" size="sm">Pedidos</Button>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                {getInitials(user.name || "U")}
              </div>
              <span className="hidden sm:block text-sm font-semibold max-w-[100px] truncate">
                {user.name?.split(" ")[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border z-20 py-2 animate-slide-up">
                  <div className="px-4 py-2 border-b mb-1">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                  <div className="border-t mt-1 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
