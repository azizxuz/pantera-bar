# Connecting the Lovable frontend to this backend

In `src/lib/api.ts` (create it on the frontend):

```ts
const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000/api";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("admin_jwt");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

Realtime (Socket.IO):

```ts
import { io } from "socket.io-client";
const socket = io(`${import.meta.env.VITE_API_BASE_WS ?? "http://localhost:3000"}/realtime`, {
  auth: { token: localStorage.getItem("admin_jwt") },
});
socket.on("order:new",    (o) => { /* push to store */ });
socket.on("order:update", (o) => { /* update in store */ });
```

For the computer client, store the computer's token (returned by admin) in
localStorage and send it via the `x-computer-token` header on POST /orders.
