import { PublicHeader, PublicFooter } from "@/components/public-layout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="article">{children}</main>
      <PublicFooter />
    </>
  );
}
