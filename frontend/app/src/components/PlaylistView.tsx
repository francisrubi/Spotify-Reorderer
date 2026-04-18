import { SortCriteriaEditor } from "./SortCriteriaEditor";
import { TracksTable } from "./TracksTable";
import { tp } from "../i18n";
import type { Playlist, SortCriterion, Track } from "../types";

interface PlaylistViewProps {
  playlist: Playlist;
  tracks: Track[];
  criteria: SortCriterion[];
  onCriteriaChange: (criteria: SortCriterion[]) => void;
  onApply: () => void;
  loading: boolean;
}

export function PlaylistView({
  playlist,
  tracks,
  criteria,
  onCriteriaChange,
  onApply,
  loading,
}: PlaylistViewProps) {
  const cover = playlist.images?.[0]?.url;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-4">
        <div className="mb-5 flex items-center gap-4">
          {cover && (
            <img
              src={cover}
              alt=""
              className="w-16 h-16 md:w-24 md:h-24 rounded object-cover flex-shrink-0 shadow-md"
            />
          )}
          <div className="min-w-0">
            <h2
              className="text-2xl md:text-3xl font-bold mb-1 truncate"
              title={playlist.name}
            >
              {playlist.name}
            </h2>
            <p className="text-spotify-text-muted text-sm">
              {tp("playlistView.tracksCount", tracks.length)}
            </p>
          </div>
        </div>
        <SortCriteriaEditor
          criteria={criteria}
          onChange={onCriteriaChange}
          onApply={onApply}
          loading={loading}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 md:pb-6 min-h-0">
        <TracksTable tracks={tracks} loading={loading} />
      </div>
    </div>
  );
}
