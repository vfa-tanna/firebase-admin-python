"""
Firebase Admin SDK initialization and configuration.
"""

import os
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def initialize_firebase():
    """
    Initialize Firebase Admin SDK with service account credentials.

    Returns:
        firebase_admin.App: Initialized Firebase app instance
    """
    try:
        # Check if Firebase is already initialized
        if firebase_admin._apps:
            print("Firebase already initialized.")
            return firebase_admin.get_app()

        # Get the path to service account key from environment variable
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")

        if not os.path.exists(cred_path):
            raise FileNotFoundError(
                f"Firebase credentials file not found at: {cred_path}\n"
                "Please download your service account key from Firebase Console "
                "and save it to the specified path."
            )

        # Initialize with service account credentials
        cred = credentials.Certificate(cred_path)

        # Initialize the app with credentials
        app = firebase_admin.initialize_app(cred)

        print("Firebase Admin SDK initialized successfully!")
        return app

    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        raise


def get_firebase_app():
    """
    Get the Firebase app instance. Initialize if not already done.

    Returns:
        firebase_admin.App: Firebase app instance
    """
    if not firebase_admin._apps:
        return initialize_firebase()
    return firebase_admin.get_app()
