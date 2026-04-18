import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Playlist } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { t, tp } from "../i18n";
import { ArrowIcon } from "./icons";

type SortField = "name" | "size";
type SortDir = "asc" | "desc";

interface PlaylistSidebarProps {
  playlists: Playlist[];
  selectedId: string | null;
  onSelect: (playlist: Playlist) => void;
  loading: boolean;
}

const WIDTH_KEY = "sidebar_width";
const MIN_WIDTH = 220;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 300;

export function PlaylistSidebar({
  playlists,
  selectedId,
  onSelect,
  loading,
}: PlaylistSidebarProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [width, setWidth] = useState<number>(() => {
    const saved = Number(localStorage.getItem(WIDTH_KEY));
    return saved >= MIN_WIDTH && saved <= MAX_WIDTH ? saved : DEFAULT_WIDTH;
  });
  const widthRef = useRef(width);
  widthRef.current = width;
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(next);
    };
    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      localStorage.setItem(WIDTH_KEY, String(widthRef.current));
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const sorted = useMemo(() => {
    const arr = [...playlists];
    arr.sort((a, b) => {
      const cmp =
        sortField === "name"
          ? a.name.localeCompare(b.name)
          : (a.tracks?.total ?? 0) - (b.tracks?.total ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [playlists, sortField, sortDir]);

  return (
    <aside
      style={isDesktop ? { width: `${width}px` } : undefined}
      className="bg-spotify-bg-sidebar border-r border-spotify-border flex-shrink-0 flex flex-col overflow-hidden h-full w-full md:w-auto relative"
    >
      <div className="flex-shrink-0 p-4 pb-0">
        <h2 className="text-sm uppercase tracking-wider text-spotify-text-muted mb-3">
          {t("sidebar.yourPlaylists")}
        </h2>

        <div className="flex items-center gap-2 mb-4">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            aria-label={t("sidebar.sortBy")}
            className="flex-1 bg-spotify-hover text-white border-0 rounded px-3 py-2 text-sm cursor-pointer focus:outline-1 focus:outline-spotify-green"
          >
            <option value="name">{t("sidebar.sortField.name")}</option>
            <option value="size">{t("sidebar.sortField.size")}</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label={
              sortDir === "asc"
                ? t("sidebar.sortDescending")
                : t("sidebar.sortAscending")
            }
            title={
              sortDir === "asc"
                ? t("sidebar.ascending")
                : t("sidebar.descending")
            }
            className="bg-spotify-hover text-white rounded p-2 cursor-pointer hover:text-spotify-green transition-colors"
          >
            <ArrowIcon direction={sortDir} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
        {loading && playlists.length === 0 && (
          <p className="text-spotify-text-muted text-sm">
            {t("sidebar.loading")}
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {sorted.map((playlist) => (
            <li key={playlist.id}>
              <button
                onClick={() => onSelect(playlist)}
                title={playlist.name}
                className={`flex items-center gap-3 p-2 rounded w-full text-left cursor-pointer transition-colors hover:bg-spotify-hover ${
                  selectedId === playlist.id ? "bg-spotify-hover" : ""
                }`}
              >
                {playlist.images?.[0] && (
                  <img
                    src={playlist.images[0].url}
                    alt=""
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="font-medium truncate">{playlist.name}</span>
                  <span className="text-sm text-spotify-text-muted">
                    {tp("sidebar.tracksCount", playlist.tracks?.total ?? 0)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {isDesktop && (
        <div
          onMouseDown={startDrag}
          role="separator"
          aria-orientation="vertical"
          aria-label={t("sidebar.resize")}
          className="hidden md:block absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-spotify-green/40 active:bg-spotify-green/60 transition-colors"
        />
      )}
    </aside>
  );
}
