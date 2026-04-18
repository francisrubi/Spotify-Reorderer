import type { ReactNode } from "react";
import { t } from "../i18n";
import type { Track } from "../types";

interface TracksTableProps {
  tracks: Track[];
  loading: boolean;
}

const SKELETON_ROW_COUNT = 10;

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function Th({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-left py-3 px-4 text-spotify-text-muted font-medium text-xs uppercase tracking-wider border-b border-spotify-border ${className}`}
    >
      {children}
    </th>
  );
}

function SkeletonBar({ widthClass }: { widthClass: string }) {
  return (
    <div
      className={`h-4 bg-spotify-hover rounded animate-pulse ${widthClass}`}
    />
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t border-spotify-border">
      <td className="py-3 px-4">
        <SkeletonBar widthClass="w-5 mx-auto" />
      </td>
      <td className="py-3 px-4">
        <SkeletonBar widthClass="w-3/4" />
      </td>
      <td className="py-3 px-4">
        <SkeletonBar widthClass="w-1/2" />
      </td>
      <td className="py-3 px-4">
        <SkeletonBar widthClass="w-2/3" />
      </td>
      <td className="py-3 px-4">
        <SkeletonBar widthClass="w-10 ml-auto" />
      </td>
    </tr>
  );
}

export function TracksTable({ tracks, loading }: TracksTableProps) {
  return (
    <div className="bg-spotify-bg-elevated rounded-lg overflow-x-auto">
      <table className="w-full border-collapse min-w-[480px]">
        <thead>
          <tr>
            <Th className="w-10 text-center">{t("tracks.header.num")}</Th>
            <Th>{t("tracks.header.name")}</Th>
            <Th>{t("tracks.header.artist")}</Th>
            <Th>{t("tracks.header.album")}</Th>
            <Th className="w-20 text-right">{t("tracks.header.duration")}</Th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                <SkeletonRow key={`skeleton-${i}`} />
              ))
            : tracks.map((track, index) => (
                <tr
                  key={`${track.id}-${index}`}
                  className="border-t border-spotify-border hover:bg-spotify-hover"
                >
                  <td className="py-3 px-4 text-center">{index + 1}</td>
                  <td
                    className="py-3 px-4 max-w-[200px] truncate"
                    title={track.name}
                  >
                    {track.name}
                  </td>
                  <td
                    className="py-3 px-4 max-w-[160px] truncate"
                    title={track.artist}
                  >
                    {track.artist}
                  </td>
                  <td
                    className="py-3 px-4 max-w-[200px] truncate"
                    title={track.album}
                  >
                    {track.album}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {formatDuration(track.duration_ms)}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
