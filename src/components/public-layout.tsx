import Link from "next/link";
import { Brand } from "./ui";
export function PublicHeader() {
  return (
    <header className="public-header">
      <Brand />
      <nav aria-label="Main navigation">
        <Link href="/services">Services</Link>
        <Link href="/about">About</Link>
        <Link href="/faq">Help</Link>
      </nav>
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
