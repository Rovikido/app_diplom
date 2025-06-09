# 📘 Local LLM Launcher

> *Вебзастосунок для локального запуску великих мовних моделей з підтримкою пресетів, автономною генерацією відповідей та інтерфейсом чату.*

---

## 👤 Автор

* **ПІБ**: Закала Олександр
* **Група**: ФеП-41
* **Керівник**: Грабовський Володимир, доцент, к. ф.-м. н.
* **Дата виконання**: \[01.06.2025]

---

## 📌 Загальна інформація

* **Тип проєкту**: Вебзастосунок
* **Мова програмування**: Python + JavaScript
* **Фреймворки / Бібліотеки**: FastAPI, React, Tailwind CSS, Hugging Face Transformers

---

## 🧠 Опис функціоналу

* ⬇️ Завантаження моделей з Hugging Face
* 💾 Локальне збереження моделей
* 🧩 Налаштовувані пресети з параметрами генерації
* 💬 Потокова генерація через WebSocket
* 🌐 REST API для управління моделями та пресетами
* 🛰️ Паралельна підтримка `remote_backend`

---

## 🧱 Опис основних класів / файлів

| Клас / Файл              | Призначення                       |
| ------------------------ | --------------------------------- |
| `model_storage.py`       | Завантаження та кешування моделей |
| `model_runtime.py`       | Запуск моделі з обраним пресетом  |
| `inference.py`           | API для запуску генерації         |
| `presets.py`             | REST API для пресетів             |
| `remote_backend/main.py` | Опціональний дублюючий бекенд     |
| `PresetChat.jsx`         | UI-чат з LLM                      |
| `PresetsMain.jsx`        | Менеджер пресетів                 |
| `CreateModelWindow.jsx`  | Форма створення моделі            |

---

## ▶️ Як запустити проєкт "з нуля"

### 1. Встановлення інструментів

* Python 3.10+
* Node.js v18+ + npm

### 2. Клонування репозиторію

```bash
git clone https://github.com/Rovikido/app_diplom.git
cd local-llm-launcher
```

### 3. Встановлення залежностей

```bash
# Спільне середовище для backend та remote_backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
```

### 4. Запуск

```bash
# Основний бекенд
uvicorn backend.app.main:app --port 8000

# Remote backend (опціонально)
uvicorn remote_backend.main:app --port 8001

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🔌 API приклади

### 📥 Завантажити модель та пресет

**POST /inference/load/{preset\_id}**

```json
{
  "status": "loaded",
  "model": { ... },
  "preset": { ... }
}
```

---

### 💬 Генерація (WebSocket)

**WS /inference/ws**

Передає текст → отримує стрім відповідей.

---

### 📋 Отримати список моделей

**GET /models**

```json
[
  {
    "id": 1,
    "model_name": "Llama-2",
    "huggin_face_refference": "meta-llama/Llama-2-7b",
    "size": "4.3 GB"
  },
  ...
]
```

---

### 📋 Отримати список пресетів

**GET /presets**

```json
[
  {
    "id": 5,
    "public_name": "Code Assistant",
    "model_id": 1,
    "temperature": 1.2,
    ...
  }
]
```

---

### ➕ Створити новий пресет

**POST /presets**

```json
{
  "public_name": "Analyzer",
  "bot_name": "Bot",
  "task": "Review code quality.",
  "costraints": "Short answers only.",
  "model_id": 2,
  "temperature": 1.0,
  "repetition_penalty": 1.2,
  "top_p": 0.9,
  "top_k": 40
}
```

---

### 🗑️ Видалити пресет

**DELETE /presets/{id}**

```json
{
  "ok": true
}
```

---

## 🖱️ Інструкція для користувача

1. **Models** — додайте модель з Hugging Face
2. **Presets** — створіть налаштований шаблон
3. **Chat** — оберіть пресет і починайте взаємодію
4. **Remote backend** — за потреби запустіть на іншому порту

---

## 📷 Приклади / скриншоти

- Діаграма проекту
Diagram
[./screenshots/diagram_main.png]

- Додавання моделі
Models View
[./screenshots/model_creation.png]

- Створення пресету
Create Preset
[./screenshots/preset_creation.png]

- Інтерфейс чату
Chat Interface
[./screenshots/model_dialog.png]


---

## 🧪 Проблеми і рішення

| Проблема                  | Рішення                                      |
| ------------------------- | -------------------------------------------- |
| Модель не знаходиться     | Перевірити назву з Hugging Face              |
| WebSocket не працює       | Перевірити, чи бекенд активний на порту 8000 |
| Remote backend (вкладка Community) неактивний | Запустити `uvicorn remote_backend.main:app --port 8001`  |

---

## 🧾 Використані джерела / література

* FastAPI документація
* Hugging Face Transformers
* React документація
* WebSocket RFC6455
* SQLAlchemy + Pydantic
