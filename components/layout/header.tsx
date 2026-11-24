import { auth, signIn, signOut } from "@/auth";
import { backendFetch } from "@/lib/backend";
import { Button } from "@/components/ui/button";

/**
 * Barra superior. "Iniciar sesión" lanza directo el OAuth de Google
 * (sin pasar por /login); `prompt: "select_account"` en auth.config.ts
 * hace que Google muestre siempre el selector de cuentas.
 */
export async function Header() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between gap-3 border-b px-6 py-3">
      <span className="min-w-0 truncate font-medium">Control de Proyectos FaCyT</span>

      {session?.user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{session.user.name ?? session.user.email}</span>
          <form
            action={async () => {
              "use server";
              try {
                await backendFetch("/api/user/auth/logout", {
                  method: "POST",
                });
              } catch {
                // Token expirado o sesion ya cerrada.
              }
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </div>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <Button type="submit" size="sm">
            Iniciar sesión
          </Button>
        </form>
      )}
    </header>
  );
}
