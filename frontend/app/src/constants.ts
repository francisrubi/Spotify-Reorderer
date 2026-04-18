import type { MessageKey } from "./i18n";
import type { SortField } from "./types";

export const SORT_FIELDS: { value: SortField; labelKey: MessageKey }[] = [
  { value: "name", labelKey: "sort.field.name" },
  { value: "artist", labelKey: "sort.field.artist" },
  { value: "album", labelKey: "sort.field.album" },
  { value: "release_date", labelKey: "sort.field.release_date" },
  { value: "track_position", labelKey: "sort.field.track_position" },
  { value: "duration", labelKey: "sort.field.duration" },
  { value: "added_at", labelKey: "sort.field.added_at" },
];

export type DirCategory = "text" | "date" | "duration" | "position";

export const DIR_CATEGORY: Record<SortField, DirCategory> = {
  name: "text",
  artist: "text",
  album: "text",
  release_date: "date",
  track_position: "position",
  duration: "duration",
  added_at: "date",
};

export const ALBUM_FIELDS: SortField[] = ["album", "release_date"];

export const MAX_SORT_CRITERIA = 5;

export const CREATOR_LINKS = {
  spotify:
    "https://open.spotify.com/user/francisrrotilli?si=9b4d4c00ef504961",
  github: "https://github.com/francisrubi",
};
