"""
API Routes for Image-Based Injury Severity Assist (ISA).
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pathlib import Path
import tempfile
import os
from typing import List

from models.injury import InjuryAnalysisResult, ISAHealthResponse
from core.injury_analyzer import get_analyzer


router = APIRouter()

# In-memory results store (for demo purposes)
results_store: List[InjuryAnalysisResult] = []


@router.post("/analyze", response_model=InjuryAnalysisResult)
async def analyze_injury_image(image: UploadFile = File(...)):
    """
    Analyze an injury image for severity assessment.
    
    Upload an image (JPG/PNG) of a visible external injury.
    Returns severity score, level, routing recommendation, and visual features.
    """
    # Validate file type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    file_ext = Path(image.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
        try:
            content = await image.read()
            tmp_file.write(content)
            tmp_file.flush()
            
            # Analyze the image
            analyzer = get_analyzer()
            result = analyzer.analyze(tmp_file.name)
            
            # Store result
            results_store.append(result)
            
            return result
            
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")
        finally:
            # Clean up temp file (image not stored long-term)
            try:
                os.unlink(tmp_file.name)
            except:
                pass


@router.post("/analyze-local", response_model=InjuryAnalysisResult)
async def analyze_local_image(image_path: str = Query(..., description="Path to local image file")):
    """
    Analyze an injury image from local filesystem.
    
    Useful for testing with pre-placed sample images.
    """
    path = Path(image_path)
    
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Image file not found: {image_path}")
    
    allowed_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    if path.suffix.lower() not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    try:
        analyzer = get_analyzer()
        result = analyzer.analyze(str(path))
        
        # Store result
        results_store.append(result)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")


@router.get("/results", response_model=List[InjuryAnalysisResult])
async def get_results(limit: int = Query(10, ge=1, le=100)):
    """
    Get recent injury analysis results.
    """
    return results_store[-limit:]


@router.delete("/results")
async def clear_results():
    """
    Clear all stored results.
    """
    results_store.clear()
    return {"message": "Results cleared", "count": 0}


@router.get("/health", response_model=ISAHealthResponse)
async def isa_health_check():
    """
    Health check for ISA module.
    """
    analyzer = get_analyzer()
    return ISAHealthResponse(
        status="healthy",
        modelLoaded=analyzer.is_model_loaded(),
        version="1.0.0"
    )
