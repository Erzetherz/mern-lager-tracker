const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const msg = data?.error || `Fehler: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  listItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/items${qs ? "?" + qs : ""}`);
  },
  createItem: (payload) =>
    request("/api/items", { method: "POST", body: JSON.stringify(payload) }),
  updateItem: (id, payload) =>
    request(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteItem: (id) =>
    request(`/api/items/${id}`, { method: "DELETE" }),

  listTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/transactions${qs ? "?" + qs : ""}`);
  },
  createTransaction: (payload) =>
    request("/api/transactions", { method: "POST", body: JSON.stringify(payload) }),
  deleteTransaction: (id) =>
    request(`/api/transactions/${id}`, { method: "DELETE" })
};
