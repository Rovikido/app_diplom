from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api import presets, models, inference
from app.db.database import Base, engine


app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RemoveCSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        if "content-security-policy" in response.headers:
            del response.headers["content-security-policy"]
        return response

app.add_middleware(RemoveCSPMiddleware)


app.include_router(presets.router, prefix="/presets", tags=["Presets"])
app.include_router(models.router, prefix="/models", tags=["Models"])
app.include_router(inference.router, prefix="/inference", tags=["Inference"])


# uvicorn app.main:app --reload --port 8000
