from pathlib import Path
from typing import List
import shutil
from huggingface_hub import snapshot_download


# Directory where all models are stored locally
MODEL_DIR = Path("./local_models")


def ensure_model_dir():
    if not MODEL_DIR.exists():
        MODEL_DIR.mkdir(parents=True, exist_ok=True)


def list_local_models() -> List[str]:
    ensure_model_dir()
    return [d.name for d in MODEL_DIR.iterdir() if d.is_dir()]


def model_exists_locally(model_name: str) -> bool:
    return (MODEL_DIR / model_name).exists()


def get_model_path(model_name: str) -> Path:
    path = MODEL_DIR / model_name
    if not path.exists():
        raise FileNotFoundError(f"Model '{model_name}' not found in local storage.")
    return path


def download_model_from_huggingface(hf_reference: str, model_name: str) -> Path:
    path = MODEL_DIR / model_name
    if path.exists():
        return path

    local_path = snapshot_download(
        repo_id=hf_reference,
        local_dir=path,
        local_dir_use_symlinks=False
    )

    return Path(local_path)


def delete_model(model_name: str) -> bool:
    """
    Deletes a locally stored model directory.
    Returns True if deleted, False if not found.
    """
    path = MODEL_DIR / model_name
    if path.exists() and path.is_dir():
        shutil.rmtree(path)
        return True
    return False
