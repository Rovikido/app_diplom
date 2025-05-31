from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.schemas import preset as preset_schema
from app.models.preset import Preset
from app.db.database import get_db
from app.models.model import Model

router = APIRouter()

@router.post("/", response_model=preset_schema.PresetInDB)
async def create_preset(preset: preset_schema.PresetCreate, db: AsyncSession = Depends(get_db)):
    model_result = await db.execute(select(Model).where(Model.id == preset.model_id))
    if not model_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Model with given ID not found")

    db_preset = Preset(**preset.dict())
    db.add(db_preset)
    await db.commit()
    await db.refresh(db_preset)
    return db_preset


@router.get("/", response_model=List[preset_schema.PresetInDB])
async def list_presets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Preset))
    return result.scalars().all()


@router.get("/{preset_id}", response_model=preset_schema.PresetInDB)
async def get_preset(preset_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Preset).where(Preset.id == preset_id))
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    return preset


@router.put("/{preset_id}", response_model=preset_schema.PresetInDB)
async def update_preset(preset_id: int, preset_data: preset_schema.PresetUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Preset).where(Preset.id == preset_id))
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")

    model_result = await db.execute(select(Model).where(Model.id == preset_data.model_id))
    if not model_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Model with given ID not found")

    for key, value in preset_data.dict().items():
        setattr(preset, key, value)
    await db.commit()
    await db.refresh(preset)
    return preset


@router.delete("/{preset_id}")
async def delete_preset(preset_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Preset).where(Preset.id == preset_id))
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    await db.delete(preset)
    await db.commit()
    return {"ok": True}
