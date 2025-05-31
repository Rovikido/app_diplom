import pytest


@pytest.mark.asyncio
async def test_create_preset(client):
    model_response = await client.post("/models/", json={
        "model_name": "preset-model-create",
        "huggin_face_refference": "builtin/echo",
        "size": "tiny"
    })
    model_id = model_response.json()["id"]

    response = await client.post("/presets/", json={
        "public_name": "Create Test",
        "bot_name": "Tester",
        "task": "Some task",
        "costraints": "None",
        "model_id": model_id
    })
    assert response.status_code == 200
    assert response.json()["bot_name"] == "Tester"


@pytest.mark.asyncio
async def test_get_preset(client):
    model_response = await client.post("/models/", json={
        "model_name": "preset-model-get",
        "huggin_face_refference": "builtin/echo",
        "size": "tiny"
    })
    model_id = model_response.json()["id"]

    preset_response = await client.post("/presets/", json={
        "public_name": "Get Test",
        "bot_name": "Echoer",
        "task": "",
        "costraints": "",
        "model_id": model_id
    })
    preset_id = preset_response.json()["id"]

    get_resp = await client.get(f"/presets/{preset_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["public_name"] == "Get Test"


@pytest.mark.asyncio
async def test_update_preset(client):
    model_resp = await client.post("/models/", json={
        "model_name": "preset-model-update",
        "huggin_face_refference": "builtin/echo",
        "size": "tiny"
    })
    model_id = model_resp.json()["id"]

    preset_resp = await client.post("/presets/", json={
        "public_name": "Before Update",
        "bot_name": "Original",
        "task": "",
        "costraints": "",
        "model_id": model_id
    })
    preset_id = preset_resp.json()["id"]

    update_resp = await client.put(f"/presets/{preset_id}", json={
        "public_name": "After Update",
        "bot_name": "Updated",
        "task": "New task",
        "costraints": "none",
        "model_id": model_id
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["bot_name"] == "Updated"


@pytest.mark.asyncio
async def test_delete_preset(client):
    model_resp = await client.post("/models/", json={
        "model_name": "preset-model-delete",
        "huggin_face_refference": "builtin/echo",
        "size": "tiny"
    })
    model_id = model_resp.json()["id"]

    preset_resp = await client.post("/presets/", json={
        "public_name": "To Delete",
        "model_id": model_id
    })
    preset_id = preset_resp.json()["id"]

    del_resp = await client.delete(f"/presets/{preset_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["ok"] is True

    check_resp = await client.get(f"/presets/{preset_id}")
    assert check_resp.status_code == 404


@pytest.mark.asyncio
async def test_list_models(client):
    # Add one model first
    response = await client.post("/models/", json={
        "model_name": "list-model-1",
        "huggin_face_refference": "builtin/test",
        "size": "tiny"
    })
    assert response.status_code == 200

    # Get all models
    list_resp = await client.get("/models/")
    assert list_resp.status_code == 200
    models = list_resp.json()
    assert isinstance(models, list)
    assert any(m["model_name"] == "list-model-1" for m in models)
