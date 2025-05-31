from pydantic import BaseModel
from typing import Optional

class PresetBase(BaseModel):
    public_name: str
    bot_name: Optional[str] = "bot"
    task: Optional[str] = ""
    costraints: Optional[str] = ""
    model_id: int

    temperature: Optional[float] = 1.2
    repetition_penalty: Optional[float] = 1.0
    top_p: Optional[float] = 0.9
    top_k: Optional[float] = 20.0

class PresetCreate(PresetBase):
    pass

class PresetUpdate(PresetBase):
    pass

class PresetInDB(PresetBase):
    id: int

    class Config:
        from_attributes = True
