import Image from "next/image";
import { Brand } from "@/components/ui";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-layout">
      <aside className="auth-photo">
        <Image
          src="/city.jpg"
          alt="Connected city neighborhoods"
          fill
          sizes="45vw"
          priority
        />
        <div className="hero-shade" />
        <div className="auth-photo-copy">
          <Brand />
          <div>
            <span className="eyebrow light">
              BUILT AROUND YOUR NEIGHBORHOOD
            </span>
            <h2>
              A city we care for.
              <br />A place we call home.
            </h2>
          </div>
          <span>Every report is a step toward a better city.</span>
        </div>
      </aside>
      <section className="auth-main">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <div className="auth-form">{children}</div>
        <p className="auth-footer">
          CityCare &middot; Connected communities, better cities.
        </p>
      </section>
    </main>
  );
}
