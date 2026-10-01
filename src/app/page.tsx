import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  Lightbulb,
  Droplets,
  Route,
  Trash2,
} from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-layout";
export default function Home() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="home-hero">
          <Image
            src="/city.jpg"
            fill
            priority
            sizes="100vw"
            alt="A city skyline surrounded by green neighborhoods"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow light">
              <MapPin size={15} /> EVERY NEIGHBORHOOD MATTERS
            </p>
            <h1>CityCare</h1>
            <p>
              A better city starts
              <br />
              with a little care.
            </p>
            <div className="hero-actions">
              <Link href="/dashboard/new" className="button lime">
                Report an issue <ArrowUpRight size={18} />
              </Link>
              <Link href="/services" className="hero-link">
                Explore city services <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <span className="hero-caption">Small actions. Lasting change.</span>
        </section>
        <section className="public-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR CITY, CONNECTED</p>
              <h2>What needs attention?</h2>
            </div>
            <Link href="/services" className="text-link">
              All services <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="service-grid">
            {[
              {
                name: "Roads & sidewalks",
                icon: Route,
                text: "Potholes, damaged paths, and road hazards.",
              },
              {
                name: "Street lighting",
                icon: Lightbulb,
                text: "Broken lights and dark public spaces.",
              },
              {
                name: "Water & drainage",
                icon: Droplets,
                text: "Leaks, blocked drains, and standing water.",
              },
              {
                name: "Waste & sanitation",
                icon: Trash2,
                text: "Missed collections and public cleanliness.",
              },
            ].map((s) => (
              <Link href="/dashboard/new" className="service-item" key={s.name}>
                <s.icon size={25} />
                <h3>{s.name}</h3>
                <p>{s.text}</p>
                <ArrowUpRight size={19} />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
