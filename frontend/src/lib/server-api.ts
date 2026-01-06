import { cookies } from "next/headers";

export async function fetchFromServer(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  try {
    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Cookie: cookieHeader,
      },
      cache: 'no-store' // Dynamic data requires no caching usually, or check revalidation needs
    });

    if (!res.ok) {
      if (res.status === 401) return null; // Unauthenticated
      console.error(`[Server Fetch] Error fetching ${path}: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[Server Fetch] Exception fetching ${path}`, err);
    return null;
  }
}
