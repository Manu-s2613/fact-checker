import uuid
from datetime import datetime
from typing import Optional
from ..models.user import User

_users_db = {}

def create_mock_user(username: str, email: Optional[str] = None) -> User:
    user_id = str(uuid.uuid4()).replace("-", "")[:16]
    avatar_url = f"https://ui-avatars.com/api/?name={username}&background=9333ea&color=fff"
    user = User(
        id=user_id,
        username=username,
        email=email or f"{username}@example.com",
        avatar_url=avatar_url,
        created_at=datetime.now()
    )
    _users_db[user_id] = user
    return user

def get_user_by_id(user_id: str) -> Optional[User]:
    return _users_db.get(user_id)

def create_mock_token(user_id: str) -> str:
    return f"mocktoken{user_id}"

def validate_mock_token(token: str) -> Optional[str]:
    if token and token.startswith("mocktoken"):
        user_id = token.replace("mocktoken", "")
        if user_id in _users_db:
            return user_id
    return None