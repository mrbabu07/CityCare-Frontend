import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server";
import { roleHome } from "@/lib/types";
export default async function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(roleHome[user.role]);
  return children;
}
