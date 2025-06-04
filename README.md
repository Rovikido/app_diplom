# Local LLM Launcher

## Overview

**Local LLM Launcher** is an application that allows users to run large language models (LLMs) locally without relying on cloud services. Its primary goal is to automate software development tasks such as code generation, test creation, and vulnerability detection. The app lets users download models from Hugging Face, store them locally, and create/use presets to tailor model behavior for specific tasks.

---

## Features

* Download LLMs directly from Hugging Face
* Local model storage and reuse
* Preset system with full customization support
* Web interface for chatting with models
* REST API and WebSocket support
* Fully offline, private and secure

---

## Architecture

* **Backend**: Python, FastAPI, SQLAlchemy, Hugging Face Transformers
* **Frontend**: React + Tailwind CSS
* **Model storage**: `./local_models`
* **Database**: SQLite (configurable)
* **Model interaction**: WebSocket streaming

---

## Getting Started

### 1. Backend setup

#### Install dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Run the server:

```bash
cd backend
uvicorn app.main:app --port 8000
```

```bash
cd remote_backend
uvicorn main:app --port 8001
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## How It Works

1. User creates a **model** by providing a name and a Hugging Face repo link.
2. The model is downloaded and stored locally via `model_storage.py`.
3. Users create **presets** — saved configurations for tasks like code generation or analysis.
4. A preset is loaded, and the model is initialized using `model_runtime.py`.
5. Messages are sent via WebSocket and the model responds in a streaming fashion.
6. The UI updates in real-time using the React frontend.

---

## Example Workflow

1. Create a model:

   * Name: anything
   * Reference to hugginface: e.g., `meta-llama/Llama-2-7b-hf`

2. Create a preset:

   * Choose model
   * Define `task` and `constraints`
   * Tune generation parameters like `temperature`, `top_p`, etc. (OPTIONAL)

3. Start a chat using the selected preset.

4. Upload a model.


