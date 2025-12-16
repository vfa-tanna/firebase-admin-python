# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Firebase Admin SDK Python project for managing Firebase services including Authentication, Firestore, Realtime Database, Cloud Storage, and Cloud Messaging.

## Development Commands

### Environment Setup
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### Running the Application
```bash
# Run the main application
python main.py
```

### Dependency Management
```bash
# Install new package
pip install package_name

# Update requirements.txt after adding packages
pip freeze > requirements.txt
```

## Architecture

### Firebase Initialization Pattern

Firebase Admin SDK uses a singleton pattern with global app initialization. The `config/firebase.py` module handles this:

- **First initialization**: Creates Firebase app instance with service account credentials
- **Subsequent calls**: Returns existing app instance from `firebase_admin._apps`
- **Lazy initialization**: `get_firebase_app()` initializes on first access if needed

This prevents multiple initialization errors and ensures a single Firebase app instance throughout the application lifecycle.

### Configuration Management

- **Service account credentials**: Loaded from file path specified in `FIREBASE_CREDENTIALS_PATH` environment variable (defaults to `serviceAccountKey.json` in project root)
- **Environment variables**: Managed via `.env` file using `python-dotenv`
- **Optional configs**: Database URL and Storage Bucket can be configured via environment variables for Realtime Database and Cloud Storage features

### Module Structure

- **`config/`**: Firebase initialization and configuration module
  - `firebase.py`: Core initialization logic with `initialize_firebase()` and `get_firebase_app()`
  - `__init__.py`: Package exports for clean imports
- **`main.py`**: Application entry point demonstrating Firebase service usage patterns

### Firebase Services Access Pattern

Services are accessed after initialization:
```python
from firebase_admin import auth, firestore, db, messaging

# After initialize_firebase() is called
db_client = firestore.client()
users = auth.list_users()
ref = db.reference('/')
```

## Security Practices

- **Never commit** `serviceAccountKey.json` or `.env` files (enforced via `.gitignore`)
- Service account keys contain full admin access to Firebase project
- Use environment variables for all sensitive configuration
- Keep credentials path configurable via `FIREBASE_CREDENTIALS_PATH` environment variable
