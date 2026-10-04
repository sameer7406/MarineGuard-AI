import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

from ml.debris_detection.config import MODEL_SAVE_DIR, EPOCHS, LEARNING_RATE
from ml.debris_detection.model import DebrisUNet
from ml.debris_detection.dataset import create_data_loaders
from ml.common.metrics import calculate_segmentation_metrics
from ml.common.utils import save_json, set_seed
from ml.common.logging import logger

def train_debris_model(samples, epochs=EPOCHS, lr=LEARNING_RATE):
    set_seed(42)
    logger.info(f"Starting Marine Debris U-Net training with {len(samples)} samples...")
    
    train_loader, val_loader, test_loader, counts = create_data_loaders(samples)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device} | Train: {counts['train_count']}, Val: {counts['val_count']}, Test: {counts['test_count']}")
    
    model = DebrisUNet(in_channels=6, out_channels=1).to(device)
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    best_val_iou = 0.0
    history = []
    
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        
        for images, masks in train_loader:
            images, masks = images.to(device), masks.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, masks)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * images.size(0)
            
        train_loss /= counts['train_count']
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_preds, val_targets = [], []
        
        with torch.no_grad():
            for images, masks in val_loader:
                images, masks = images.to(device), masks.to(device)
                outputs = model(images)
                loss = criterion(outputs, masks)
                val_loss += loss.item() * images.size(0)
                
                val_preds.append(outputs.cpu().numpy())
                val_targets.append(masks.cpu().numpy())
                
        val_loss /= counts['val_count']
        val_preds_arr = np.concatenate(val_preds, axis=0)
        val_targets_arr = np.concatenate(val_targets, axis=0)
        
        val_metrics = calculate_segmentation_metrics(val_targets_arr, val_preds_arr)
        
        logger.info(
            f"Epoch [{epoch}/{epochs}] - Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | "
            f"Val IoU: {val_metrics['iou']:.4f} | Val Dice: {val_metrics['dice_score']:.4f} | Val F1: {val_metrics['f1_score']:.4f}"
        )
        
        history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "val_loss": round(val_loss, 4),
            **val_metrics
        })
        
        if val_metrics['iou'] >= best_val_iou:
            best_val_iou = val_metrics['iou']
            os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
            torch.save(model.state_dict(), os.path.join(MODEL_SAVE_DIR, "debris_unet_model.pth"))
            
    # Final Test Evaluation
    model.eval()
    test_preds, test_targets = [], []
    with torch.no_grad():
        for images, masks in test_loader:
            images, masks = images.to(device), masks.to(device)
            outputs = model(images)
            test_preds.append(outputs.cpu().numpy())
            test_targets.append(masks.cpu().numpy())
            
    test_preds_arr = np.concatenate(test_preds, axis=0)
    test_targets_arr = np.concatenate(test_targets, axis=0)
    final_test_metrics = calculate_segmentation_metrics(test_targets_arr, test_preds_arr)
    
    metadata = {
        "model_name": "DebrisUNet_Multispectral",
        "model_version": "v1.0.0",
        "training_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "dataset_name": "Sentinel-2 MARIDA Marine Debris Benchmark",
        "input_channels": 6,
        "input_bands": ["B02", "B03", "B04", "B08", "B11", "B12"],
        "metrics": final_test_metrics,
        "history": history,
        "dataset_splits": counts
    }
    
    save_json(metadata, os.path.join(MODEL_SAVE_DIR, "debris_metadata.json"))
    logger.info(f"Model saved to {MODEL_SAVE_DIR}/debris_unet_model.pth with test IoU: {final_test_metrics['iou']}")
    
    return model, metadata
