"""
Tracker Module
Tracks blobs across frames and maintains state history.
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from collections import deque
import config
from core.blob_detector import DetectedBlob


@dataclass
class TrackedBlob:
    """Represents a tracked blob with history."""
    blob_id: int
    centroid_history: deque = field(default_factory=lambda: deque(maxlen=config.TRACKING_WINDOW_SEC))
    bbox_height_history: deque = field(default_factory=lambda: deque(maxlen=config.TRACKING_WINDOW_SEC))
    timestamp_history: deque = field(default_factory=lambda: deque(maxlen=config.TRACKING_WINDOW_SEC))
    velocity_history: deque = field(default_factory=lambda: deque(maxlen=config.TRACKING_WINDOW_SEC))
    
    last_centroid: Tuple[float, float] = (0, 0)
    last_bbox_height: int = 0
    last_seen_timestamp: float = 0
    idle_time: float = 0
    frames_tracked: int = 0
    is_active: bool = True
    
    def update(self, blob: DetectedBlob, timestamp: float):
        """Update tracked blob with new detection."""
        new_centroid = blob.centroid
        
        # Calculate velocity if we have previous position
        if self.frames_tracked > 0:
            time_delta = timestamp - self.last_seen_timestamp
            if time_delta > 0:
                dx = new_centroid[0] - self.last_centroid[0]
                dy = new_centroid[1] - self.last_centroid[1]
                velocity = (dx / time_delta, dy / time_delta)
                self.velocity_history.append(velocity)
                
                # Update idle time
                displacement = np.sqrt(dx**2 + dy**2)
                if displacement < config.IMMOBILITY_THRESHOLD_PX:
                    self.idle_time += time_delta
                else:
                    self.idle_time = 0
        
        # Store history
        self.centroid_history.append(new_centroid)
        self.bbox_height_history.append(blob.height)
        self.timestamp_history.append(timestamp)
        
        # Update last known state
        self.last_centroid = new_centroid
        self.last_bbox_height = blob.height
        self.last_seen_timestamp = timestamp
        self.frames_tracked += 1
    
    def get_recent_velocity(self, n: int = 3) -> Optional[Tuple[float, float]]:
        """Get average velocity over last n samples."""
        if len(self.velocity_history) < n:
            return None
        recent = list(self.velocity_history)[-n:]
        avg_vx = np.mean([v[0] for v in recent])
        avg_vy = np.mean([v[1] for v in recent])
        return (avg_vx, avg_vy)
    
    def get_centroid_displacement(self, window_sec: float) -> Optional[float]:
        """Get total displacement over a time window."""
        if len(self.centroid_history) < 2:
            return None
        
        # Find start index based on time window
        current_time = self.timestamp_history[-1]
        start_idx = 0
        for i, t in enumerate(self.timestamp_history):
            if current_time - t <= window_sec:
                start_idx = i
                break
        
        if start_idx >= len(self.centroid_history) - 1:
            return 0.0
        
        # Sum up all displacements in window
        centroids = list(self.centroid_history)[start_idx:]
        total_disp = 0.0
        for i in range(1, len(centroids)):
            dx = centroids[i][0] - centroids[i-1][0]
            dy = centroids[i][1] - centroids[i-1][1]
            total_disp += np.sqrt(dx**2 + dy**2)
        
        return total_disp
    
    def get_max_vertical_drop(self, window_sec: float) -> Optional[float]:
        """Get maximum downward (positive Y) movement in window."""
        if len(self.centroid_history) < 2:
            return None
        
        current_time = self.timestamp_history[-1]
        start_idx = 0
        for i, t in enumerate(self.timestamp_history):
            if current_time - t <= window_sec:
                start_idx = i
                break
        
        centroids = list(self.centroid_history)[start_idx:]
        if len(centroids) < 2:
            return 0.0
        
        # Find max drop (positive Y direction is down in image coordinates)
        max_drop = 0.0
        for i in range(1, len(centroids)):
            drop = centroids[i][1] - centroids[i-1][1]  # Positive = downward
            if drop > max_drop:
                max_drop = drop
        
        return max_drop


class BlobTracker:
    """
    Tracks multiple blobs across frames using centroid matching.
    """
    
    def __init__(self):
        """Initialize the tracker."""
        self.tracked_blobs: Dict[int, TrackedBlob] = {}
        self.next_blob_id = 0
        self.max_match_distance = config.CENTROID_MATCH_DISTANCE
    
    def update(self, detected_blobs: List[DetectedBlob], timestamp: float) -> Dict[int, TrackedBlob]:
        """
        Update tracker with new detections.
        
        Args:
            detected_blobs: List of blobs detected in current frame
            timestamp: Current timestamp in seconds
            
        Returns:
            Dictionary of tracked blobs (id -> TrackedBlob)
        """
        if not detected_blobs:
            # Mark all as inactive if no detections
            for blob in self.tracked_blobs.values():
                blob.is_active = False
            return self.tracked_blobs
        
        # Get active tracked blobs
        active_tracked = {k: v for k, v in self.tracked_blobs.items() if v.is_active}
        
        # Match detections to existing tracks
        matched_tracks = set()
        matched_detections = set()
        
        for det_idx, detection in enumerate(detected_blobs):
            best_match_id = None
            best_match_dist = float('inf')
            
            for track_id, tracked in active_tracked.items():
                if track_id in matched_tracks:
                    continue
                
                # Calculate distance between centroids
                dist = self._centroid_distance(detection.centroid, tracked.last_centroid)
                
                if dist < self.max_match_distance and dist < best_match_dist:
                    best_match_dist = dist
                    best_match_id = track_id
            
            if best_match_id is not None:
                # Update existing track
                self.tracked_blobs[best_match_id].update(detection, timestamp)
                self.tracked_blobs[best_match_id].is_active = True
                matched_tracks.add(best_match_id)
                matched_detections.add(det_idx)
        
        # Create new tracks for unmatched detections
        for det_idx, detection in enumerate(detected_blobs):
            if det_idx not in matched_detections:
                new_blob = TrackedBlob(blob_id=self.next_blob_id)
                new_blob.update(detection, timestamp)
                self.tracked_blobs[self.next_blob_id] = new_blob
                self.next_blob_id += 1
        
        # Mark unmatched tracks as inactive
        for track_id in active_tracked:
            if track_id not in matched_tracks:
                self.tracked_blobs[track_id].is_active = False
        
        return self.tracked_blobs
    
    def _centroid_distance(self, c1: Tuple[float, float], c2: Tuple[float, float]) -> float:
        """Calculate Euclidean distance between two centroids."""
        return np.sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2)
    
    def get_active_blobs(self) -> Dict[int, TrackedBlob]:
        """Get only active tracked blobs."""
        return {k: v for k, v in self.tracked_blobs.items() if v.is_active}
    
    def reset(self):
        """Reset the tracker state."""
        self.tracked_blobs.clear()
        self.next_blob_id = 0
