from fastapi import APIRouter
from fastapi.responses import JSONResponse
from schema.chatbot_schema import UserQuestion
from chains.chatbot_chain import chatbot
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

chain = chatbot()

@router.get('/health', status_code=200)
def health_check():
    return {
        'status': "ok",
        'Model Name': 'Groq/Compound-mini',
        'Max Tokens': '1000',
        'Temperature': '0.5'
        }

@router.post('/ask')
def chatbot(question: UserQuestion):

    try:
        answer = chain.invoke(question)
        return JSONResponse(status_code=200, content={'message': answer})
    
    except Exception as e:
        return JSONResponse(status_code=500, content=str(e))