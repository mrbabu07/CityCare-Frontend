"use client";
import { createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  Users,
  Building2,
  Shapes,
  History,
  UserRound,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Wallet,
  CircleHelp,
} from "lucide-react";
import { Brand } from "./ui";
import { useUi } from "./providers";
import { type User, roleHome, label } from "@/lib/types";
import { toast } from "sonner";
import { RequestDraftProvider } from "./request-draft";
const UserContext = createContext<User | null>(null);
export function useUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("Session missing");
  return user;
}
export function WorkspaceShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const home = roleHome[user.role];
  const router = useRouter();
  const query = useQueryClient();
  const { sidebarOpen, setSidebarOpen } = useUi();
  const items = [
    { href: home, name: "Overview", icon: LayoutDashboard },
    {
      href: `${home}/requests`,
      name: user.role === "STAFF" ? "Assigned requests" : "Service requests",
      icon: ClipboardList,
    },
    ...(user.role === "CITIZEN"
      ? [
          { href: `${home}/new`, name: "New request", icon: Plus },
          { href: `${home}/payments`, name: "Payments", icon: Wallet },
        ]
      : []),
    ...(user.role === "ADMIN"
      ? [
          { href: "/admin/departments", name: "Departments", icon: Building2 },
          { href: "/admin/categories", name: "Categories", icon: Shapes },
          { href: "/admin/users", name: "People", icon: Users },
          { href: "/admin/reports", name: "Activity log", icon: History },
        ]
      : []),
    { href: `${home}/profile`, name: "My profile", icon: UserRound },
  ];
  async function logout() {
    try {
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (!r.ok) throw Error("Could not sign out");
      query.clear();
      setSidebarOpen(false);
      router.push("/login");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  const navigation = (
    <>
      <Brand />
      <p className="nav-caption">{label(user.role)} workspace</p>
      <nav aria-label="Workspace">
        {items.map((i) => (
          <Link
            key={i.href}
            onClick={() => setSidebarOpen(false)}
            className={
              path === i.href ||
              (i.href.endsWith("/requests") && path.startsWith(i.href + "/"))
                ? "active"
                : ""
            }
            href={i.href}
          >
            <i.icon size={18} />
            {i.name}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Link href="/faq">
          <CircleHelp size={18} />
          Help center
          <ArrowUpRight size={14} />
        </Link>
        <div className="sidebar-profile">
          <span className="avatar">{user.name.slice(0, 1)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{label(user.role)}</small>
          </div>
          <button
            className="icon-button"
            title="Sign out"
            aria-label="Sign out"
            onClick={logout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </>
  );
  return (
    <UserContext.Provider value={user}>
      <div className="workspace">
        <aside className="sidebar desktop-sidebar">{navigation}</aside>
        <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="drawer-overlay" />
            <Dialog.Content className="sidebar mobile-sidebar">
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <Dialog.Description className="sr-only">
                CityCare workspace navigation
              </Dialog.Description>
              <Dialog.Close
                className="drawer-close icon-button"
                aria-label="Close menu"
              >
                <X size={20} />
              </Dialog.Close>
              {navigation}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <div className="workspace-body">
          <header className="workspace-header">
            <div className="header-location">
              <button
                className="icon-button mobile-toggle"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={21} />
              </button>
              <span>Workspace</span>
              <span className="slash">/</span>
              <strong>
                {items.find((i) => i.href === path)?.name || "Request details"}
              </strong>
            </div>
            <Link href="/" className="text-link">
              CityCare home <ArrowUpRight size={15} />
            </Link>
          </header>
          <main className="workspace-main">
            <RequestDraftProvider key={user.id}>
              {children}
            </RequestDraftProvider>
          </main>
          <footer className="workspace-footer">
            <span>CityCare &middot; Every neighborhood matters.</span>
            <span>Built for the people.</span>
          </footer>
        </div>
      </div>
    </UserContext.Provider>
  );
}
