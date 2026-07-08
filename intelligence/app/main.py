from fastapi import FastAPI
from api.chatbot_router import router

app = FastAPI()

@app.get('/')
def home():
    return {'message':'Chatbot'}

app.include_router(router, prefix="/chatbot")