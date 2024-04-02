from typing import List

from pydantic import BaseModel


class CreateDatasetPayload(BaseModel):
    title: str
    details: str
    tags: List[str]
    category: str
