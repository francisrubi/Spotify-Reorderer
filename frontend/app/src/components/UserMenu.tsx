import { useEffect, useRef, useState } from "react";
import { CREATOR_LINKS } from "../constants";
import { t } from "../i18n";
import { GithubIcon, SpotifyIcon } from "./icons";
import type { UserProfile } from "../types";

interface UserMenuProps {
  profile: UserProfile | null;
  onLogout: () => void;
  variant: "desktop" | "mobile";
}

function DesktopUserMenu({
  profile,
  onLogout,
}: {
  profile: UserProfile | null;
  onLogout: () => void;
}) {
  const avatar = profile?.images?.[0]?.url;
  const displayName = profile?.display_name ?? "";
  return (
    <>
      {avatar && (
        <img
          src={avatar}
          alt={displayName || "User"}
          title={displayName}
          className="w-8 h-8 rounded-full object-cover border border-spotify-border"
        />
      )}
      <button
        onClick={onLogout}
        className="bg-transparent text-spotify-text-muted border border-spotify-text-muted rounded-pill px-3 py-1.5 text-sm hover:text-white hover:border-white transition-colors cursor-pointer"
      >
        {t("userMenu.logout")}
      </button>
    </>
  );
}

function MobileUserMenu({
  profile,
  onLogout,
}: {
  profile: UserProfile | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const avatar = profile?.images?.[0]?.url;
  const displayName = profile?.display_name ?? "";
  const initial = displayName ? displayName[0]?.toUpperCase() : "?";

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("userMenu.open")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="block rounded-full cursor-pointer"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={displayName || "User"}
            className="w-9 h-9 rounded-full object-cover border border-spotify-border"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-spotify-hover border border-spotify-border flex items-center justify-center text-white text-sm">
            {initial}
          </div>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[200px] bg-spotify-bg-elevated border border-spotify-border rounded-md shadow-lg z-50 overflow-hidden"
        >
          {displayName && (
            <div className="px-4 py-2 text-sm text-white border-b border-spotify-border truncate">
              {displayName}
            </div>
          )}
          <div className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wider text-spotify-text-muted">
            {t("userMenu.followCreator")}
          </div>
          <a
            role="menuitem"
            href={CREATOR_LINKS.spotify}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-spotify-text-muted hover:bg-spotify-hover hover:text-white transition-colors"
          >
            <SpotifyIcon size={16} />
            Spotify
          </a>
          <a
            role="menuitem"
            href={CREATOR_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-spotify-text-muted hover:bg-spotify-hover hover:text-white transition-colors border-b border-spotify-border"
          >
            <GithubIcon size={16} />
            GitHub
          </a>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-spotify-text-muted hover:bg-spotify-hover hover:text-white transition-colors cursor-pointer"
          >
            {t("userMenu.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

export function UserMenu({ profile, onLogout, variant }: UserMenuProps) {
  return variant === "desktop" ? (
    <DesktopUserMenu profile={profile} onLogout={onLogout} />
  ) : (
    <MobileUserMenu profile={profile} onLogout={onLogout} />
  );
}
