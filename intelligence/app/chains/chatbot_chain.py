from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

def chatbot():
    parser = StrOutputParser()

    template = ChatPromptTemplate(
        [
            ("system", "You are a helpful AI bot. Your name is ALI, You're a TITAN-LMS assistant."),
            ("human", "{user_input}"),
        ]
    )

    model = ChatGroq(model='groq/compound-mini', temperature=0.5, max_tokens=1000)

    chain = template | model | parser
    
    return chain