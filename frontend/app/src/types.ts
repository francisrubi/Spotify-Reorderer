export type SortField =
  | "name"
  | "artist"
  | "album"
  | "release_date"
  | "track_position"
  | "duration"
  | "added_at";
export type SortOrder = "asc" | "desc";

export interface SortCriterion {
  field: SortField;
  order: SortOrder;
}

export interface PlaylistImage {
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface Playlist {
  id: string;
  name: string;
  images: PlaylistImage[];
  tracks: { total: number };
  owner: { id: string; display_name?: string };
  collaborative: boolean;
}

export interface UserProfile {
  id: string;
  display_name: string;
  images: { url: string; height?: number | null; width?: number | null }[];
}

export interface Track {
  id: string;
  uri: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  added_at: string;
}

export interface PlaylistsResponse {
  items: Playlist[];
  total: number;
}

export interface TracksResponse {
  playlist_id: string;
  total: number;
  tracks: Track[];
}

export type ReorderStatus = "reordered" | "empty" | "already_sorted";

export interface ReorderResponse {
  status: ReorderStatus;
  movements: number;
  criteria?: SortCriterion[];
}
