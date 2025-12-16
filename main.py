"""
Main application script demonstrating Firebase Admin SDK usage.
"""
from config import initialize_firebase
from firebase_admin import auth, firestore, db


def main():
    """
    Main function to demonstrate Firebase Admin SDK capabilities.
    """
    print("=" * 50)
    print("Firebase Admin Python Project")
    print("=" * 50)
    
    # Initialize Firebase
    try:
        app = initialize_firebase()
        print(f"Firebase App Name: {app.name}")
    except Exception as e:
        print(f"Failed to initialize Firebase: {e}")
        return
    
    print("\n" + "=" * 50)
    print("Available Firebase Services:")
    print("=" * 50)
    
    # Example: Authentication
    print("\n1. Authentication (auth)")
    try:
        # List first 10 users (example)
        users = auth.list_users(max_results=10)
        print(f"   Total users retrieved: {len(users.users)}")
        for user in users.users:
            print(f"   - User ID: {user.uid}, Email: {user.email}")
    except Exception as e:
        print(f"   Auth example: {e}")
    
    # Example: Firestore
    print("\n2. Firestore Database")
    try:
        db_client = firestore.client()
        print("   Firestore client initialized successfully")
        
        # Example: Create or update a document
        # doc_ref = db_client.collection('users').document('sample_user')
        # doc_ref.set({'name': 'John Doe', 'email': 'john@example.com'})
        # print("   Sample document created/updated")
        
    except Exception as e:
        print(f"   Firestore example: {e}")
    
    # Example: Realtime Database
    print("\n3. Realtime Database")
    try:
        # Note: Realtime Database requires database URL in initialization
        # ref = db.reference('/')
        # print("   Realtime Database reference created")
        print("   Available (requires database URL in config)")
    except Exception as e:
        print(f"   Realtime DB example: {e}")
    
    # Example: Cloud Messaging
    print("\n4. Cloud Messaging (FCM)")
    try:
        from firebase_admin import messaging
        print("   FCM module imported successfully")
        # Example: Send a message
        # message = messaging.Message(
        #     notification=messaging.Notification(
        #         title='Test',
        #         body='Hello from Firebase Admin SDK',
        #     ),
        #     token='device_token_here',
        # )
        # response = messaging.send(message)
    except Exception as e:
        print(f"   FCM example: {e}")
    
    print("\n" + "=" * 50)
    print("Setup Complete!")
    print("=" * 50)
    print("\nYou can now:")
    print("- Manage users with Firebase Authentication")
    print("- Read/write data to Firestore")
    print("- Use Realtime Database")
    print("- Send push notifications with FCM")
    print("- Access Cloud Storage")
    print("\nEdit main.py to add your own Firebase operations!")


if __name__ == "__main__":
    main()
