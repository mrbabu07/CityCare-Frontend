import Link from "next/link";
import { Brand } from "./ui";
import { Menu } from "lucide-react";
export function PublicHeader() {
  return (
    <header className="public-header">
      <Brand />
      <nav aria-label="Main navigation">
        <Link href="/services">Services</Link>
        <Link href="/about">About</Link>
        <Link href="/faq">Help</Link>
      </nav>
      <details className="public-mobile-menu">
        <summary
          className="icon-button"
          aria-label="Open navigation"
          title="Navigation"
        >
          <Menu size={22} />
        </summary>
        <nav aria-label="Mobile navigation">
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">Help</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </details>
      <Link className="button primary" href="/login">
        Sign in
      </Link>
    </header>
  );
}
export function PublicFooter() {
  return (
    <footer className="public-footer">
      <Brand />
      <p>Better neighborhoods. Together.</p>
      <nav>
        <Link href="/contact">Contact</Link>
        <Link href="/faq">Help center</Link>
      </nav>
      <small>CityCare &copy; {new Date().getFullYear()}</small>
    </footer>
  );
}
