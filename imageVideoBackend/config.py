"""
Configuration settings for Video-Based Behavioral Distress Detection.
All thresholds are tunable based on camera setup and environment.
"""

# Frame Sampling
SAMPLE_FPS = 1  # Frames per second to sample

# Blob Detection
MIN_BLOB_AREA = 500  # Minimum pixel area to consider a blob as a person
MAX_BLOB_AREA = 50000  # Maximum pixel area (to filter out large noise)
ASPECT_RATIO_MIN = 0.3  # Minimum height/width ratio for human-like blobs
ASPECT_RATIO_MAX = 4.0  # Maximum height/width ratio

# Background Subtractor Settings
BG_HISTORY = 500  # Number of frames for background model
BG_VAR_THRESHOLD = 16  # Variance threshold for background subtraction
BG_DETECT_SHADOWS = True  # Detect and mark shadows

# Morphological Operations
MORPH_KERNEL_SIZE = 5  # Size of kernel for noise removal

# Tracking
TRACKING_WINDOW_SEC = 20  # Rolling window duration in seconds
CENTROID_MATCH_DISTANCE = 50  # Max distance to match blobs across frames

# Distress Detection - Prolonged Immobility
IMMOBILITY_THRESHOLD_PX = 20  # Max displacement to consider immobile (pixels)
IMMOBILITY_DURATION_SEC = 15  # Time before flagging as prolonged immobility

# Distress Detection - Sudden Collapse
COLLAPSE_VERTICAL_DROP_PX = 100  # Y-axis drop to detect collapse
COLLAPSE_TIME_WINDOW_SEC = 2  # Time window for collapse detection
COLLAPSE_POST_IMMOBILITY_SEC = 3  # Immobility duration after collapse

# Distress Detection - Erratic Pacing (Phase 2)
PACING_VELOCITY_THRESHOLD = 30  # Pixels per second
PACING_DIRECTION_CHANGES = 3  # Minimum direction changes in window

# Distress Detection - Repeated Bending (Phase 2)
BENDING_OSCILLATION_MIN = 3  # Minimum oscillations to detect
BENDING_AMPLITUDE_PX = 30  # Minimum vertical movement amplitude

# Distress Detection - Crowd Formation (Phase 2)
CROWD_RADIUS_PX = 100  # Radius to check for crowd formation
CROWD_MIN_PEOPLE = 3  # Minimum people for crowd detection
CROWD_DURATION_SEC = 10  # Sustained duration for crowd alert

# Confidence Thresholds
CONFIDENCE_LOG_ONLY = 0.5  # Below this: log only
CONFIDENCE_SOFT_ALERT = 0.7  # Above this but below next: soft alert
CONFIDENCE_REQUIRES_CONFIRMATION = 0.7  # Above this: requires staff confirmation

# Zone Configuration
DEFAULT_ZONE = "WAITING_AREA"
