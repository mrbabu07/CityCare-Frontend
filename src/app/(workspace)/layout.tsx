import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server";
import { WorkspaceShell } from "@/components/workspace-shell";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  return <WorkspaceShell user={user}>{children}</WorkspaceShell>;
}
