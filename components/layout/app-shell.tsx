import { auth, signOut } from "@/auth";
import { Header } from "./header";
import { AppTopNav } from "./app-topnav";

/**
 * Con sesion: menu superior + contenido.
 * Sin sesion: solo la barra con "Iniciar sesión" (sin menu).
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return (
      <>
        <Header />
        {children}
      </>
    );
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <>
      <AppTopNav
        user={{
          name: session.user.name ?? session.user.email ?? "Usuario",
          email: session.user.email ?? "",
          rol: session.user.rol ?? null,
        }}
        signOutAction={signOutAction}
      />
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </>
  );
}
