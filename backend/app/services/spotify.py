import requests
import time
from typing import List, Dict, Any
from fastapi import HTTPException

SPOTIFY_API_BASE = "https://api.spotify.com/v1"


def _get_headers(token: str) -> Dict[str, str]:
    """Returns authorization headers for Spotify API requests."""
    return {"Authorization": f"Bearer {token}"}


def _handle_response(response: requests.Response, context: str):
    """
    Handles Spotify API response errors.
    Raises appropriate HTTPException for different error codes.
    """
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    if response.status_code == 403:
        raise HTTPException(status_code=403, detail="No permission to access this resource")
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"{context} not found")
    if response.status_code == 429:
        retry_after = response.headers.get("Retry-After", 60)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit reached. Try again in {retry_after} seconds"
        )
    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Error {context}: {response.text}"
        )


def get_current_user(token: str) -> Dict[str, Any]:
    """Returns the authenticated user's profile (id, display_name, images)."""
    url = f"{SPOTIFY_API_BASE}/me"
    response = requests.get(url, headers=_get_headers(token))
    _handle_response(response, "fetching user profile")
    return response.json()


def get_user_playlists(token: str) -> Dict[str, Any]:
    """
    Returns all of the authenticated user's playlists across pages.

    Spotify caps /me/playlists at 50 per request and doesn't offer a sort
    parameter, so we must fetch every page for client-side sorting to be
    correct. Response shape stays `{items, total}` to match the original.
    """
    all_items: List[Dict[str, Any]] = []
    url = f"{SPOTIFY_API_BASE}/me/playlists"
    params = {"limit": 50, "offset": 0}
    total = 0

    while True:
        response = requests.get(url, headers=_get_headers(token), params=params)
        _handle_response(response, "fetching playlists")
        data = response.json()
        all_items.extend(data.get("items", []))
        total = data.get("total", len(all_items))
        if data.get("next") is None:
            break
        params["offset"] += params["limit"]

    return {"items": all_items, "total": total}


def get_playlist_tracks(token: str, playlist_id: str) -> List[Dict[str, Any]]:
    """
    Returns all tracks from a playlist with automatic pagination.
    Extracts only the fields needed for sorting.
    """
    tracks = []
    url = f"{SPOTIFY_API_BASE}/playlists/{playlist_id}/tracks"
    params = {"limit": 50, "offset": 0}

    while True:
        response = requests.get(url, headers=_get_headers(token), params=params)
        _handle_response(response, "fetching playlist tracks")

        data = response.json()

        for item in data.get("items", []):
            track = item.get("track")
            if not track or track.get("id") is None:
                continue

            artists = track.get("artists", [])
            artist_name = artists[0]["name"] if artists else "Unknown"
            album = track.get("album", {}) or {}

            tracks.append({
                "id": track["id"],
                "uri": track["uri"],
                "name": track.get("name", ""),
                "artist": artist_name,
                "artists": [a["name"] for a in artists],
                "album": album.get("name", ""),
                "album_id": album.get("id", ""),
                "release_date": album.get("release_date", ""),
                "release_date_precision": album.get("release_date_precision", "day"),
                "disc_number": track.get("disc_number", 1),
                "track_number": track.get("track_number", 0),
                "duration_ms": track.get("duration_ms", 0),
                "added_at": item.get("added_at", ""),
            })

        if data.get("next") is None:
            break

        params["offset"] += params["limit"]

    return tracks


def move_track(
    token: str,
    playlist_id: str,
    range_start: int,
    insert_before: int,
    snapshot_id: str = None
) -> str:
    """
    Moves a track from one position to another in the playlist.
    Returns the new snapshot_id.
    """
    url = f"{SPOTIFY_API_BASE}/playlists/{playlist_id}/tracks"

    body = {
        "range_start": range_start,
        "insert_before": insert_before,
        "range_length": 1
    }

    if snapshot_id:
        body["snapshot_id"] = snapshot_id

    response = requests.put(url, headers=_get_headers(token), json=body)
    _handle_response(response, "moving track")

    return response.json().get("snapshot_id")


def apply_reorder(
    token: str,
    playlist_id: str,
    movements: List[Dict[str, int]],
    delay_ms: int = 300
) -> str:
    """
    Applies a list of movements to the playlist.
    Uses delay between calls to avoid rate limiting.

    Args:
        token: Spotify access token
        playlist_id: Playlist ID
        movements: List of movements [{"range_start": X, "insert_before": Y}, ...]
        delay_ms: Delay between calls in milliseconds (default 300ms)

    Returns:
        Last snapshot_id
    """
    snapshot_id = None

    for i, mov in enumerate(movements):
        snapshot_id = move_track(
            token,
            playlist_id,
            mov["range_start"],
            mov["insert_before"],
            snapshot_id
        )

        if i < len(movements) - 1:
            time.sleep(delay_ms / 1000)

    return snapshot_id
