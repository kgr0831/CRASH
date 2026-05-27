from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.analyze import router as analyze_router

app = FastAPI(title="CRASH API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(analyze_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "crash"}
