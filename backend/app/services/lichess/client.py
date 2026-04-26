"""
Cliente para a API do lichess.
Documentação: https://lichess.org/api
"""
import httpx
from typing import List, Optional, AsyncGenerator
from app.core.config import settings


class LichessClient:
    def __init__(self):
        self.base_url = settings.LICHESS_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {settings.LICHESS_API_TOKEN}",
            "Accept": "application/json",
        }

    async def get_user(self, username: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user/{username}",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_user_games(
        self,
        username: str,
        max_games: int = 20,
        perf_type: Optional[str] = None,
    ) -> List[dict]:
        params = {"max": max_games, "pgnInJson": True, "opening": True}
        if perf_type:
            params["perfType"] = perf_type

        # Token válido melhora rate limit mas não é obrigatório para partidas públicas
        token = settings.LICHESS_API_TOKEN
        headers = {"Accept": "application/x-ndjson"}
        if token and token != "coloque-seu-token-aqui":
            headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/games/user/{username}",
                headers=headers,
                params=params,
            )
            response.raise_for_status()
            games = []
            for line in response.text.strip().split("\n"):
                if line:
                    import json
                    games.append(json.loads(line))
            return games

    async def get_puzzle(self) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/puzzle/daily",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_team_members(self, team_id: str) -> List[dict]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/team/{team_id}/users",
                headers={**self.headers, "Accept": "application/x-ndjson"},
            )
            response.raise_for_status()
            members = []
            for line in response.text.strip().split("\n"):
                if line:
                    import json
                    members.append(json.loads(line))
            return members

    async def create_team_tournament(self, team_id: str, params: dict) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/tournament/team/{team_id}",
                headers=self.headers,
                json=params,
            )
            response.raise_for_status()
            return response.json()


lichess_client = LichessClient()
