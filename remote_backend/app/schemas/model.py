from pydantic import BaseModel
from typing import Optional


class ModelBase(BaseModel):
    model_name: str
    huggin_face_refference: str


class ModelCreate(ModelBase):
    pass


class ModelUpdate(ModelBase):
    pass


class ModelInDB(ModelBase):
    id: int
    size: Optional[str] = None

    class Config:
        from_attributes = True

