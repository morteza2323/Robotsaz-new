import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminSession } from "@/lib/auth";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  const projects = await getProjects();
  return <AdminDashboard initialProjects={projects} email={session.email} />;
}
