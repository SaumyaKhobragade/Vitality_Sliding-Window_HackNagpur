"""
Configuration settings for Video-Based Behavioral Distress Detection (VBDD).

This system supports two modes:
- DEMO: Optimized for short, stitched synthetic video clips (6–8 sec each)
- PRODUCTION: Conservative thresholds suitable for real CCTV environments

All detection logic remains identical across modes.
Only observation windows and sampling rates differ.
"""

# =========================
# SYSTEM MODE
# =========================
MODE = "DEMO"  # Options: "DEMO" or "PRODUCTION"


# =========================
# FRAME SAMPLING
# =========================
if MODE == "DEMO":
    SAMPLE_FPS = 4   # Higher temporal resolution for short clips (more frames = better detection)
else:
    SAMPLE_FPS = 1   # Safer, lower load for real CCTV


# =========================
# BLOB DETECTION
# =========================
MIN_BLOB_AREA = 300      # Lower threshold to catch smaller figures
MAX_BLOB_AREA = 80000    # Higher to catch close-up figures

ASPECT_RATIO_MIN = 0.2   # More permissive
ASPECT_RATIO_MAX = 5.0   # More permissive


# =========================
# BACKGROUND SUBTRACTOR
# =========================
if MODE == "DEMO":
    BG_HISTORY = 100     # Shorter history for quick adaptation
else:
    BG_HISTORY = 500
    
BG_VAR_THRESHOLD = 16
BG_DETECT_SHADOWS = True


# =========================
# MORPHOLOGICAL OPERATIONS
# =========================
MORPH_KERNEL_SIZE = 3    # Smaller kernel preserves more detail


# =========================
# TRACKING
# =========================
if MODE == "DEMO":
    TRACKING_WINDOW_SEC = 8   # Match clip duration
else:
    TRACKING_WINDOW_SEC = 20

CENTROID_MATCH_DISTANCE = 80  # More lenient matching


# =========================
# DISTRESS DETECTION
# =========================

# --- Prolonged Immobility ---
if MODE == "DEMO":
    IMMOBILITY_THRESHOLD_PX = 30      # Pixels - allow small movements
    IMMOBILITY_DURATION_SEC = 2       # 2 seconds for demo clips
else:
    IMMOBILITY_THRESHOLD_PX = 20
    IMMOBILITY_DURATION_SEC = 15


# --- Sudden Collapse ---
if MODE == "DEMO":
    COLLAPSE_VERTICAL_DROP_PX = 40    # Lower threshold for smaller movements
    COLLAPSE_TIME_WINDOW_SEC = 1.0    # 1 second window
    COLLAPSE_POST_IMMOBILITY_SEC = 1  # 1 second post-collapse stillness
else:
    COLLAPSE_VERTICAL_DROP_PX = 100
    COLLAPSE_TIME_WINDOW_SEC = 2
    COLLAPSE_POST_IMMOBILITY_SEC = 3


# --- Erratic Pacing (Phase 2) ---
if MODE == "DEMO":
    PACING_VELOCITY_THRESHOLD = 15    # Lower velocity threshold
    PACING_DIRECTION_CHANGES = 2      # Fewer direction changes needed
else:
    PACING_VELOCITY_THRESHOLD = 30
    PACING_DIRECTION_CHANGES = 3


# --- Repeated Bending (Phase 2) ---
if MODE == "DEMO":
    BENDING_OSCILLATION_MIN = 2       # Just 2 oscillations
    BENDING_AMPLITUDE_PX = 15         # Smaller amplitude
else:
    BENDING_OSCILLATION_MIN = 3
    BENDING_AMPLITUDE_PX = 30


# --- Crowd Formation ---
if MODE == "DEMO":
    CROWD_RADIUS_PX = 150             # Larger radius
    CROWD_MIN_PEOPLE = 2              # Just 2 people converging
    CROWD_DURATION_SEC = 1            # 1 second duration
else:
    CROWD_RADIUS_PX = 100
    CROWD_MIN_PEOPLE = 3
    CROWD_DURATION_SEC = 10


# =========================
# CONFIDENCE THRESHOLDS
# =========================
if MODE == "DEMO":
    CONFIDENCE_LOG_ONLY = 0.3         # Lower threshold to catch more events
    CONFIDENCE_SOFT_ALERT = 0.5
    CONFIDENCE_REQUIRES_CONFIRMATION = 0.6
else:
    CONFIDENCE_LOG_ONLY = 0.5
    CONFIDENCE_SOFT_ALERT = 0.7
    CONFIDENCE_REQUIRES_CONFIRMATION = 0.7


# =========================
# ZONE CONFIGURATION
# =========================
DEFAULT_ZONE = "WAITING_AREA"
