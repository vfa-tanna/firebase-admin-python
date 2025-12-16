"""
Configuration package for Firebase connection.
"""

from .firebase import initialize_firebase, get_firebase_app
from .auth_utils import verify_token, verify_token_strict, get_user_from_token

__all__ = [
    "initialize_firebase",
    "get_firebase_app",
    "verify_token",
]
