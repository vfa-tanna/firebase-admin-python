"""
Authentication utility functions for Firebase.
"""

from firebase_admin import auth
from typing import Optional, Dict, Any


def verify_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Firebase ID token and return the decoded token claims.

    Args:
        id_token: The Firebase ID token string to verify

    Returns:
        Dictionary containing the decoded token claims if valid, None if invalid

    Example:
        >>> token = "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
        >>> decoded_token = verify_token(token)
        >>> if decoded_token:
        ...     user_id = decoded_token['uid']
        ...     email = decoded_token.get('email')
    """
    try:
        # Verify the ID token and decode it
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.InvalidIdTokenError:
        print("Invalid ID token")
        return None
    except auth.ExpiredIdTokenError:
        print("Expired ID token")
        return None
    except auth.RevokedIdTokenError:
        print("Revoked ID token")
        return None
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None
