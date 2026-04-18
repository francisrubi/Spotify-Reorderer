const messages = {
  en: {
    "login.title": "Spotify Playlist Reorderer",
    "login.description":
      "Sort your playlists by artist, album, name, duration, or date added.",
    "login.button": "Login with Spotify",
    "login.followSpotify": "Follow on Spotify",
    "login.followGithub": "GitHub",

    "header.back": "Back to playlists",
    "header.spotifyCreator": "Follow the creator on Spotify",
    "header.githubCreator": "Follow the creator on GitHub",

    "userMenu.open": "User menu",
    "userMenu.followCreator": "Follow the creator",
    "userMenu.logout": "Logout",

    "sidebar.yourPlaylists": "Your Playlists",
    "sidebar.sortBy": "Sort playlists by",
    "sidebar.sortField.name": "Name",
    "sidebar.sortField.size": "Size",
    "sidebar.sortAscending": "Sort ascending",
    "sidebar.sortDescending": "Sort descending",
    "sidebar.ascending": "Ascending",
    "sidebar.descending": "Descending",
    "sidebar.loading": "Loading...",
    "sidebar.resize": "Resize sidebar",
    "sidebar.tracksCount": "{count} tracks",
    "sidebar.tracksCount_one": "{count} track",

    "playlistView.selectPrompt":
      "Select a playlist from the sidebar to get started",
    "playlistView.tracksCount": "{count} tracks",
    "playlistView.tracksCount_one": "{count} track",

    "sort.title": "Sort By:",
    "sort.clear": "Clear fields",
    "sort.apply": "Apply Sort Order",
    "sort.applying": "Reordering...",
    "sort.add": "Add another sort field",
    "sort.addDesktop": "+ Add sort field",
    "sort.remove": "Remove criterion",

    "sort.field.name": "Track Name",
    "sort.field.artist": "Artist",
    "sort.field.album": "Album",
    "sort.field.release_date": "Release Date",
    "sort.field.track_position": "Position in Album",
    "sort.field.duration": "Duration",
    "sort.field.added_at": "Date Added",

    "sort.dir.text.asc": "A → Z",
    "sort.dir.text.desc": "Z → A",
    "sort.dir.date.asc": "Older → Newer",
    "sort.dir.date.desc": "Newer → Older",
    "sort.dir.duration.asc": "Shorter → Longer",
    "sort.dir.duration.desc": "Longer → Shorter",
    "sort.dir.position.asc": "1 → N",
    "sort.dir.position.desc": "N → 1",

    "tracks.header.num": "#",
    "tracks.header.name": "Name",
    "tracks.header.artist": "Artist",
    "tracks.header.album": "Album",
    "tracks.header.duration": "Duration",

    "reorder.success": "Playlist reordered successfully ({count} movements)",
    "reorder.success_one":
      "Playlist reordered successfully ({count} movement)",
    "reorder.empty": "Empty playlist",
    "reorder.already_sorted": "Playlist is already in the desired order",
  },
  pt: {
    "login.title": "Reordenador de Playlists do Spotify",
    "login.description":
      "Ordene suas playlists por artista, álbum, nome, duração ou data de adição.",
    "login.button": "Entrar com Spotify",
    "login.followSpotify": "Seguir no Spotify",
    "login.followGithub": "GitHub",

    "header.back": "Voltar para playlists",
    "header.spotifyCreator": "Siga o criador no Spotify",
    "header.githubCreator": "Siga o criadorno GitHub",

    "userMenu.open": "Menu do usuário",
    "userMenu.followCreator": "Siga o criador",
    "userMenu.logout": "Sair",

    "sidebar.yourPlaylists": "Suas Playlists",
    "sidebar.sortBy": "Ordenar playlists por",
    "sidebar.sortField.name": "Nome",
    "sidebar.sortField.size": "Tamanho",
    "sidebar.sortAscending": "Ordenar crescente",
    "sidebar.sortDescending": "Ordenar decrescente",
    "sidebar.ascending": "Crescente",
    "sidebar.descending": "Decrescente",
    "sidebar.loading": "Carregando...",
    "sidebar.resize": "Redimensionar barra",
    "sidebar.tracksCount": "{count} faixas",
    "sidebar.tracksCount_one": "{count} faixa",

    "playlistView.selectPrompt":
      "Selecione uma playlist na barra lateral para começar",
    "playlistView.tracksCount": "{count} faixas",
    "playlistView.tracksCount_one": "{count} faixa",

    "sort.title": "Ordenar por:",
    "sort.clear": "Limpar",
    "sort.apply": "Aplicar ordenação",
    "sort.applying": "Reordenando...",
    "sort.add": "Adicionar outro critério",
    "sort.addDesktop": "+ Adicionar critério",
    "sort.remove": "Remover critério",

    "sort.field.name": "Nome da faixa",
    "sort.field.artist": "Artista",
    "sort.field.album": "Álbum",
    "sort.field.release_date": "Data de lançamento",
    "sort.field.track_position": "Posição no álbum",
    "sort.field.duration": "Duração",
    "sort.field.added_at": "Data de adição",

    "sort.dir.text.asc": "A → Z",
    "sort.dir.text.desc": "Z → A",
    "sort.dir.date.asc": "Mais antigo → Mais novo",
    "sort.dir.date.desc": "Mais novo → Mais antigo",
    "sort.dir.duration.asc": "Mais curta → Mais longa",
    "sort.dir.duration.desc": "Mais longa → Mais curta",
    "sort.dir.position.asc": "1 → N",
    "sort.dir.position.desc": "N → 1",

    "tracks.header.num": "#",
    "tracks.header.name": "Nome",
    "tracks.header.artist": "Artista",
    "tracks.header.album": "Álbum",
    "tracks.header.duration": "Duração",

    "reorder.success": "Playlist reordenada ({count} movimentos)",
    "reorder.success_one": "Playlist reordenada ({count} movimento)",
    "reorder.empty": "Playlist vazia",
    "reorder.already_sorted": "Playlist já está na ordem desejada",
  },
} as const;

type Locale = keyof typeof messages;
export type MessageKey = keyof (typeof messages)["en"];

function detectLocale(): Locale {
  const lang = (navigator.language ?? "").toLowerCase();
  return lang.startsWith("pt") ? "pt" : "en";
}

export const locale: Locale = detectLocale();

export function t(
  key: MessageKey,
  params?: Record<string, string | number>
): string {
  const dict = messages[locale] as Record<string, string>;
  const fallback = messages.en as Record<string, string>;
  let str = dict[key] ?? fallback[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export function tp(
  key: MessageKey,
  count: number,
  params?: Record<string, string | number>
): string {
  const singular = `${key}_one`;
  const singularExists = singular in messages.en;
  const chosen =
    count === 1 && singularExists ? (singular as MessageKey) : key;
  return t(chosen, { ...params, count });
}
