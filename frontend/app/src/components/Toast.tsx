import type { ReactNode } from "react";

interface ToastProps {
  kind: "error" | "success";
  children: ReactNode;
}

export function Toast({ kind, children }: ToastProps) {
  const bg = kind === "error" ? "bg-spotify-error" : "bg-spotify-green";
  return (
    <div className={`${bg} text-white py-3 px-6 text-center`}>{children}</div>
  );
}
