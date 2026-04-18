from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel, model_validator
from typing import List, Literal
from urllib.parse import urlencode
from dotenv import load_dotenv
from authlib.integrations.starlette_client import OAuth
import os
import requests

from app.services.spotify import (
    get_current_user,
    get_user_playlists,
    get_playlist_tracks,
    apply_reorder
)
from app.services.reorder import sort_tracks, calculate_movements

load_dotenv()

app = FastAPI(docs_url="/docs", title="Spotify Playlist Reorderer")
security = HTTPBearer()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY"))

# OAuth configuration for Spotify
oauth = OAuth()
oauth.register(
    name='spotify',
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    access_token_url='https://accounts.spotify.com/api/token',
    access_token_params=None,
    authorize_url='https://accounts.spotify.com/authorize',
    authorize_params=None,
    api_base_url='https://api.spotify.com/v1/',
    client_kwargs={
        'scope': ' '.join([
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-public',
            'playlist-modify-private',
        ])
    },
)


class SortCriteria(BaseModel):
    """Defines a single sorting criterion."""
    field: Literal[
        "name",
        "artist",
        "album",
        "release_date",
        "track_position",
        "duration",
        "added_at",
    ]
    order: Literal["asc", "desc"] = "asc"


ALBUM_FIELDS = {"album", "release_date"}


class ReorderRequest(BaseModel):
    """Request body for playlist reordering."""
    criteria: List[SortCriteria]

    @model_validator(mode="after")
    def _track_position_requires_album_predecessor(self):
        for i, c in enumerate(self.criteria):
            if c.field != "track_position":
                continue
            if i == 0 or self.criteria[i - 1].field not in ALBUM_FIELDS:
                raise ValueError(
                    "track_position must come directly after a criterion with "
                    "field 'album' or 'release_date'"
                )
        return self


class RefreshRequest(BaseModel):
    """Request body for refreshing the Spotify access token."""
    refresh_token: str


@app.get("/login")
async def login(request: Request):
    """Initiates OAuth flow with Spotify."""
    redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI")
    return await oauth.spotify.authorize_redirect(
        request,
        redirect_uri,
        show_dialog=True
    )


@app.get("/callback")
async def callback(request: Request):
    """
    Handles OAuth callback from Spotify.
    Redirects to frontend with tokens in the URL fragment so they never
    hit server logs or bookmarks, and clears from history after the frontend consumes them.
    """
    token = await oauth.spotify.authorize_access_token(request)
    params = urlencode({
        "access_token": token["access_token"],
        "refresh_token": token.get("refresh_token", ""),
        "expires_at": token.get("expires_at", ""),
    })
    return RedirectResponse(url=f"{FRONTEND_URL}/#{params}")


@app.post("/refresh")
def refresh_token(req: RefreshRequest):
    """
    Exchanges a refresh_token for a new access_token.
    Called by the frontend when the cached access_token is near expiration.
    """
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": req.refresh_token,
            "client_id": os.getenv("SPOTIFY_CLIENT_ID"),
            "client_secret": os.getenv("SPOTIFY_CLIENT_SECRET"),
        },
    )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Failed to refresh token")
    return response.json()


@app.get("/me")
def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Returns the authenticated user's profile."""
    return get_current_user(credentials.credentials)


@app.get("/playlists")
def list_playlists(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Returns the authenticated user's playlists.
    Token must be sent in the Authorization: Bearer <token> header.
    """
    token = credentials.credentials
    playlists = get_user_playlists(token)
    return playlists


@app.get("/playlists/{playlist_id}/tracks")
def list_playlist_tracks(
    playlist_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Returns all tracks from a playlist with fields for sorting.
    Handles pagination automatically to fetch all tracks.
    """
    token = credentials.credentials
    tracks = get_playlist_tracks(token, playlist_id)
    return {"playlist_id": playlist_id, "total": len(tracks), "tracks": tracks}


@app.post("/playlists/{playlist_id}/reorder")
def reorder_playlist(
    playlist_id: str,
    request: ReorderRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Reorders a playlist based on the provided criteria.
    Uses an optimized algorithm (LIS) to minimize API calls.

    Example body:
    {
        "criteria": [
            {"field": "artist", "order": "asc"},
            {"field": "album", "order": "asc"},
            {"field": "name", "order": "asc"}
        ]
    }
    """
    token = credentials.credentials

    tracks = get_playlist_tracks(token, playlist_id)

    if not tracks:
        return {"status": "empty", "movements": 0}

    sorted_tracks = sort_tracks(tracks, request.criteria)

    movements = calculate_movements(tracks, sorted_tracks)

    if not movements:
        return {"status": "already_sorted", "movements": 0}

    apply_reorder(token, playlist_id, movements)

    return {
        "status": "reordered",
        "movements": len(movements),
        "criteria": [c.model_dump() for c in request.criteria]
    }
