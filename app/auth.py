from fastapi import Header, HTTPException

FAKE_USERS = {
    "admin": {
        "password": "admin123",
        "role": "admin"
    },
    "viewer": {
        "password": "viewer123",
        "role": "standard"
    }
}


def authenticate_user(username: str, password: str):
    user = FAKE_USERS.get(username)
    if not user or user["password"] != password:
        return None
    return {
        "username": username,
        "role": user["role"]
    }


def get_current_user(
    x_username: str = Header(None),
    x_role: str = Header(None)
):
    if not x_username or not x_role:
        raise HTTPException(status_code=401, detail="Missing authentication headers")

    return {
        "username": x_username,
        "role": x_role
    }