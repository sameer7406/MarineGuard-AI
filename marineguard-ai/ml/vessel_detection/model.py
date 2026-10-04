import torch
import torch.nn as nn

class VesselClassifier(nn.Module):
    """
    PyTorch Maritime Vessel Classification & Feature Extractor Network.
    Inputs: (Batch, 3, 128, 128) -> RGB / Synthetic SAR Satellite Patches.
    Outputs: (Batch, 5) -> [Cargo, Fishing, Tanker, Tug, Suspicious/Unclassified]
    """
    def __init__(self, num_classes=5):
        super(VesselClassifier, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2), # 64x64
            
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2), # 32x32
            
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2, 2)  # 16x16
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 16 * 16, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        feats = self.features(x)
        logits = self.classifier(feats)
        return logits
