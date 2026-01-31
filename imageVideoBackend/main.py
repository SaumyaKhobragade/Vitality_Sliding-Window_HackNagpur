"""
Video-Based Behavioral Distress Detection (VBDD) API

FastAPI application for detecting behavioral distress patterns
from recorded hospital waiting area footage.

Usage:
    uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.events import HealthResponse
from api.routes import router as analysis_router

# Create FastAPI app
app = FastAPI(
    title="Video-Based Behavioral Distress Detection API",
    description="""
    Detects observable behavioral distress patterns from video footage of hospital waiting areas.
    
    ## Features
    - **Frame sampling** at 1 FPS for efficient processing
    - **Blob detection** using background subtraction
    - **Behavioral analysis** for distress signals
    - **Confidence scoring** to reduce false positives
    
    ## Distress Signals Detected
    - **PROLONGED_IMMOBILITY**: Person stationary for extended time
    - **SUDDEN_COLLAPSE**: Rapid downward movement followed by immobility
    
    ## Ethical Safeguards
    - No raw video frames are stored
    - No facial recognition or emotion detection
    - Heuristic-based, explainable detection only
    - Human confirmation required for high-confidence alerts
    """,
    version="1.0.0",
    contact={
        "name": "VBDD Team",
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


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Video-Based Behavioral Distress Detection API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "endpoints": {
            "analyze": "POST /analyze - Upload and analyze video",
            "analyze_local": "POST /analyze-local - Analyze local video file",
            "events": "GET /events - List all detected events",
            "health": "GET /health - Health check"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="1.0.0")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
