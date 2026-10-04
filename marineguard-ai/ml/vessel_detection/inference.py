import os
import torch
import numpy as np

from ml.vessel_detection.model import VesselClassifier
from ml.vessel_detection.dataset import VESSEL_CLASSES

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "models", "vessel", "vessel_detector.pth")

class VesselInferenceEngine:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = VesselClassifier(num_classes=len(VESSEL_CLASSES)).to(self.device)
        
        if os.path.exists(MODEL_PATH):
            self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
            self.model.eval()
            self.loaded = True
        else:
            self.model.eval()
            self.loaded = False

    def predict_vessel(self, patch_img_array=None):
        if patch_img_array is None:
            # Default synthetic vessel patch
            patch_img_array = np.random.randint(20, 200, (3, 128, 128), dtype=np.uint8)
            patch_img_array[:, 50:78, 50:78] += 60
            
        tensor_img = torch.from_numpy(patch_img_array).float().unsqueeze(0) / 255.0
        tensor_img = tensor_img.to(self.device)
        
        with torch.no_grad():
            logits = self.model(tensor_img)
            probs = torch.softmax(logits, dim=1).squeeze().cpu().numpy()
            
        pred_idx = int(np.argmax(probs))
        vessel_class = VESSEL_CLASSES[pred_idx]
        confidence = float(probs[pred_idx])
        
        return {
            "vessel_class": vessel_class,
            "confidence": round(confidence, 4),
            "class_probabilities": {VESSEL_CLASSES[i]: round(float(probs[i]), 4) for i in range(len(VESSEL_CLASSES))}
        }
