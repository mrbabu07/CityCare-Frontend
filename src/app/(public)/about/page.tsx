import Link from "next/link";
export const metadata = {
  title: "About",
  description:
    "The purpose behind CityCare: connecting citizens with the teams that care for their neighborhoods.",
};
export default function About() {
  return (
    <>
      <p className="eyebrow">OUR SHARED RESPONSIBILITY</p>
      <h1>A city worth caring for.</h1>
      <p>
        Our neighborhoods are more than addresses. They are the streets we walk,
        the parks we share, and the places we call home. Keeping them in good
        shape takes a shared effort.
      </p>
      <h2>A voice for every neighborhood</h2>
      <p>
        CityCare connects everyday observations with the teams responsible for
        resolving them. Citizens raise concerns, city administrators coordinate
        the work, and service staff keep progress visible.
      </p>
      <h2>Accountability, from start to finish</h2>
      <p>
        Every request has a history. Department assignments, service targets,
        and progress updates make the work visible. Citizen feedback closes the
        loop after an issue is resolved.
      </p>
      <Link className="button primary" href="/register">
        Join CityCare
      </Link>
    </>
  );
}
