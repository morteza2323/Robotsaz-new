import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminSession } from "@/lib/auth";
import { getProjects } from "@/lib/projects";
import { getCustomPartRequests } from "@/lib/custom-part-requests";
import { AdminCustomPartRequests } from "@/components/admin-custom-part-requests";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  const [projects, requests] = await Promise.all([getProjects(), getCustomPartRequests()]);
  return <><AdminDashboard initialProjects={projects} email={session.email} /><AdminCustomPartRequests requests={requests} /></>;
}
