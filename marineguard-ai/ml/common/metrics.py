import numpy as np

def calculate_segmentation_metrics(y_true, y_pred, threshold=0.5):
    """
    Calculate IoU, Dice Score (F1), Precision, Recall, and Accuracy for binary segmentation.
    y_true: numpy array of ground truth (0 or 1)
    y_pred: numpy array of predicted probabilities or binary masks
    """
    y_pred_bin = (y_pred >= threshold).astype(np.uint8)
    y_true_bin = (y_true >= threshold).astype(np.uint8)
    
    tp = np.sum((y_pred_bin == 1) & (y_true_bin == 1))
    fp = np.sum((y_pred_bin == 1) & (y_true_bin == 0))
    fn = np.sum((y_pred_bin == 0) & (y_true_bin == 1))
    tn = np.sum((y_pred_bin == 0) & (y_true_bin == 0))
    
    precision = float(tp / (tp + fp + 1e-7))
    recall = float(tp / (tp + fn + 1e-7))
    f1 = float(2 * precision * recall / (precision + recall + 1e-7))
    iou = float(tp / (tp + fp + fn + 1e-7))
    dice = float(2 * tp / (2 * tp + fp + fn + 1e-7))
    accuracy = float((tp + tn) / (tp + tn + fp + fn + 1e-7))
    
    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "iou": round(iou, 4),
        "dice_score": round(dice, 4),
        "accuracy": round(accuracy, 4)
    }

def calculate_classification_metrics(y_true, y_pred):
    """
    Calculate accuracy, precision, recall, and F1 for classification tasks.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    accuracy = float(np.mean(y_true == y_pred))
    
    # Calculate macro precision/recall
    classes = np.unique(np.concatenate([y_true, y_pred]))
    precisions, recalls, f1s = [], [], []
    
    for c in classes:
        tp = np.sum((y_pred == c) & (y_true == c))
        fp = np.sum((y_pred == c) & (y_true != c))
        fn = np.sum((y_pred != c) & (y_true == c))
        
        p = tp / (tp + fp + 1e-7)
        r = tp / (tp + fn + 1e-7)
        f = 2 * p * r / (p + r + 1e-7)
        
        precisions.append(p)
        recalls.append(r)
        f1s.append(f)
        
    return {
        "accuracy": round(accuracy, 4),
        "macro_precision": round(float(np.mean(precisions)), 4),
        "macro_recall": round(float(np.mean(recalls)), 4),
        "macro_f1": round(float(np.mean(f1s)), 4)
    }

def calculate_displacement_error(y_true_coords, y_pred_coords):
    """
    Calculate Mean Absolute Error (MAE in kilometers) between ground truth coordinates and predicted coordinates.
    y_true_coords: list of (lat, lon)
    y_pred_coords: list of (lat, lon)
    """
    def haversine_km(lat1, lon1, lat2, lon2):
        R = 6371.0 # Earth radius in km
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        a = np.sin(dlat / 2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        return R * c

    errors = [haversine_km(t[0], t[1], p[0], p[1]) for t, p in zip(y_true_coords, y_pred_coords)]
    mae_km = float(np.mean(errors))
    max_err_km = float(np.max(errors))
    
    return {
        "mae_km": round(mae_km, 3),
        "max_error_km": round(max_err_km, 3),
        "endpoint_error_km": round(errors[-1], 3) if len(errors) > 0 else 0.0
    }
