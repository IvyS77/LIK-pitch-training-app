from fastapi import FastAPI
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import os

load_dotenv()
cred = credentials.Certificate(os.environ["PATH_TO_FIREBASE_ADMIN_KEY"])
firebase_admin.initialize_app(cred, {'databaseURL': 'https://ear-training-8f082.firebaseio.com'})
db = firestore.client()
doc = db.collection("users").document("pU1z2BwT9l0hO1p6R34a").get()
if (doc.exists) :
    print(doc.to_dict())

app = FastAPI()