import { getLoginUrl } from "../api";
import { CREATOR_LINKS } from "../constants";
import { t } from "../i18n";
import { GithubIcon, SpotifyIcon } from "./icons";

export function LoginScreen() {
  return (
    <div className="min-h-screen flex flex-col p-5">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4 text-spotify-green">
          {t("login.title")}
        </h1>
        <p className="text-spotify-text-muted mb-8 max-w-md">
          {t("login.description")}
        </p>
        <button
          onClick={() => {
            window.location.href = getLoginUrl();
          }}
          className="bg-spotify-green hover:bg-spotify-green-hover rounded-pill px-12 py-4 text-lg font-semibold transition-transform hover:scale-[1.02] cursor-pointer"
        >
          {t("login.button")}
        </button>
      </div>
      <footer className="flex flex-col items-center gap-2 pt-4 pb-2">
        <span className="text-sm text-spotify-text-muted">
          by Francis Rotilli
        </span>
        <div className="flex items-center gap-4">
          <a
            href={CREATOR_LINKS.spotify}
            target="_blank"
            rel="noopener noreferrer"
            title={t("login.followSpotify")}
            aria-label={t("login.followSpotify")}
            className="text-spotify-text-muted hover:text-spotify-green transition-colors"
          >
            <SpotifyIcon size={22} />
          </a>
          <a
            href={CREATOR_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            title={t("login.followGithub")}
            aria-label={t("login.followGithub")}
            className="text-spotify-text-muted hover:text-white transition-colors"
          >
            <GithubIcon size={22} />
          </a>
        </div>
      </footer>
    </div>
  );
}
