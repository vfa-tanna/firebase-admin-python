# Firebase Admin Python Project

A Python project to connect and interact with Firebase using the Firebase Admin SDK.

## Setup

1. **Clone the repository** (or you're already here!)

2. **Create a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Firebase credentials**:
   - Go to your Firebase Console
   - Project Settings → Service Accounts
   - Generate a new private key (downloads a JSON file)
   - Save the JSON file as `serviceAccountKey.json` in the project root
   - Or set the path in your `.env` file

5. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values with your Firebase configuration

## Usage

Run the main script:
```bash
python main.py
```

## Project Structure

```
firebase-admin-python/
├── main.py              # Main application entry point
├── config/              # Configuration files
│   └── firebase.py      # Firebase initialization
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Firebase Admin SDK Features

This project is set up to use:
- Authentication management
- Firestore database operations
- Realtime Database operations
- Cloud Storage
- Cloud Messaging

## Security Notes

- Never commit `serviceAccountKey.json` or `.env` files to version control
- Keep your Firebase credentials secure
- Use environment variables for sensitive data
