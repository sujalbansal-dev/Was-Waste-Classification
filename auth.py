import streamlit_authenticator as stauth
from database import get_all_users

def get_authenticator():
    # Fetch credentials from the SQLite database
    credentials = get_all_users()

    # Export the authenticator object
    return stauth.Authenticate(
        credentials,
        "wasify_auth",
        "abcdef",
        30
    )
