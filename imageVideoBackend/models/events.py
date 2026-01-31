"""
Pydantic models for distress events.
"""

from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
import uuid


class DistressEvent(BaseModel):
    """Schema for a distress event detected from video analysis."""
    
    eventId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    signalType: Literal[
        "PROLONGED_IMMOBILITY",
        "SUDDEN_COLLAPSE", 
        "REPEATED_BENDING",
        "ERRATIC_PACING",
        "CROWD_FORMATION"
    ]
    confidence: float = Field(ge=0.0, le=1.0)
    zone: str = "WAITING_AREA"
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    blobId: int | None = None  # Internal tracking ID (optional)
    
    class Config:
        json_schema_extra = {
            "example": {
                "eventId": "550e8400-e29b-41d4-a716-446655440000",
                "signalType": "PROLONGED_IMMOBILITY",
                "confidence": 0.82,
                "zone": "WAITING_AREA",
                "timestamp": "2026-01-31T18:45:00"
            }
        }


class AnalysisResponse(BaseModel):
    """Response schema for video analysis endpoint."""
    
    events: list[DistressEvent]
    videoProcessed: bool = True
    framesAnalyzed: int = 0
    totalDurationSec: float = 0.0
    message: str = "Analysis complete"


class HealthResponse(BaseModel):
    """Response schema for health check."""
    
    status: str = "healthy"
    version: str = "1.0.0"
