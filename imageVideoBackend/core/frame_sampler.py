"""
Frame Sampler Module
Extracts frames from video at specified FPS rate.
"""

import cv2
import numpy as np
from pathlib import Path
from typing import Generator, Tuple
import config


def sample_frames(video_path: str | Path, target_fps: int = None) -> Generator[Tuple[int, np.ndarray, float], None, None]:
    """
    Generator that yields frames from video at specified FPS.
    
    Args:
        video_path: Path to the video file
        target_fps: Target frames per second (default from config)
        
    Yields:
        Tuple of (frame_index, frame_array, timestamp_sec)
    """
    if target_fps is None:
        target_fps = config.SAMPLE_FPS
    
    video_path = Path(video_path)
    if not video_path.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    cap = cv2.VideoCapture(str(video_path))
    
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
    
    try:
        # Get video properties
        video_fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if video_fps <= 0:
            video_fps = 30  # Default assumption
        
        # Calculate frame skip interval
        frame_interval = max(1, int(video_fps / target_fps))
        
        frame_index = 0
        sampled_index = 0
        
        while True:
            ret, frame = cap.read()
            
            if not ret:
                break
            
            # Only yield frames at target FPS interval
            if frame_index % frame_interval == 0:
                timestamp = frame_index / video_fps
                yield (sampled_index, frame, timestamp)
                sampled_index += 1
            
            frame_index += 1
            
    finally:
        cap.release()


def get_video_info(video_path: str | Path) -> dict:
    """
    Get metadata about a video file.
    
    Args:
        video_path: Path to the video file
        
    Returns:
        Dictionary with video properties
    """
    video_path = Path(video_path)
    if not video_path.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    cap = cv2.VideoCapture(str(video_path))
    
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
    
    try:
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        duration = total_frames / fps if fps > 0 else 0
        
        return {
            "fps": fps,
            "total_frames": total_frames,
            "width": width,
            "height": height,
            "duration_sec": duration
        }
    finally:
        cap.release()
