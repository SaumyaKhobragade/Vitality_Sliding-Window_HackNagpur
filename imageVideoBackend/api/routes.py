"""
API Routes for Video-Based Behavioral Distress Detection.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import tempfile
import os
from typing import List

from models.events import DistressEvent, AnalysisResponse
from core.frame_sampler import sample_frames, get_video_info
from core.blob_detector import BlobDetector
from core.tracker import BlobTracker
from core.distress_analyzer import DistressAnalyzerPhase2  # Use Phase 2 for all signals


router = APIRouter()

# In-memory event store (for demo purposes)
event_store: List[DistressEvent] = []


def process_video(video_path: str) -> AnalysisResponse:
    """
    Process a video file and detect distress signals.
    
    Args:
        video_path: Path to the video file
        
    Returns:
        AnalysisResponse with detected events
    """
    # Get video info
    video_info = get_video_info(video_path)
    
    # Initialize components
    detector = BlobDetector()
    tracker = BlobTracker()
    analyzer = DistressAnalyzerPhase2()  # Phase 2 includes all signal types
    
    all_events: List[DistressEvent] = []
    frames_analyzed = 0
    
    # Process video frame by frame
    for frame_idx, frame, timestamp in sample_frames(video_path):
        # Detect blobs in frame
        blobs = detector.detect(frame)
        
        # Update tracker with detections
        tracked_blobs = tracker.update(blobs, timestamp)
        
        # Analyze for distress signals
        events = analyzer.analyze(tracked_blobs, timestamp)
        all_events.extend(events)
        
        frames_analyzed += 1
    
    # Store events for later retrieval
    event_store.extend(all_events)
    
    return AnalysisResponse(
        events=all_events,
        videoProcessed=True,
        framesAnalyzed=frames_analyzed,
        totalDurationSec=video_info["duration_sec"],
        message=f"Analysis complete. Detected {len(all_events)} distress events."
    )


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(video: UploadFile = File(...)):
    """
    Analyze a video file for behavioral distress signals.
    
    Upload a video file (MP4/AVI) and receive detected distress events.
    """
    # Validate file type
    allowed_extensions = {".mp4", ".avi", ".mov", ".mkv"}
    file_ext = Path(video.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
        try:
            content = await video.read()
            tmp_file.write(content)
            tmp_file.flush()
            
            # Process the video
            response = process_video(tmp_file.name)
            
            return response
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_file.name)
            except:
                pass


@router.post("/analyze-local")
async def analyze_local_video(video_path: str) -> AnalysisResponse:
    """
    Analyze a video file from local filesystem.
    
    Useful for testing with pre-placed sample videos.
    """
    path = Path(video_path)
    
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Video file not found: {video_path}")
    
    if not path.suffix.lower() in {".mp4", ".avi", ".mov", ".mkv"}:
        raise HTTPException(status_code=400, detail="Invalid video format")
    
    try:
        response = process_video(str(path))
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")


@router.get("/events", response_model=List[DistressEvent])
async def get_events():
    """
    Get all stored distress events.
    """
    return event_store


@router.delete("/events")
async def clear_events():
    """
    Clear all stored events.
    """
    event_store.clear()
    return {"message": "Events cleared", "count": 0}
