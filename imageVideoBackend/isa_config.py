"""
Configuration settings for Image-Based Injury Severity Assist (ISA).

Supports two modes:
- DEMO: Optimized for testing with sample images
- PRODUCTION: Conservative thresholds for real-world use
"""

# =========================
# SYSTEM MODE
# =========================
MODE = "DEMO"  # Options: "DEMO" or "PRODUCTION"


# =========================
# IMAGE PREPROCESSING
# =========================
IMAGE_SIZE = (224, 224)  # Standard size for pretrained models
NORMALIZE_MEAN = [0.485, 0.456, 0.406]  # ImageNet normalization
NORMALIZE_STD = [0.229, 0.224, 0.225]


# =========================
# MODEL CONFIGURATION
# =========================
USE_PRETRAINED_MODEL = True  # Use ResNet-34 for feature extraction
MODEL_NAME = "resnet34"  # Options: "resnet34", "resnet18", "mobilenet_v2"


# =========================
# WOUND DETECTION (Color-based)
# =========================
# HSV ranges for detecting wound/blood colors
# Red has two ranges in HSV (wraps around 0/180)
WOUND_HSV_LOWER1 = (0, 50, 50)      # Lower red range
WOUND_HSV_UPPER1 = (10, 255, 255)
WOUND_HSV_LOWER2 = (160, 50, 50)    # Upper red range
WOUND_HSV_UPPER2 = (180, 255, 255)

# Pink/flesh wound colors
WOUND_HSV_LOWER3 = (0, 20, 100)
WOUND_HSV_UPPER3 = (20, 150, 255)

# Minimum area ratio to consider as wound
MIN_WOUND_AREA_RATIO = 0.01  # 1% of image


# =========================
# SEVERITY SCORING WEIGHTS
# =========================
WEIGHT_WOUND_AREA = 40
WEIGHT_BLEEDING_INTENSITY = 30
WEIGHT_EDGE_IRREGULARITY = 20
WEIGHT_COLOR_CONTRAST = 10


# =========================
# SEVERITY THRESHOLDS
# =========================
SEVERITY_LOW_MAX = 30
SEVERITY_MEDIUM_MAX = 70
# Above 70 = HIGH


# =========================
# ROUTING RECOMMENDATIONS
# =========================
ROUTING_LOW = "Nurse / Minor treatment"
ROUTING_MEDIUM = "Doctor evaluation"
ROUTING_HIGH = "Immediate staff attention"
ROUTING_UNCERTAIN = "Manual review required"


# =========================
# CONFIDENCE THRESHOLDS
# =========================
if MODE == "DEMO":
    CONFIDENCE_MIN = 0.3  # Lower threshold for demo
else:
    CONFIDENCE_MIN = 0.5  # Higher for production


# =========================
# FEATURE EXTRACTION
# =========================
if MODE == "DEMO":
    # More sensitive detection for demo
    BLEEDING_SENSITIVITY = 1.2
    EDGE_SENSITIVITY = 1.2
else:
    BLEEDING_SENSITIVITY = 1.0
    EDGE_SENSITIVITY = 1.0
