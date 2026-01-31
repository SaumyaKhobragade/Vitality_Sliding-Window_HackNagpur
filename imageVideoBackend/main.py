"""
Hospital Triage AI Backend API

FastAPI application for:
1. Video-Based Behavioral Distress Detection (VBDD)
2. Image-Based Injury Severity Assist (ISA)

Usage:
    uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.events import HealthResponse
from api.routes import router as analysis_router
from api.isa_routes import router as isa_router

# Create FastAPI app
app = FastAPI(
    title="Hospital Triage AI Backend",
    description="""
    AI-powered triage assistance system for hospital waiting areas.
    
    ## Video Analysis (VBDD)
    - Detects behavioral distress patterns from video footage
    - Signals: PROLONGED_IMMOBILITY, SUDDEN_COLLAPSE, REPEATED_BENDING, ERRATIC_PACING, CROWD_FORMATION
    
    ## Image Analysis (ISA)
    - Analyzes injury images for severity assessment
    - Provides routing recommendations based on visual features
    
    ## Ethical Safeguards
    - No raw media stored long-term
    - No facial recognition or identity tracking
    - Human confirmation required for all decisions
    """,
    version="1.0.0",
    contact={
        "name": "Vitality Team",
    },
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis_router, tags=["Video Analysis"])
app.include_router(isa_router, prefix="/isa", tags=["Injury Analysis"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Hospital Triage AI Backend",
        "version": "1.0.0",
        "docs_url": "/docs",
        "modules": {
            "video_analysis": {
                "analyze": "POST /analyze - Upload video for distress detection",
                "events": "GET /events - List detected distress events"
            },
            "injury_analysis": {
                "analyze": "POST /isa/analyze - Upload image for injury assessment",
                "results": "GET /isa/results - List injury analysis results",
                "health": "GET /isa/health - ISA module health check"
            }
        },
        "health": "GET /health - Overall health check"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
