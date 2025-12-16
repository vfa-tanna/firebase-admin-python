"""
Configuration package for Firebase connection.
"""
from .firebase import initialize_firebase, get_firebase_app

__all__ = ['initialize_firebase', 'get_firebase_app']
