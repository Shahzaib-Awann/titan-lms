from fastapi import FastAPI

app = FastAPI(title="Titan LMS Intelligence")

@app.get("/")
def home():
    return {"message": "Titan Intelligence API"}