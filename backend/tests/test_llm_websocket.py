import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine
import asyncio


# ✅ This fixture ensures the database tables are created before the test runs
@pytest.fixture(scope="module", autouse=True)
def setup_database():
    async def init():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(init())
    yield  # Let tests run
    # (optional cleanup could go here)
    

def test_websocket_with_runtime():
    client = TestClient(app)

    # Create model
    model_resp = client.post("/models/", json={
        "model_name": "ws-model",
        "huggin_face_refference": "builtin/echo",
        "size": "tiny"
    })
    assert model_resp.status_code == 200
    model_id = model_resp.json()["id"]

    # Create preset
    preset_resp = client.post("/presets/", json={
        "public_name": "WebSocket Test",
        "bot_name": "EchoBot",
        "task": "",
        "costraints": "",
        "model_id": model_id
    })
    assert preset_resp.status_code == 200
    preset_id = preset_resp.json()["id"]

    # Load the model
    load_resp = client.post(f"/inference/load/{preset_id}")
    assert load_resp.status_code == 200
    assert load_resp.json()["status"] == "loaded"

    # WebSocket test
    with client.websocket_connect("/inference/ws") as ws:
        ws.send_text("hello world")
        response = ws.receive_text()
        assert response.startswith("EchoBot (simulated): ")
        assert "dlrow olleh" in response
