"""
Injury Analyzer Module
Analyzes injury images to extract visual features and compute severity scores.

Uses both OpenCV for color analysis and optionally MobileNetV2 for feature extraction.
"""

import cv2
import numpy as np
from pathlib import Path
from typing import Tuple, Optional
from PIL import Image
import isa_config
from models.injury import VisualFeatures, InjuryAnalysisResult

# Try to import PyTorch for pretrained model (optional)
TORCH_AVAILABLE = False
try:
    import torch
    import torchvision.transforms as transforms
    from torchvision import models
    TORCH_AVAILABLE = True
except ImportError:
    print("PyTorch not available. Using OpenCV-only analysis.")


class InjuryAnalyzer:
    """
    Analyzes injury images using computer vision techniques.
    
    Phase 1: OpenCV-based color and texture analysis
    Phase 2: MobileNetV2 feature extraction (if PyTorch available)
    """
    
    def __init__(self):
        """Initialize the analyzer with optional pretrained model."""
        self.model = None
        self.transform = None
        self.model_loaded = False
        
        if TORCH_AVAILABLE and isa_config.USE_PRETRAINED_MODEL:
            self._load_pretrained_model()
    
    def _load_pretrained_model(self):
        """Load pretrained ResNet-34 for feature extraction."""
        try:
            if isa_config.MODEL_NAME == "resnet34":
                self.model = models.resnet34(weights=models.ResNet34_Weights.IMAGENET1K_V1)
            elif isa_config.MODEL_NAME == "resnet18":
                self.model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
            elif isa_config.MODEL_NAME == "mobilenet_v2":
                self.model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
            else:
                self.model = models.resnet34(weights=models.ResNet34_Weights.IMAGENET1K_V1)
            
            # Set to evaluation mode
            self.model.eval()
            
            # Freeze parameters
            for param in self.model.parameters():
                param.requires_grad = False
            
            # Setup image transforms
            self.transform = transforms.Compose([
                transforms.Resize(isa_config.IMAGE_SIZE),
                transforms.ToTensor(),
                transforms.Normalize(mean=isa_config.NORMALIZE_MEAN, std=isa_config.NORMALIZE_STD)
            ])
            
            self.model_loaded = True
            print(f"Loaded pretrained {isa_config.MODEL_NAME} model successfully")
            
        except Exception as e:
            print(f"Failed to load pretrained model: {e}")
            self.model_loaded = False
    
    def analyze(self, image_path: str) -> InjuryAnalysisResult:
        """
        Analyze an injury image and return severity assessment.
        
        Args:
            image_path: Path to the injury image
            
        Returns:
            InjuryAnalysisResult with severity score and features
        """
        path = Path(image_path)
        if not path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Load image
        image = cv2.imread(str(path))
        if image is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Extract visual features using OpenCV
        features = self._extract_features_opencv(image)
        
        # Optionally enhance with pretrained model features
        if self.model_loaded and TORCH_AVAILABLE:
            model_confidence = self._get_model_confidence(image_rgb)
        else:
            model_confidence = 0.7  # Default confidence without model
        
        # Calculate severity score
        severity_score = self._calculate_severity_score(features)
        
        # Determine severity level
        severity_level = self._get_severity_level(severity_score)
        
        # Get routing recommendation
        routing = self._get_routing_recommendation(severity_level, model_confidence)
        
        # Generate explanation
        explanation = self._generate_explanation(features, severity_level)
        
        # Overall confidence
        confidence = self._calculate_confidence(features, model_confidence)
        
        return InjuryAnalysisResult(
            severityScore=round(severity_score, 2),
            severityLevel=severity_level,
            routingRecommendation=routing,
            features=features,
            confidence=round(confidence, 2),
            requiresConfirmation=severity_score >= isa_config.SEVERITY_MEDIUM_MAX,
            explanation=explanation
        )
    
    def _extract_features_opencv(self, image: np.ndarray) -> VisualFeatures:
        """
        Extract visual features using OpenCV.
        
        Args:
            image: BGR image as numpy array
            
        Returns:
            VisualFeatures object
        """
        # Resize for consistent analysis
        h, w = image.shape[:2]
        resized = cv2.resize(image, isa_config.IMAGE_SIZE)
        
        # Convert to different color spaces
        hsv = cv2.cvtColor(resized, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        
        # 1. Detect wound regions (red/pink colors)
        wound_mask = self._detect_wound_regions(hsv)
        wound_area_ratio = np.sum(wound_mask > 0) / (isa_config.IMAGE_SIZE[0] * isa_config.IMAGE_SIZE[1])
        wound_area_ratio = min(1.0, wound_area_ratio * 2)  # Scale up for visibility
        
        # 2. Calculate bleeding intensity (red channel analysis)
        bleeding_intensity = self._calculate_bleeding_intensity(resized, wound_mask)
        
        # 3. Calculate edge irregularity
        edge_irregularity = self._calculate_edge_irregularity(wound_mask)
        
        # 4. Calculate color contrast
        color_contrast = self._calculate_color_contrast(resized, wound_mask)
        
        return VisualFeatures(
            woundAreaRatio=round(wound_area_ratio, 3),
            bleedingIntensity=round(bleeding_intensity, 3),
            edgeIrregularity=round(edge_irregularity, 3),
            colorContrast=round(color_contrast, 3)
        )
    
    def _detect_wound_regions(self, hsv: np.ndarray) -> np.ndarray:
        """Detect wound-like regions using HSV color thresholding."""
        # Red range 1 (low hue)
        mask1 = cv2.inRange(hsv, 
                           np.array(isa_config.WOUND_HSV_LOWER1), 
                           np.array(isa_config.WOUND_HSV_UPPER1))
        
        # Red range 2 (high hue)
        mask2 = cv2.inRange(hsv, 
                           np.array(isa_config.WOUND_HSV_LOWER2), 
                           np.array(isa_config.WOUND_HSV_UPPER2))
        
        # Pink/flesh wound range
        mask3 = cv2.inRange(hsv, 
                           np.array(isa_config.WOUND_HSV_LOWER3), 
                           np.array(isa_config.WOUND_HSV_UPPER3))
        
        # Combine masks
        wound_mask = cv2.bitwise_or(mask1, mask2)
        wound_mask = cv2.bitwise_or(wound_mask, mask3)
        
        # Clean up with morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        wound_mask = cv2.morphologyEx(wound_mask, cv2.MORPH_OPEN, kernel)
        wound_mask = cv2.morphologyEx(wound_mask, cv2.MORPH_CLOSE, kernel)
        
        return wound_mask
    
    def _calculate_bleeding_intensity(self, image: np.ndarray, mask: np.ndarray) -> float:
        """Calculate bleeding intensity based on red channel in wound regions."""
        if np.sum(mask > 0) == 0:
            return 0.0
        
        # Extract red channel
        b, g, r = cv2.split(image)
        
        # Calculate red dominance in wound regions
        red_in_wound = r[mask > 0]
        green_in_wound = g[mask > 0]
        blue_in_wound = b[mask > 0]
        
        if len(red_in_wound) == 0:
            return 0.0
        
        # Red should be dominant for bleeding
        avg_red = np.mean(red_in_wound)
        avg_green = np.mean(green_in_wound)
        avg_blue = np.mean(blue_in_wound)
        
        # Calculate red dominance ratio
        total = avg_red + avg_green + avg_blue
        if total == 0:
            return 0.0
        
        red_ratio = avg_red / total
        intensity = (red_ratio - 0.33) / 0.33  # Normalize (0.33 = neutral)
        intensity = max(0.0, min(1.0, intensity * isa_config.BLEEDING_SENSITIVITY))
        
        return intensity
    
    def _calculate_edge_irregularity(self, mask: np.ndarray) -> float:
        """Calculate how irregular the wound edges are."""
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0.0
        
        # Find largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest_contour)
        
        if area < 100:  # Too small
            return 0.0
        
        # Calculate perimeter
        perimeter = cv2.arcLength(largest_contour, True)
        
        if perimeter == 0:
            return 0.0
        
        # Circularity: 1 = perfect circle, lower = more irregular
        circularity = 4 * np.pi * area / (perimeter ** 2)
        
        # Irregularity = inverse of circularity
        irregularity = 1.0 - min(1.0, circularity)
        irregularity = irregularity * isa_config.EDGE_SENSITIVITY
        
        return min(1.0, irregularity)
    
    def _calculate_color_contrast(self, image: np.ndarray, mask: np.ndarray) -> float:
        """Calculate contrast between wound region and surrounding skin."""
        if np.sum(mask > 0) < 100:
            return 0.0
        
        # Get wound and non-wound regions
        wound_pixels = image[mask > 0]
        non_wound_pixels = image[mask == 0]
        
        if len(wound_pixels) == 0 or len(non_wound_pixels) == 0:
            return 0.0
        
        # Calculate mean colors
        wound_mean = np.mean(wound_pixels, axis=0)
        skin_mean = np.mean(non_wound_pixels, axis=0)
        
        # Calculate color distance
        color_distance = np.linalg.norm(wound_mean - skin_mean)
        
        # Normalize (max distance = sqrt(3 * 255^2) ≈ 441)
        contrast = min(1.0, color_distance / 200)
        
        return contrast
    
    def _get_model_confidence(self, image_rgb: np.ndarray) -> float:
        """Get confidence from pretrained model features."""
        if not self.model_loaded:
            return 0.7
        
        try:
            # Convert to PIL Image
            pil_image = Image.fromarray(image_rgb)
            
            # Transform
            input_tensor = self.transform(pil_image)
            input_batch = input_tensor.unsqueeze(0)
            
            # Get features
            with torch.no_grad():
                features = self.model.features(input_batch) if hasattr(self.model, 'features') else self.model(input_batch)
            
            # Use feature statistics as confidence proxy
            feature_mean = features.mean().item()
            feature_std = features.std().item()
            
            # Higher activation variance suggests more distinct features
            confidence = min(1.0, 0.5 + feature_std * 0.1)
            
            return confidence
            
        except Exception as e:
            print(f"Model inference error: {e}")
            return 0.7
    
    def _calculate_severity_score(self, features: VisualFeatures) -> float:
        """Calculate overall severity score from features."""
        score = (
            features.woundAreaRatio * isa_config.WEIGHT_WOUND_AREA +
            features.bleedingIntensity * isa_config.WEIGHT_BLEEDING_INTENSITY +
            features.edgeIrregularity * isa_config.WEIGHT_EDGE_IRREGULARITY +
            features.colorContrast * isa_config.WEIGHT_COLOR_CONTRAST
        )
        return min(100.0, max(0.0, score))
    
    def _get_severity_level(self, score: float) -> str:
        """Convert severity score to level."""
        if score <= isa_config.SEVERITY_LOW_MAX:
            return "LOW"
        elif score <= isa_config.SEVERITY_MEDIUM_MAX:
            return "MEDIUM"
        else:
            return "HIGH"
    
    def _get_routing_recommendation(self, level: str, confidence: float) -> str:
        """Get routing recommendation based on severity."""
        if confidence < isa_config.CONFIDENCE_MIN:
            return isa_config.ROUTING_UNCERTAIN
        
        if level == "LOW":
            return isa_config.ROUTING_LOW
        elif level == "MEDIUM":
            return isa_config.ROUTING_MEDIUM
        else:
            return isa_config.ROUTING_HIGH
    
    def _generate_explanation(self, features: VisualFeatures, level: str) -> str:
        """Generate human-readable explanation."""
        explanations = []
        
        if features.woundAreaRatio > 0.3:
            explanations.append("large visible wound area")
        elif features.woundAreaRatio > 0.1:
            explanations.append("moderate wound area")
        elif features.woundAreaRatio > 0.02:
            explanations.append("small wound area")
        
        if features.bleedingIntensity > 0.6:
            explanations.append("significant bleeding detected")
        elif features.bleedingIntensity > 0.3:
            explanations.append("moderate bleeding")
        
        if features.edgeIrregularity > 0.6:
            explanations.append("irregular wound edges")
        
        if features.colorContrast > 0.5:
            explanations.append("high visibility wound")
        
        if not explanations:
            explanations.append("minor visible injury")
        
        base = f"{level.capitalize()} severity: "
        return base + ", ".join(explanations) + "."
    
    def _calculate_confidence(self, features: VisualFeatures, model_confidence: float) -> float:
        """Calculate overall analysis confidence."""
        # Feature-based confidence
        has_features = (
            features.woundAreaRatio > 0.01 or
            features.bleedingIntensity > 0.1 or
            features.edgeIrregularity > 0.1
        )
        
        if has_features:
            feature_confidence = 0.8
        else:
            feature_confidence = 0.5
        
        # Combine with model confidence
        if self.model_loaded:
            return (feature_confidence + model_confidence) / 2
        else:
            return feature_confidence
    
    def is_model_loaded(self) -> bool:
        """Check if pretrained model is loaded."""
        return self.model_loaded


# Singleton instance
_analyzer_instance: Optional[InjuryAnalyzer] = None


def get_analyzer() -> InjuryAnalyzer:
    """Get or create analyzer instance."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = InjuryAnalyzer()
    return _analyzer_instance
