from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.models.preset import Preset as DBPreset
from app.models.model import Model as DBModel
from app.services.model_runtime import runtime
from app.services.model_storage import download_model_from_huggingface

router = APIRouter()

@router.post("/load/{preset_id}")
async def load_model(preset_id: int, db: AsyncSession = Depends(get_db)):
    preset_result = await db.execute(select(DBPreset).where(DBPreset.id == preset_id))
    preset = preset_result.scalar_one_or_none()
    if not preset:
        return {"error": "Preset not found"}

    model_result = await db.execute(select(DBModel).where(DBModel.id == preset.model_id))
    model = model_result.scalar_one_or_none()
    if not model:
        return {"error": "Model not found"}

    if runtime.active_model and runtime.active_model.get("id") == model.id:
        runtime.update_preset(preset)
        return {
            "status": "preset updated",
            "model": runtime.active_model,
            "preset": runtime.preset
        }

    model_path = download_model_from_huggingface(
        hf_reference=model.huggin_face_refference,
        model_name=model.model_name
    )

    return runtime.load_model(model, preset, str(model_path))



@router.get("/current_model")
async def get_current_model():
    model_info = runtime.get_current_model_info()
    if not model_info:
        return {"error": "No model is currently loaded"}
    return model_info


@router.post("/stop")
async def stop_model():
    return runtime.stop_model()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()

            for token in runtime.generate_stream(message):
                await websocket.send_text(token)

    except WebSocketDisconnect:
        await websocket.close()
