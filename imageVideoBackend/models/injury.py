"""
Pydantic models for Injury Severity Analysis.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class VisualFeatures(BaseModel):
    """Visual features extracted from injury image."""
    
    woundAreaRatio: float = Field(ge=0.0, le=1.0, description="Ratio of wound area to total image")
    bleedingIntensity: float = Field(ge=0.0, le=1.0, description="Intensity of red/blood colors")
    edgeIrregularity: float = Field(ge=0.0, le=1.0, description="How irregular the wound edges are")
    colorContrast: float = Field(ge=0.0, le=1.0, description="Contrast between wound and skin")
    
    class Config:
        json_schema_extra = {
            "example": {
                "woundAreaRatio": 0.15,
                "bleedingIntensity": 0.6,
                "edgeIrregularity": 0.4,
                "colorContrast": 0.5
            }
        }


class InjuryAnalysisResult(BaseModel):
    """Result of injury severity analysis."""
    
    analysisId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    severityScore: float = Field(ge=0.0, le=100.0, description="Overall severity score 0-100")
    severityLevel: str = Field(description="LOW, MEDIUM, or HIGH")
    routingRecommendation: str = Field(description="Suggested patient routing")
    features: VisualFeatures
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence in the analysis")
    requiresConfirmation: bool = Field(default=True, description="Whether staff confirmation is needed")
    explanation: str = Field(default="", description="Human-readable explanation of the analysis")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    class Config:
        json_schema_extra = {
            "example": {
                "analysisId": "550e8400-e29b-41d4-a716-446655440000",
                "severityScore": 45.5,
                "severityLevel": "MEDIUM",
                "routingRecommendation": "Doctor evaluation",
                "features": {
                    "woundAreaRatio": 0.15,
                    "bleedingIntensity": 0.6,
                    "edgeIrregularity": 0.4,
                    "colorContrast": 0.5
                },
                "confidence": 0.75,
                "requiresConfirmation": True,
                "explanation": "Moderate visible wound area with significant bleeding detected",
                "timestamp": "2026-01-31T22:00:00"
            }
        }


class ISAHealthResponse(BaseModel):
    """Health check response for ISA module."""
    
    status: str = "healthy"
    modelLoaded: bool = False
    version: str = "1.0.0"
