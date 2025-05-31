import logging
from app.models.model import Model as DBModel
from app.models.preset import Preset as DBPreset
from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer
import torch
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelRuntime:
    def __init__(self):
        self.active_model = None
        self.preset = None
        self.tokenizer = None
        self.model = None

    def load_model(self, model: DBModel, preset: DBPreset, model_path: str):
        logger.debug(f"Loading model from path: {model_path}")
        self.active_model = {
            "id": model.id,
            "model_name": model.model_name,
            "reference": model.huggin_face_refference,
            "size": model.size,
            "path": model_path
        }
        self.preset = {
            "bot_name": preset.bot_name,
            "task": preset.task,
            "costraints": preset.costraints,
            "temperature": preset.temperature,
            "repetition_penalty": preset.repetition_penalty,
            "top_p": preset.top_p,
            "top_k": preset.top_k,
        }


        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(model_path)

        return {
            "status": "loaded",
            "model": self.active_model,
            "preset": self.preset
        }
    
    def update_preset(self, preset: DBPreset):
        self.preset = {
            "bot_name": preset.bot_name,
            "task": preset.task,
            "costraints": preset.costraints,
            "temperature": preset.temperature,
            "repetition_penalty": preset.repetition_penalty,
            "top_p": preset.top_p,
            "top_k": preset.top_k,
        }

    def get_current_model_info(self):
        if not self.active_model:
            return None
        return {
            "id": self.active_model.get("id"),
            "model_name": self.active_model.get("model_name")
        }


    def stop_model(self):
        self.active_model = None
        self.preset = None
        self.tokenizer = None
        self.model = None
        return {"status": "stopped"}

    def generate_stream(self, message: str):
        if not self.active_model or not self.preset:
            yield "Model not loaded."
            return

        if not self.tokenizer or not self.model:
            yield "Model/tokenizer not initialized."
            return

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(device)

        prompt = f"###You are {self.preset['bot_name']}\
        Your task is to: {self.preset['task']}\n\
        Constraints for you to follow: {self.preset['costraints']}!!!###\n\
        User Message: {message}"

        inputs = self.tokenizer(prompt, return_tensors="pt").to(device)

        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)
        generation_kwargs = {
            "inputs": inputs["input_ids"],
            "attention_mask": inputs["attention_mask"],
            "max_new_tokens": 512,
            "do_sample": True,
            "temperature": self.preset.get("temperature", 1.2),
            "top_k": int(self.preset.get("top_k", 20)),
            "top_p": self.preset.get("top_p", 0.9),
            "repetition_penalty": self.preset.get("repetition_penalty", 1.0),
            "pad_token_id": self.tokenizer.eos_token_id,
            "streamer": streamer
        }


        thread = threading.Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()

        for token in streamer:
            yield token
        
        yield "__END__"


# Singleton instance
runtime = ModelRuntime()
