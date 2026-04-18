import { ArrowLeftIcon, GithubIcon, SpotifyIcon } from "./icons";
import { UserMenu } from "./UserMenu";
import { CREATOR_LINKS } from "../constants";
import { t } from "../i18n";
import type { UserProfile } from "../types";

interface HeaderProps {
  profile: UserProfile | null;
  onLogout: () => void;
  onBack: () => void;
  showBackButton: boolean;
  isDesktop: boolean;
}

export function Header({
  profile,
  onLogout,
  onBack,
  showBackButton,
  isDesktop,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center py-3 px-4 md:px-6 bg-spotify-bg-elevated border-b border-spotify-border gap-3">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        {showBackButton && (
          <button
            onClick={onBack}
            aria-label={t("header.back")}
            title={t("header.back")}
            className="text-white p-1 rounded hover:bg-spotify-hover cursor-pointer flex-shrink-0"
          >
            <ArrowLeftIcon />
          </button>
        )}
        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 min-w-0 leading-tight">
          <h1 className="text-base md:text-2xl font-bold text-spotify-green truncate">
            Spotify Playlist Reorderer
          </h1>
          <span className="text-[11px] md:text-xs text-spotify-text-muted whitespace-nowrap">
            by Francis Rotilli
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden md:flex items-center gap-3">
          <a
            href={CREATOR_LINKS.spotify}
            target="_blank"
            rel="noopener noreferrer"
            title={t("header.spotifyCreator")}
            aria-label={t("header.spotifyCreator")}
            className="text-spotify-text-muted hover:text-spotify-green transition-colors"
          >
            <SpotifyIcon size={20} />
          </a>
          <a
            href={CREATOR_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            title={t("header.githubCreator")}
            aria-label={t("header.githubCreator")}
            className="text-spotify-text-muted hover:text-white transition-colors"
          >
            <GithubIcon size={20} />
          </a>
          <span className="h-6 w-px bg-spotify-border" aria-hidden="true" />
        </div>
        <UserMenu
          profile={profile}
          onLogout={onLogout}
          variant={isDesktop ? "desktop" : "mobile"}
        />
      </div>
    </header>
  );
}
