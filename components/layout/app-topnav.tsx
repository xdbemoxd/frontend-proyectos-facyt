"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, visibleEntries, type NavItem } from "./nav-items";

export type NavUser = {
  name: string;
  email: string;
  rol: string | null;
};

type AppTopNavProps = {
  user: NavUser;
  signOutAction: () => Promise<void>;
};

const linkBase =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring";
const linkIdle = "text-foreground/70 hover:bg-accent hover:text-accent-foreground";
const linkActive = "bg-accent font-medium text-accent-foreground";

/** Menu superior (solo con sesion). Desplegables en escritorio, lista en movil. */
export function AppTopNav({ user, signOutAction }: AppTopNavProps) {
  const pathname = usePathname();
  const entries = visibleEntries(user.rol);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Ruta activa = el href mas largo que coincide con la URL.
  const allHrefs = entries.flatMap((e) => (e.type === "item" ? [e.item.href] : e.items.map((i) => i.href)));
  const activeHref = allHrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  // Cerrar menus al navegar
  useEffect(() => {
    setOpenSection(null);
    setMobileOpen(false);
  }, [pathname]);

  // Cerrar con clic fuera o Escape
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenSection(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenSection(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function ItemLink({ item, className }: { item: NavItem; className?: string }) {
    const Icon = item.icon;
    const isActive = item.href === activeHref;
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(linkBase, isActive ? linkActive : linkIdle, className)}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {item.label}
      </Link>
    );
  }

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 border-b print:hidden bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="shrink-0 font-heading font-semibold">
          Control de Proyectos
        </Link>

        {/* Escritorio */}
        <nav aria-label="Menú principal" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {entries.map((entry) => {
              if (entry.type === "item") {
                return (
                  <li key={entry.item.href}>
                    <ItemLink item={entry.item} />
                  </li>
                );
              }
              const isOpen = openSection === entry.title;
              const hasActive = entry.items.some((i) => i.href === activeHref);
              const menuId = `menu-${entry.title}`;
              return (
                <li key={entry.title} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={menuId}
                    onClick={() => setOpenSection(isOpen ? null : entry.title)}
                    className={cn(linkBase, hasActive ? linkActive : linkIdle)}
                  >
                    {entry.title}
                    <ChevronDown
                      className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <ul
                      id={menuId}
                      className="absolute left-0 top-full mt-2 w-64 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
                    >
                      {entry.items.map((item) => (
                        <li key={item.href}>
                          <ItemLink item={item} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuario (escritorio) */}
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <div className="text-right">
            <p className="max-w-48 truncate text-sm font-medium">{user.name}</p>
            {user.rol && (
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.rol] ?? user.rol}</p>
            )}
          </div>
          <form action={signOutAction}>
            <button type="submit" className={cn(linkBase, linkIdle)} title="Cerrar sesión">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only">Cerrar sesión</span>
            </button>
          </form>
        </div>

        {/* Boton movil */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className={cn(linkBase, linkIdle, "ml-auto lg:hidden")}
        >
          {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          <span className="sr-only">{mobileOpen ? "Cerrar menú" : "Abrir menú"}</span>
        </button>
      </div>

      {/* Menu movil */}
      {mobileOpen && (
        <nav id="mobile-menu" aria-label="Menú principal" className="border-t px-4 pb-4 lg:hidden">
          {entries.map((entry) =>
            entry.type === "item" ? (
              <div key={entry.item.href} className="pt-2">
                <ItemLink item={entry.item} />
              </div>
            ) : (
              <div key={entry.title} className="pt-3">
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {entry.title}
                </p>
                {entry.items.map((item) => (
                  <ItemLink key={item.href} item={item} />
                ))}
              </div>
            ),
          )}
          <div className="mt-4 border-t pt-3">
            <p className="truncate px-3 text-sm font-medium">{user.name}</p>
            <p className="truncate px-3 text-xs text-muted-foreground">{user.email}</p>
            <form action={signOutAction} className="mt-2">
              <button type="submit" className={cn(linkBase, linkIdle, "w-full")}>
                <LogOut className="size-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}
