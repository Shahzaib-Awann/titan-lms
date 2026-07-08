from pydantic import BaseModel, Field
from typing import Annotated

class UserQuestion(BaseModel):
    qestion: Annotated[str, Field(..., description='User question')]