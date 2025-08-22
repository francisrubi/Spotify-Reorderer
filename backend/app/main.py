from fastapi import FastAPI, Request, Header, HTTPException
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv
from authlib.integrations.starlette_client import OAuth
import os

from app.services.spotify import obter_playlists_usuario

load_dotenv()

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY"))

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
    client_kwargs={'scope': 'user-read-private user-read-email'},
)

@app.get("/")
async def home():
    return {"msg": "Acesse /login para autenticar com Spotify"}

@app.get("/login")
async def login(request: Request):
    redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI")
    return await oauth.spotify.authorize_redirect(request, redirect_uri)

@app.get("/callback")
async def callback(request: Request):
    token = await oauth.spotify.authorize_access_token(request)
    user = await oauth.spotify.get('me', token=token)
    profile = user.json()
    return JSONResponse(content={
        "token": token,
        "profile": profile
    })

@app.get("/minhas-playlists")
def minhas_playlists(authorization: str = Header(...)):
    """
    Rota que retorna playlists do usuário autenticado no Spotify.
    O token deve ser enviado no header Authorization: Bearer <token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Token inválido")

    token = authorization.split(" ")[1]
    playlists = obter_playlists_usuario(token)
    return playlists