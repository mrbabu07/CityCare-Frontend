import Link from "next/link";
export const metadata = {
  title: "Contact & support",
  description:
    "Find the right place for a service request or a CityCare technical issue.",
};
export default function Contact() {
  return (
    <>
      <p className="eyebrow">GET IN TOUCH</p>
      <h1>The right place for your concern.</h1>
      <h2>A neighborhood issue</h2>
      <p>
        Submit a service request so the responsible department can review it and
        coordinate the work.
      </p>
      <Link href="/dashboard/new" className="button primary">
        Report an issue
      </Link>
      <h2>A question about CityCare</h2>
      <p>
        Find answers about your account, attachments, request updates, and
        priority payments.
      </p>
      <Link className="text-link" href="/faq">
        Visit the help center
      </Link>
      <h2>A technical problem</h2>
      <p>
        Report software issues to the project maintainers. Please do not include
        passwords, payment details, or other sensitive information in a public
        report.
      </p>
      <a
        className="text-link"
        href="https://github.com/mrbabu07/CityCare-Backend/issues"
        target="_blank"
        rel="noreferrer"
      >
        Open the project issue tracker
      </a>
    </>
  );
}
