import { auth } from "@/auth";
import SideNav from "@/components/ui/dashboard/sidenav";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div className="flex min-h-svh">
      <aside className="w-64">
        <SideNav />
      </aside>
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-medium">Hola, {session?.user?.name}</h1>
        <p className="text-sm text-muted-foreground">
          {session?.user?.email} · rol: {session?.user?.rol ?? "sin rol"}
        </p>
      </main>
    </div>
  );
}
