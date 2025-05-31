from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import requests


from app.schemas import model as model_schema
from app.models.model import Model
from app.db.database import get_db
from app.services.hf_utils import get_model_size_from_huggingface, HuggingFaceModelNotFound


router = APIRouter()


@router.post("/", response_model=model_schema.ModelInDB)
async def create_model(model: model_schema.ModelCreate, db: AsyncSession = Depends(get_db)):
    try:
        size = get_model_size_from_huggingface(model.huggin_face_refference)
    except HuggingFaceModelNotFound as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    db_model = Model(**model.dict(), size=size)
    db.add(db_model)
    await db.commit()
    await db.refresh(db_model)
    return db_model


@router.get("/", response_model=List[model_schema.ModelInDB])
async def list_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Model))
    return result.scalars().all()


@router.get("/{model_id}", response_model=model_schema.ModelInDB)
async def get_model(model_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


@router.put("/{model_id}", response_model=model_schema.ModelInDB)
async def update_model(model_id: int, model_data: model_schema.ModelUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    for key, value in model_data.dict().items():
        setattr(model, key, value)

    try:
        model.size = get_model_size_from_huggingface(model.huggin_face_refference)
    except HuggingFaceModelNotFound as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    await db.commit()
    await db.refresh(model)
    return model


@router.delete("/{model_id}")
async def delete_model(model_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    await db.delete(model)
    await db.commit()
    return {"ok": True}


class HuggingFaceModelNotFound(Exception):
    pass

def get_model_size_from_huggingface(hf_reference: str) -> str:
    response = requests.get(f"https://huggingface.co/api/models/{hf_reference}")
    if response.status_code == 404:
        raise HuggingFaceModelNotFound(f"Model '{hf_reference}' not found on Hugging Face")
    if response.status_code != 200:
        raise Exception("Unexpected error accessing Hugging Face API")
    
    data = response.json()
    size_bytes = data.get("modelSize", {}).get("size", None)
    if size_bytes:
        size_gb = round(size_bytes / (1024**3), 2)
        return f"{size_gb} GB"
    return "unknown"
