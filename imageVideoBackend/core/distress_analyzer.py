"""
Distress Analyzer Module
Analyzes tracked blobs to detect distress signals.
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
import config
from core.tracker import TrackedBlob
from models.events import DistressEvent


@dataclass
class DistressSignal:
    """Internal representation of a detected distress signal."""
    signal_type: str
    blob_id: int
    raw_confidence: float
    duration_factor: float
    consistency_factor: float
    
    @property
    def confidence(self) -> float:
        """Calculate final confidence score."""
        return min(1.0, self.raw_confidence * self.duration_factor * self.consistency_factor)


class DistressAnalyzer:
    """
    Analyzes tracked blob behavior to detect distress signals.
    
    Phase 1 signals:
    - PROLONGED_IMMOBILITY
    - SUDDEN_COLLAPSE
    
    Phase 2 signals (optional):
    - REPEATED_BENDING
    - ERRATIC_PACING
    - CROWD_FORMATION
    """
    
    def __init__(self):
        """Initialize the analyzer."""
        # Track which blobs have already generated events to avoid duplicates
        self.emitted_events: Dict[int, set] = {}  # blob_id -> set of signal types
    
    def analyze(self, tracked_blobs: Dict[int, TrackedBlob], timestamp: float) -> List[DistressEvent]:
        """
        Analyze all tracked blobs for distress signals.
        
        Args:
            tracked_blobs: Dictionary of tracked blobs
            timestamp: Current timestamp
            
        Returns:
            List of new distress events
        """
        events = []
        
        for blob_id, blob in tracked_blobs.items():
            if not blob.is_active:
                continue
            
            # Initialize emitted events set for this blob
            if blob_id not in self.emitted_events:
                self.emitted_events[blob_id] = set()
            
            # Check each distress signal type
            signals = [
                self._check_prolonged_immobility(blob),
                self._check_sudden_collapse(blob),
            ]
            
            for signal in signals:
                if signal is not None:
                    # Check if we already emitted this signal for this blob
                    if signal.signal_type not in self.emitted_events[blob_id]:
                        event = self._create_event(signal, timestamp)
                        if event.confidence >= config.CONFIDENCE_LOG_ONLY:
                            events.append(event)
                            self.emitted_events[blob_id].add(signal.signal_type)
        
        return events
    
    def _check_prolonged_immobility(self, blob: TrackedBlob) -> Optional[DistressSignal]:
        """
        Check for prolonged immobility signal.
        
        Criteria:
        - Person remains nearly stationary
        - Duration exceeds threshold
        """
        # Need at least a few frames to analyze
        min_frames = max(2, int(config.IMMOBILITY_DURATION_SEC * config.SAMPLE_FPS))
        if blob.frames_tracked < min_frames:
            return None
        
        # Check idle time (person not moving significantly)
        if blob.idle_time >= config.IMMOBILITY_DURATION_SEC:
            # Calculate displacement over the observation window
            displacement = blob.get_centroid_displacement(config.IMMOBILITY_DURATION_SEC)
            
            # Even if displacement is None, idle_time alone is enough
            if displacement is None:
                displacement = 0
            
            # Check if displacement is below threshold
            max_allowed = config.IMMOBILITY_THRESHOLD_PX * config.IMMOBILITY_DURATION_SEC
            if displacement < max_allowed:
                # Calculate confidence factors
                raw_confidence = 0.85  # Higher base confidence
                
                # Duration factor: higher confidence for longer immobility
                duration_ratio = blob.idle_time / config.IMMOBILITY_DURATION_SEC
                duration_factor = min(1.3, 0.9 + 0.1 * duration_ratio)
                
                # Consistency factor
                if max_allowed > 0:
                    consistency_factor = 1.0 - (displacement / max_allowed)
                else:
                    consistency_factor = 1.0
                consistency_factor = max(0.6, min(1.0, consistency_factor))
                
                return DistressSignal(
                    signal_type="PROLONGED_IMMOBILITY",
                    blob_id=blob.blob_id,
                    raw_confidence=raw_confidence,
                    duration_factor=duration_factor,
                    consistency_factor=consistency_factor
                )
        
        return None
    
    def _check_sudden_collapse(self, blob: TrackedBlob) -> Optional[DistressSignal]:
        """
        Check for sudden collapse signal.
        
        Criteria:
        - Large downward Y-axis displacement within short time
        - Followed by period of immobility OR significant height change
        """
        min_frames = max(2, int((config.COLLAPSE_TIME_WINDOW_SEC + config.COLLAPSE_POST_IMMOBILITY_SEC) * config.SAMPLE_FPS))
        if blob.frames_tracked < min_frames:
            return None
        
        # Check for recent vertical drop
        max_drop = blob.get_max_vertical_drop(config.COLLAPSE_TIME_WINDOW_SEC)
        if max_drop is None:
            max_drop = 0
        
        # Also check for significant height change (person going from standing to lying)
        height_change = self._check_height_change(blob)
        
        # Collapse detected if large drop OR significant height reduction
        collapse_detected = (max_drop >= config.COLLAPSE_VERTICAL_DROP_PX) or height_change
        
        if collapse_detected:
            # Check for post-collapse immobility (less strict)
            recent_displacement = blob.get_centroid_displacement(config.COLLAPSE_POST_IMMOBILITY_SEC)
            if recent_displacement is None:
                recent_displacement = 0
            
            max_post_movement = config.IMMOBILITY_THRESHOLD_PX * config.COLLAPSE_POST_IMMOBILITY_SEC * 2  # More lenient
            
            if recent_displacement < max_post_movement:
                # Calculate confidence
                raw_confidence = 0.8
                
                # Higher confidence for larger drops
                if config.COLLAPSE_VERTICAL_DROP_PX > 0:
                    drop_ratio = max(max_drop / config.COLLAPSE_VERTICAL_DROP_PX, 1.0)
                else:
                    drop_ratio = 1.0
                duration_factor = min(1.4, 0.9 + 0.15 * drop_ratio)
                
                # Consistency based on stillness after
                if max_post_movement > 0:
                    stillness_ratio = 1.0 - (recent_displacement / max_post_movement)
                else:
                    stillness_ratio = 1.0
                consistency_factor = max(0.6, min(1.0, stillness_ratio))
                
                return DistressSignal(
                    signal_type="SUDDEN_COLLAPSE",
                    blob_id=blob.blob_id,
                    raw_confidence=raw_confidence,
                    duration_factor=duration_factor,
                    consistency_factor=consistency_factor
                )
        
        return None
    
    def _check_height_change(self, blob: TrackedBlob) -> bool:
        """Check if blob height decreased significantly (standing to lying)."""
        if len(blob.bbox_height_history) < 3:
            return False
        
        heights = list(blob.bbox_height_history)
        if len(heights) < 2:
            return False
        
        initial_height = max(heights[:len(heights)//2]) if heights[:len(heights)//2] else heights[0]
        final_height = min(heights[len(heights)//2:]) if heights[len(heights)//2:] else heights[-1]
        
        # Significant height reduction (person collapsed/lying down)
        if initial_height > 0 and final_height < initial_height * 0.6:
            return True
        return False
    
    def _create_event(self, signal: DistressSignal, timestamp: float) -> DistressEvent:
        """Create a DistressEvent from a signal."""
        from datetime import datetime
        
        return DistressEvent(
            signalType=signal.signal_type,
            confidence=round(signal.confidence, 2),
            zone=config.DEFAULT_ZONE,
            timestamp=datetime.now().isoformat(),
            blobId=signal.blob_id
        )
    
    def reset(self):
        """Reset analyzer state."""
        self.emitted_events.clear()


class DistressAnalyzerPhase2(DistressAnalyzer):
    """Extended analyzer with Phase 2 signals."""
    
    def analyze(self, tracked_blobs: Dict[int, TrackedBlob], timestamp: float) -> List[DistressEvent]:
        """Analyze with additional Phase 2 signals."""
        events = super().analyze(tracked_blobs, timestamp)
        
        for blob_id, blob in tracked_blobs.items():
            if not blob.is_active:
                continue
            
            if blob_id not in self.emitted_events:
                self.emitted_events[blob_id] = set()
            
            # Phase 2 signals
            signals = [
                self._check_erratic_pacing(blob),
                self._check_repeated_bending(blob),
            ]
            
            for signal in signals:
                if signal is not None:
                    if signal.signal_type not in self.emitted_events.get(blob_id, set()):
                        event = self._create_event(signal, timestamp)
                        if event.confidence >= config.CONFIDENCE_LOG_ONLY:
                            events.append(event)
                            self.emitted_events[blob_id].add(signal.signal_type)
        
        # Check crowd formation (requires all blobs)
        crowd_signal = self._check_crowd_formation(tracked_blobs)
        if crowd_signal:
            # Use a special key for crowd events
            if "CROWD_FORMATION" not in self.emitted_events.get(-1, set()):
                event = self._create_event(crowd_signal, timestamp)
                if event.confidence >= config.CONFIDENCE_LOG_ONLY:
                    events.append(event)
                    if -1 not in self.emitted_events:
                        self.emitted_events[-1] = set()
                    self.emitted_events[-1].add("CROWD_FORMATION")
        
        return events
    
    def _check_erratic_pacing(self, blob: TrackedBlob) -> Optional[DistressSignal]:
        """Check for erratic pacing behavior."""
        min_frames = max(3, config.TRACKING_WINDOW_SEC // 2)
        if blob.frames_tracked < min_frames:
            return None
        
        velocity = blob.get_recent_velocity(3)  # Fewer samples needed
        if velocity is None:
            return None
        
        # Check for high velocity
        speed = (velocity[0]**2 + velocity[1]**2) ** 0.5
        if speed < config.PACING_VELOCITY_THRESHOLD:
            return None
        
        # Count direction changes
        if len(blob.velocity_history) < config.PACING_DIRECTION_CHANGES:
            return None
        
        velocities = list(blob.velocity_history)
        direction_changes = 0
        for i in range(1, len(velocities)):
            # Check for sign change in x or y velocity
            if (velocities[i][0] * velocities[i-1][0] < 0 or 
                velocities[i][1] * velocities[i-1][1] < 0):
                direction_changes += 1
        
        if direction_changes >= config.PACING_DIRECTION_CHANGES:
            return DistressSignal(
                signal_type="ERRATIC_PACING",
                blob_id=blob.blob_id,
                raw_confidence=0.7,
                duration_factor=min(1.3, 0.9 + 0.1 * direction_changes),
                consistency_factor=min(1.0, speed / config.PACING_VELOCITY_THRESHOLD)
            )
        
        return None
    
    def _check_repeated_bending(self, blob: TrackedBlob) -> Optional[DistressSignal]:
        """Check for repeated bending/oscillation."""
        if len(blob.centroid_history) < config.BENDING_OSCILLATION_MIN * 2:
            return None
        
        centroids = list(blob.centroid_history)
        y_values = [c[1] for c in centroids]
        
        # Count oscillations (peaks and valleys)
        oscillations = 0
        for i in range(1, len(y_values) - 1):
            prev_diff = y_values[i] - y_values[i-1]
            next_diff = y_values[i+1] - y_values[i]
            
            # Check for direction change (peak or valley)
            if prev_diff * next_diff < 0:
                amplitude = abs(y_values[i] - y_values[i-1])
                if amplitude >= config.BENDING_AMPLITUDE_PX:
                    oscillations += 1
        
        if oscillations >= config.BENDING_OSCILLATION_MIN:
            return DistressSignal(
                signal_type="REPEATED_BENDING",
                blob_id=blob.blob_id,
                raw_confidence=0.75,
                duration_factor=min(1.3, 0.9 + 0.1 * oscillations),
                consistency_factor=0.95
            )
        
        return None
    
    def _check_crowd_formation(self, tracked_blobs: Dict[int, TrackedBlob]) -> Optional[DistressSignal]:
        """Check for crowd forming around a point."""
        import numpy as np
        
        active_blobs = [b for b in tracked_blobs.values() if b.is_active]
        if len(active_blobs) < config.CROWD_MIN_PEOPLE:
            return None
        
        # Check if multiple blobs are close together
        for i, blob in enumerate(active_blobs):
            center = blob.last_centroid
            nearby_count = 0
            
            for j, other in enumerate(active_blobs):
                if i == j:
                    continue
                dist = np.sqrt(
                    (other.last_centroid[0] - center[0])**2 +
                    (other.last_centroid[1] - center[1])**2
                )
                if dist <= config.CROWD_RADIUS_PX:
                    nearby_count += 1
            
            if nearby_count >= config.CROWD_MIN_PEOPLE - 1:
                return DistressSignal(
                    signal_type="CROWD_FORMATION",
                    blob_id=blob.blob_id,
                    raw_confidence=0.75,
                    duration_factor=1.0,
                    consistency_factor=min(1.0, (nearby_count + 1) / config.CROWD_MIN_PEOPLE)
                )
        
        return None
