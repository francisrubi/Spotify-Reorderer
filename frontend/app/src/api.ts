import type {
  PlaylistsResponse,
  ReorderResponse,
  SortCriterion,
  TracksResponse,
  UserProfile,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined. Check your .env file.");
}

const TOKEN_KEY = "spotify_token";
const REFRESH_KEY = "spotify_refresh_token";
const EXPIRES_AT_KEY = "spotify_expires_at";
const REFRESH_MARGIN_SEC = 60;

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
}

/**
 * Reads tokens out of the URL fragment after the OAuth callback redirects
 * the user back to the frontend. Clears the hash so tokens don't linger in history.
 */
export function consumeAuthHash(): boolean {
  if (!window.location.hash) return false;
  const params = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = params.get("access_token");
  if (!accessToken) return false;

  localStorage.setItem(TOKEN_KEY, accessToken);
  const refresh = params.get("refresh_token");
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  const expiresAt = params.get("expires_at");
  if (expiresAt) localStorage.setItem(EXPIRES_AT_KEY, expiresAt);

  history.replaceState(null, "", window.location.pathname);
  return true;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  try {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as SpotifyTokenResponse;

    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
    if (data.expires_at !== undefined) {
      localStorage.setItem(EXPIRES_AT_KEY, String(data.expires_at));
    } else if (data.expires_in !== undefined) {
      const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
      localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
    }
    return data.access_token;
  } catch {
    return null;
  }
}

async function ensureValidToken(): Promise<string | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const expiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY) ?? 0);
  const nowSec = Math.floor(Date.now() / 1000);
  if (expiresAt - nowSec > REFRESH_MARGIN_SEC) return token;

  return (await refreshAccessToken()) ?? token;
}

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const performFetch = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  };

  let token = await ensureValidToken();
  let response = await performFetch(token);

  if (response.status === 401 && localStorage.getItem(REFRESH_KEY)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) response = await performFetch(refreshed);
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getLoginUrl(): string {
  return `${API_BASE}/login`;
}

/**
 * Fire-and-forget request to wake up the backend.
 * Used on the login screen because the free tier of our host (Render)
 * spins down the container after 15min idle; first request after that
 * takes ~30-50s. Warming up while the user reads the login page removes
 * that latency from the OAuth redirect.
 */
export function pingApi(): void {
  fetch(`${API_BASE}/docs`).catch(() => {});
}

export function getProfile(): Promise<UserProfile> {
  return authFetch<UserProfile>("/me");
}

export function getPlaylists(): Promise<PlaylistsResponse> {
  return authFetch<PlaylistsResponse>("/playlists");
}

export function getPlaylistTracks(
  playlistId: string
): Promise<TracksResponse> {
  return authFetch<TracksResponse>(`/playlists/${playlistId}/tracks`);
}

export function reorderPlaylist(
  playlistId: string,
  criteria: SortCriterion[]
): Promise<ReorderResponse> {
  return authFetch<ReorderResponse>(`/playlists/${playlistId}/reorder`, {
    method: "POST",
    body: JSON.stringify({ criteria }),
  });
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}
