"""
Blob Detector Module
Detects human-sized moving regions using background subtraction.
"""

import cv2
import numpy as np
from typing import List, Tuple
from dataclasses import dataclass
import config


@dataclass
class DetectedBlob:
    """Represents a detected person/blob in a frame."""
    x: int  # Bounding box x
    y: int  # Bounding box y
    width: int
    height: int
    centroid_x: float
    centroid_y: float
    area: int
    contour: np.ndarray = None
    
    @property
    def bbox(self) -> Tuple[int, int, int, int]:
        """Returns (x, y, width, height) tuple."""
        return (self.x, self.y, self.width, self.height)
    
    @property
    def centroid(self) -> Tuple[float, float]:
        """Returns (x, y) centroid tuple."""
        return (self.centroid_x, self.centroid_y)


class BlobDetector:
    """
    Detects human-sized blobs using background subtraction.
    Uses MOG2 algorithm for robust background modeling.
    """
    
    def __init__(self):
        """Initialize the blob detector with background subtractor."""
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(
            history=config.BG_HISTORY,
            varThreshold=config.BG_VAR_THRESHOLD,
            detectShadows=config.BG_DETECT_SHADOWS
        )
        
        # Morphological kernel for noise removal
        self.morph_kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE,
            (config.MORPH_KERNEL_SIZE, config.MORPH_KERNEL_SIZE)
        )
        
    def detect(self, frame: np.ndarray) -> List[DetectedBlob]:
        """
        Detect blobs in a single frame.
        
        Args:
            frame: BGR image as numpy array
            
        Returns:
            List of DetectedBlob objects
        """
        # Apply background subtraction
        fg_mask = self.bg_subtractor.apply(frame)
        
        # Remove shadows (marked as gray in MOG2)
        _, fg_mask = cv2.threshold(fg_mask, 250, 255, cv2.THRESH_BINARY)
        
        # Morphological operations to clean up
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, self.morph_kernel)
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, self.morph_kernel)
        fg_mask = cv2.dilate(fg_mask, self.morph_kernel, iterations=2)
        
        # Find contours
        contours, _ = cv2.findContours(
            fg_mask, 
            cv2.RETR_EXTERNAL, 
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        blobs = []
        for contour in contours:
            blob = self._process_contour(contour)
            if blob is not None:
                blobs.append(blob)
        
        return blobs
    
    def _process_contour(self, contour: np.ndarray) -> DetectedBlob | None:
        """
        Process a contour and return a DetectedBlob if valid.
        
        Args:
            contour: OpenCV contour
            
        Returns:
            DetectedBlob if valid, None otherwise
        """
        area = cv2.contourArea(contour)
        
        # Filter by area
        if area < config.MIN_BLOB_AREA or area > config.MAX_BLOB_AREA:
            return None
        
        # Get bounding rectangle
        x, y, w, h = cv2.boundingRect(contour)
        
        # Filter by aspect ratio (height/width for standing humans)
        if w > 0:
            aspect_ratio = h / w
            if aspect_ratio < config.ASPECT_RATIO_MIN or aspect_ratio > config.ASPECT_RATIO_MAX:
                return None
        
        # Calculate centroid
        M = cv2.moments(contour)
        if M["m00"] > 0:
            cx = M["m10"] / M["m00"]
            cy = M["m01"] / M["m00"]
        else:
            cx = x + w / 2
            cy = y + h / 2
        
        return DetectedBlob(
            x=x,
            y=y,
            width=w,
            height=h,
            centroid_x=cx,
            centroid_y=cy,
            area=area,
            contour=contour
        )
    
    def reset(self):
        """Reset the background model."""
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(
            history=config.BG_HISTORY,
            varThreshold=config.BG_VAR_THRESHOLD,
            detectShadows=config.BG_DETECT_SHADOWS
        )
