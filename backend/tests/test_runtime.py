import pytest
from app.services.model_runtime import ModelRuntime
from types import SimpleNamespace

@pytest.mark.asyncio
async def test_model_runtime_generate():
    runtime = ModelRuntime()

    dummy_model = SimpleNamespace(
        model_name="builtin",
        huggin_face_refference="builtin/echo",
        size="tiny"
    )
    dummy_preset = SimpleNamespace(
        bot_name="EchoBot",
        task="Echo everything.",
        costraints=""
    )

    result = runtime.load_model(dummy_model, dummy_preset)
    assert result["status"] == "loaded"

    output = runtime.generate("hello")
    assert output == "EchoBot (simulated): olleh"

    stopped = runtime.stop_model()
    assert stopped["status"] == "stopped"
