export const API_BASE = "https://63e1fba7d566.ngrok-free.app";

export async function getUserData() {
  const res = await fetch(`${API_BASE}/some-endpoint`);
  const data = await res.json();
  return data;
}