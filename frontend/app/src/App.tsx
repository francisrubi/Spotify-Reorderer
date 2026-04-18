import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPlaylists,
  getPlaylistTracks,
  getProfile,
  isAuthenticated,
  logout,
  reorderPlaylist,
} from "./api";

// Module-scope flag to dedupe initial /me + /playlists fetch across
// React.StrictMode's double-mount in dev. Reset on logout so a re-login
// triggers a fresh fetch.
let initialFetchStarted = false;
import { Header } from "./components/Header";
import { LoginScreen } from "./components/LoginScreen";
import { PlaylistSidebar } from "./components/PlaylistSidebar";
import { PlaylistView } from "./components/PlaylistView";
import { Toast } from "./components/Toast";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { t, tp } from "./i18n";
import type { Playlist, SortCriterion, Track, UserProfile } from "./types";

export function App() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [authenticated, setAuthenticated] = useState<boolean>(
    isAuthenticated()
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [tracks, setTracks] = useState<Track[]>([]);
  const [criteria, setCriteria] = useState<SortCriterion[]>([
    { field: "artist", order: "asc" },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const reorderablePlaylists = useMemo(() => {
    if (!profile) return [];
    return playlists.filter(
      (p) => p.owner?.id === profile.id && !p.collaborative
    );
  }, [playlists, profile]);

  const handleLogout = useCallback(() => {
    initialFetchStarted = false;
    logout();
    setAuthenticated(false);
    setProfile(null);
    setPlaylists([]);
    setSelectedPlaylist(null);
    setTracks([]);
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileData, playlistsData] = await Promise.all([
        getProfile(),
        getPlaylists(),
      ]);
      setProfile(profileData);
      setPlaylists(playlistsData.items ?? []);
    } catch (err) {
      initialFetchStarted = false;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      if (msg.includes("401") || msg.includes("expired")) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    if (!authenticated || initialFetchStarted) return;
    initialFetchStarted = true;
    loadInitial();
  }, [authenticated, loadInitial]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 8000);
    return () => clearTimeout(t);
  }, [error]);

  const loadTracks = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setLoading(true);
    setError("");
    try {
      const data = await getPlaylistTracks(playlist.id);
      setTracks(data.tracks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!selectedPlaylist || criteria.length === 0) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await reorderPlaylist(selectedPlaylist.id, criteria);
      const msg =
        result.status === "reordered"
          ? tp("reorder.success", result.movements)
          : result.status === "empty"
          ? t("reorder.empty")
          : t("reorder.already_sorted");
      setMessage(msg);
      await loadTracks(selectedPlaylist);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedPlaylist(null);
    setTracks([]);
    setMessage("");
  };

  if (!authenticated) return <LoginScreen />;

  const showingTracks = !!selectedPlaylist;
  const showSidebar = isDesktop || !showingTracks;
  const showMain = isDesktop || showingTracks;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        profile={profile}
        onLogout={handleLogout}
        onBack={handleBack}
        showBackButton={!isDesktop && showingTracks}
        isDesktop={isDesktop}
      />
      {error && <Toast kind="error">{error}</Toast>}
      {message && <Toast kind="success">{message}</Toast>}
      <div className="flex flex-1 min-h-0 relative">
        {showSidebar && (
          <PlaylistSidebar
            playlists={reorderablePlaylists}
            selectedId={selectedPlaylist?.id ?? null}
            onSelect={loadTracks}
            loading={loading}
          />
        )}
        {showMain && (
          <main className="flex-1 overflow-hidden bg-spotify-bg-base min-w-0">
            {selectedPlaylist ? (
              <PlaylistView
                playlist={selectedPlaylist}
                tracks={tracks}
                criteria={criteria}
                onCriteriaChange={setCriteria}
                onApply={handleReorder}
                loading={loading}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-spotify-text-muted text-center px-4">
                <p>{t("playlistView.selectPrompt")}</p>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
