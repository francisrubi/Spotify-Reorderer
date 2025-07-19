from fastapi import FastAPI, Request
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv
from authlib.integrations.starlette_client import OAuth
import os

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
