import Link from "next/link";
export const metadata = {
  title: "City services",
  description:
    "Neighborhood service requests, maintenance reporting, and priority service.",
};
export default function Services() {
  return (
    <>
      <p className="eyebrow">NEIGHBORHOOD SERVICES</p>
      <h1>The everyday things that matter.</h1>
      <p>
        From public infrastructure to neighborhood maintenance, CityCare brings
        local concerns into one shared service workflow. Available categories
        are managed by your city administration.
      </p>
      <h2>Report a service issue</h2>
      <p>
        Provide the location and a description of the problem. Supporting photos
        or documents help the service team understand what needs attention.
      </p>
      <h2>Track the work</h2>
      <p>
        Requests move from review to assignment, work in progress, and
        resolution. Updates stay attached to the original request.
      </p>
      <h2>Priority service</h2>
      <p>
        An optional BDT 100 priority payment upgrades a request to urgent.
        Payment is processed by SSLCommerz; priority is applied only after the
        backend verifies a successful transaction.
      </p>
      <Link className="button primary" href="/dashboard/new">
        Create a service request
      </Link>
    </>
  );
}
