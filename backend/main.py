from fastapi import FastAPI
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import os

load_dotenv()

# Init Firebase Admin once
cred = credentials.Certificate(os.environ["PATH_TO_FIREBASE_ADMIN_KEY"])
if not firebase_admin._apps:
    firebase_admin.initialize_app(
        cred,
        {"databaseURL": "https://ear-training-8f082.firebaseio.com"},
    )

db = firestore.client()

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/user")
def get_user():
    # NOTE: hard-coded for now (demo/testing)
    user_id = "pU1z2BwT9l0hO1p6R34a"

    snap = db.collection("users").document(user_id).get()
    if not snap.exists:
        return {"error": "user not found"}

    data = snap.to_dict() or {}
    data.setdefault("level", 1)
    data.setdefault("currentXp", 0)
    data.setdefault("streak", 0)
    data.setdefault("uid", user_id)
    return data


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}