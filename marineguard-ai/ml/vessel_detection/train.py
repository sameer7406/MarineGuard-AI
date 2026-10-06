import os
import time
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from ml.vessel_detection.model import VesselClassifier
from ml.vessel_detection.dataset import MaritimeVesselDataset, VESSEL_CLASSES
from ml.common.metrics import calculate_classification_metrics
from ml.common.utils import save_json, set_seed
from ml.common.logging import logger

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_SAVE_DIR = os.path.join(BASE_DIR, "models", "vessel")


def render_vessel_morphology(label: int, rng: np.random.RandomState) -> np.ndarray:
    """
    Renders physically and morphologically distinct synthetic vessel signatures.
    Dimensions: (3, 128, 128), values in [0, 255] uint8.

    Classes:
      0 - Cargo: Elongated hull, grid/container deck pattern, moderate aspect ratio (~3:1), wake.
      1 - Fishing: Compact smaller hull, central cabin superstructure, short faint wake.
      2 - Tanker: Long & wide hull (~3.5:1 to 4:1), continuous high metallic backscatter, long trailing wake.
      3 - Tug: Short & wide hull (aspect ~1.4:1), compact squarish geometry, twin divergent stern wake.
      4 - Suspicious/Unclassified: Irregular, fragmented/offset structure, patchy non-uniform reflectivity.
    """
    # 1. Realistic sea-surface background with spatial gradient and wave clutter
    img = rng.normal(45, 10, (3, 128, 128)).astype(np.float32)
    img = np.clip(img, 15, 80)

    # 2. Randomize orientation, position jitter, and scaling
    cx = 64.0 + rng.uniform(-10.0, 10.0)
    cy = 64.0 + rng.uniform(-10.0, 10.0)
    angle = rng.uniform(0.0, 2.0 * np.pi)
    scale = rng.uniform(0.88, 1.12)

    Y, X = np.ogrid[:128, :128]
    cos_a = np.cos(angle)
    sin_a = np.sin(angle)
    xp = (X - cx) * cos_a + (Y - cy) * sin_a
    yp = -(X - cx) * sin_a + (Y - cy) * cos_a

    # 3. Class-specific morphological signatures
    if label == 0:  # Cargo
        L = 58.0 * scale
        W = 18.0 * scale
        hull = (np.abs(xp) <= L / 2) & (np.abs(yp) <= W / 2)
        grid = ((xp // 6) % 2) * 25.0 + ((yp // 5) % 2) * 15.0
        img[:, hull] = 130.0 + grid[hull]
        wake = (xp < -L / 2) & (xp > -L / 2 - 25.0 * scale) & (np.abs(yp) <= (W / 2) * 1.3)
        img[:, wake] += rng.uniform(15.0, 25.0, size=img[:, wake].shape)

    elif label == 1:  # Fishing
        L = 24.0 * scale
        W = 11.0 * scale
        hull = (np.abs(xp) <= L / 2) & (np.abs(yp) <= W / 2)
        img[:, hull] = 120.0
        cabin = (np.abs(xp) <= 5.0 * scale) & (np.abs(yp) <= 4.0 * scale)
        img[:, cabin] = 165.0
        wake = (xp < -L / 2) & (xp > -L / 2 - 14.0 * scale) & (np.abs(yp) <= W / 2.5)
        img[:, wake] += 20.0

    elif label == 2:  # Tanker
        L = 78.0 * scale
        W = 24.0 * scale
        hull = (np.abs(xp) <= L / 2) & (np.abs(yp) <= W / 2)
        img[:, hull] = 185.0
        centerline = hull & (np.abs(yp) <= 2.0 * scale)
        img[:, centerline] = 225.0
        wake = (xp < -L / 2) & (xp > -L / 2 - 40.0 * scale) & (np.abs(yp) <= W / 2 + 4.0)
        img[:, wake] += 30.0

    elif label == 3:  # Tug
        L = 28.0 * scale
        W = 20.0 * scale
        hull = (np.abs(xp) <= L / 2) & (np.abs(yp) <= W / 2)
        img[:, hull] = 155.0
        wake1 = (xp < -L / 2) & (xp > -L / 2 - 18.0 * scale) & (np.abs(yp - 6.0 * scale) <= 3.0)
        wake2 = (xp < -L / 2) & (xp > -L / 2 - 18.0 * scale) & (np.abs(yp + 6.0 * scale) <= 3.0)
        img[:, wake1 | wake2] += 25.0

    elif label == 4:  # Suspicious / Unclassified
        L = 40.0 * scale
        W = 16.0 * scale
        part1 = (xp >= 0) & (xp <= L / 2) & (np.abs(yp - 5.0 * scale) <= W / 2 - 2.0)
        part2 = (xp < 0) & (xp >= -L / 2) & (np.abs(yp + 5.0 * scale) <= W / 2 - 2.0)
        hull = part1 | part2
        patchy = rng.choice([75.0, 130.0, 190.0], size=img[:, hull].shape)
        img[:, hull] = patchy

    # 4. Sensor speckle / radar noise
    img += rng.normal(0, 5, img.shape)
    return np.clip(img, 0, 255).astype(np.uint8)


def generate_synthetic_vessel_samples(num_samples=500, seed=42):
    """
    Generates a balanced, morphologically learnable synthetic maritime vessel dataset.
    Stratified across the 5 target classes.
    """
    rng = np.random.RandomState(seed)
    samples_per_class = num_samples // len(VESSEL_CLASSES)
    train_samples = []
    test_samples = []

    for label in range(len(VESSEL_CLASSES)):
        for i in range(samples_per_class):
            img = render_vessel_morphology(label, rng)
            sample = {"image": img, "label": label}
            # Stratified 80/20 split: first 80 to train, last 20 to test
            if i < int(samples_per_class * 0.8):
                train_samples.append(sample)
            else:
                test_samples.append(sample)

    return train_samples, test_samples


def train_vessel_model():
    """
    Trains VesselClassifier on the class-conditional morphological benchmark.
    Evaluates on the untouched 100-sample hold-out test set and saves honest metadata.
    """
    logger.info("Training Maritime Vessel Detection & Classification Model on Morphological Benchmark...")
    set_seed(42)

    train_samples, test_samples = generate_synthetic_vessel_samples(500, seed=42)
    logger.info(f"Dataset generated: {len(train_samples)} train samples, {len(test_samples)} test samples (Stratified 80/20)")

    train_dataset = MaritimeVesselDataset(train_samples)
    test_dataset = MaritimeVesselDataset(test_samples)

    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=16, shuffle=True)
    test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=16, shuffle=False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = VesselClassifier(num_classes=len(VESSEL_CLASSES)).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)

    num_epochs = 8
    for epoch in range(1, num_epochs + 1):
        model.train()
        train_loss = 0.0
        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()

        logger.info(f"Epoch {epoch}/{num_epochs} - Train Loss: {train_loss / len(train_loader):.4f}")

    # Hold-out test evaluation
    model.eval()
    all_preds, all_labels = [], []
    with torch.no_grad():
        for imgs, labels in test_loader:
            imgs = imgs.to(device)
            outputs = model(imgs)
            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(labels.numpy())

    all_labels_arr = np.array(all_labels)
    all_preds_arr = np.array(all_preds)

    # Calculate overall metrics
    eval_metrics = calculate_classification_metrics(all_labels_arr, all_preds_arr)

    # Calculate confusion matrix
    num_classes = len(VESSEL_CLASSES)
    cm = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(all_labels_arr, all_preds_arr):
        cm[t, p] += 1

    # Calculate per-class metrics
    per_class_metrics = {}
    for c_idx, c_name in enumerate(VESSEL_CLASSES):
        tp = int(cm[c_idx, c_idx])
        fp = int(np.sum(cm[:, c_idx]) - tp)
        fn = int(np.sum(cm[c_idx, :]) - tp)
        p = round(float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0, 4)
        r = round(float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0, 4)
        f = round(float(2 * p * r / (p + r)) if (p + r) > 0 else 0.0, 4)
        per_class_metrics[c_name] = {
            "precision": p,
            "recall": r,
            "f1_score": f,
            "support": int(np.sum(cm[c_idx, :]))
        }

    logger.info(f"Hold-out Test Accuracy: {eval_metrics['accuracy']} | Macro-F1: {eval_metrics['macro_f1']}")

    # Save model weights
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
    torch.save(model.state_dict(), os.path.join(MODEL_SAVE_DIR, "vessel_detector.pth"))

    # Save honest metadata with confusion matrix and per-class metrics
    metadata = {
        "model_name": "MaritimeVesselClassifier_CNN",
        "model_version": "v1.1.0",
        "training_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "dataset_name": "Synthetic Morphological Vessel Benchmark (5 classes, stratified)",
        "dataset_type": "SYNTHETIC DEMO BENCHMARK",
        "provenance_statement": "Vessel classifier trained on synthetic morphological benchmark patches as a computer-vision pipeline demonstration prototype.",
        "classes": VESSEL_CLASSES,
        "metrics": eval_metrics,
        "per_class_metrics": per_class_metrics,
        "confusion_matrix": cm.tolist(),
        "confusion_matrix_labels": VESSEL_CLASSES,
        "dataset_splits": {
            "train_samples": len(train_samples),
            "test_samples": len(test_samples),
            "per_class_test_support": 20
        }
    }

    save_json(metadata, os.path.join(MODEL_SAVE_DIR, "vessel_metadata.json"))
    return metadata


if __name__ == "__main__":
    train_vessel_model()
