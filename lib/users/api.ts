import type { AppUser, Role, UserCreateInput, UserUpdateInput } from "./types";

export const USERS_KEY = "/users";

type BackendUser = {
  id: string;
  email: string;
  name: string | null;
  lastname: string | null;
  is_active: boolean;
  id_rol: string;
  rol: string | null;
  create_at: string | null;
};

type BackendPage = {
  items: BackendUser[];
  total: number;
  limit: number;
  offset: number;
};

function mapUser(user: BackendUser): AppUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    lastname: user.lastname,
    is_active: user.is_active,
    rol: { id: user.id_rol, name: user.rol ?? "" },
    create_at: user.create_at ?? new Date(0).toISOString(),
  };
}

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(" ");
    }
  } catch {
    // La respuesta no era JSON.
  }
  return `Error ${response.status}`;
}

export async function usersFetcher(_key: string): Promise<AppUser[]> {
  const response = await fetch("/api/users?limit=200", { cache: "no-store" });
  if (!response.ok) throw new Error(await readError(response));
  const page = (await response.json()) as BackendPage;
  return page.items.map(mapUser);
}

export async function getUser(id: string): Promise<AppUser | null> {
  const response = await fetch(`/api/users/${id}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await readError(response));
  return mapUser((await response.json()) as BackendUser);
}

export async function createUser(input: UserCreateInput): Promise<AppUser> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await readError(response));
  return mapUser((await response.json()) as BackendUser);
}

export async function updateUser(
  id: string,
  input: UserUpdateInput,
  _currentUserEmail?: string | null,
): Promise<AppUser> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await readError(response));
  return mapUser((await response.json()) as BackendUser);
}

export async function fetchRoles(): Promise<Role[]> {
  const response = await fetch("/api/roles", { cache: "no-store" });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as Role[];
}
