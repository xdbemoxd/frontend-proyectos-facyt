"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userUpdateSchema, type UserUpdateErrors } from "@/lib/users/schema";
import { getUser, updateUser } from "@/lib/users/api";
import { useRoles } from "@/lib/users/use-roles";
import { roleLabel } from "@/lib/users/labels";
import { userState, type AppUser } from "@/lib/users/types";
import { Button } from "@/components/ui/button";
import { SelectField, zodFieldErrors } from "@/components/forms/form-field";
import { UserStateBadge } from "./user-state-badge";

type Props = { id: string; currentUserEmail: string | null };

export function UserEditForm({ id, currentUserEmail }: Props) {
  const router = useRouter();
  const { roles } = useRoles();
  const [user, setUser] = useState<AppUser | null | undefined>(undefined);
  const [errors, setErrors] = useState<UserUpdateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getUser(id).then(setUser);
  }, [id]);

  if (user === undefined) {
    return <p className="mx-auto max-w-xl text-sm text-muted-foreground" aria-busy="true">Cargando usuario…</p>;
  }
  if (user === null) {
    return (
      <p className="mx-auto max-w-xl rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Usuario no encontrado.
      </p>
    );
  }

  const isSelf = !!currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase();
  const pendingFirstLogin = userState(user) === "pending";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || !user) return;
    setFormError(null);

    const parsed = userUpdateSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof UserUpdateErrors>(parsed.error.issues));
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await updateUser(user.id, parsed.data, currentUserEmail);
      router.push("/dashboard/users");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar el usuario.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground">
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{user.name ? `${user.name} ${user.lastname ?? ""}` : "Sin nombre aún"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <UserStateBadge state={userState(user)} />
      </div>

      {isSelf && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Esta es tu cuenta: no puedes cambiar tu rol ni desactivarte.
        </p>
      )}

      <SelectField id="usr-edit-rol" name="id_rol" label="Rol" required defaultValue={user.rol.id}
        disabled={isSelf}
        options={roles.map((r) => ({ value: r.id, label: roleLabel(r.name) }))}
        error={errors.id_rol} />
      {isSelf && <input type="hidden" name="id_rol" value={user.rol.id} />}

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={user.is_active || pendingFirstLogin}
          disabled={isSelf || pendingFirstLogin} className="mt-0.5 size-4 accent-primary" />
        <span>
          <span className="font-medium">Cuenta activa</span>
          <span className="block text-xs text-muted-foreground">
            {pendingFirstLogin
              ? "Se activa sola en el primer ingreso con Google."
              : "Si la desactivas, no podrá iniciar sesión. Su historial se conserva."}
          </span>
        </span>
      </label>
      {(isSelf || pendingFirstLogin) && <input type="hidden" name="is_active" value="true" />}

      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/dashboard/users"
          className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          Cancelar
        </Link>
        <Button type="submit" disabled={pending || isSelf}>{pending ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}
