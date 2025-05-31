import requests

class HuggingFaceModelNotFound(Exception):
    pass

def get_model_size_from_huggingface(hf_reference: str) -> str:
    response = requests.get(f"https://huggingface.co/api/models/{hf_reference}")
    if response.status_code == 404:
        raise HuggingFaceModelNotFound(f"Model '{hf_reference}' not found on Hugging Face")
    if response.status_code != 200:
        raise Exception("Unexpected error accessing Hugging Face API")
    
    data = response.json()
    size_bytes = data.get("usedStorage", {})
    if size_bytes:
        size_gb = round(size_bytes / (1024**3), 2)
        return f"{size_gb} GB"
    return "unknown"

