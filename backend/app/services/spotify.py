import requests

def obter_playlists_usuario(token: str):
    url = "https://api.spotify.com/v1/me/playlists"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Erro ao buscar playlists: {response.status_code} - {response.text}")

    return response.json()
