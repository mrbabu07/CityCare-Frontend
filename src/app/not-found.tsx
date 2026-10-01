import Link from "next/link";
import { Brand } from "@/components/ui";
export default function NotFound() {
  return (
    <main className="not-found">
      <Brand />
      <p className="eyebrow">404 / A WRONG TURN</p>
      <h1>This street leads nowhere.</h1>
      <p>The page may have moved, or the address is incorrect.</p>
      <Link className="button primary" href="/">
        Back to CityCare
      </Link>
    </main>
  );
}
