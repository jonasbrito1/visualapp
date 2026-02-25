"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Baby, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/children", icon: Baby, label: "Filhos" },
  { href: "/products", icon: ShoppingBag, label: "Produtos" },
  { href: "/cart", icon: ShoppingCart, label: "Carrinho" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 md:hidden safe-area-pb">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[10px] font-semibold">{label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
