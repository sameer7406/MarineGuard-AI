import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi_service.routes import health, debris, vessel

app = FastAPI(
    title="MarineGuard AI - ML & Geospatial Inference Service",
    description="Multispectral satellite computer vision, ocean current movement prediction, environmental risk scoring, and vessel behavior analysis service.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(debris.router, prefix="/ml", tags=["Debris Detection & Trajectory"])
app.include_router(vessel.router, prefix="/ml", tags=["Vessel Detection & Risk"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
