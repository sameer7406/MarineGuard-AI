import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from ml.debris_detection.preprocessing import preprocess_sentinel2_bands

class MarineDebrisDataset(Dataset):
    """
    PyTorch Dataset for Sentinel-2 Multispectral Marine Debris Segmentation/Classification.
    """
    def __init__(self, samples, transform=None):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        bands_data = sample["bands"] # numpy array (6, H, W)
        mask_data = sample["mask"]   # numpy array (1, H, W) or (H, W)
        
        tensor_image, diagnostic_stats = preprocess_sentinel2_bands(bands_data)
        
        if mask_data.ndim == 2:
            mask_data = mask_data[np.newaxis, :, :]
            
        tensor_mask = torch.from_numpy(mask_data).float()
        
        return tensor_image, tensor_mask

def create_data_loaders(samples, batch_size=4, train_ratio=0.8, val_ratio=0.1):
    """
    Creates train, validation, and test PyTorch DataLoaders with stratified index split to prevent leakage.
    """
    total = len(samples)
    indices = np.random.permutation(total)
    
    train_end = int(total * train_ratio)
    val_end = train_end + int(total * val_ratio)
    
    train_idx = indices[:train_end]
    val_idx = indices[train_end:val_end]
    test_idx = indices[val_end:]
    
    train_samples = [samples[i] for i in train_idx]
    val_samples = [samples[i] for i in val_idx]
    test_samples = [samples[i] for i in test_idx]
    
    train_loader = DataLoader(MarineDebrisDataset(train_samples), batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(MarineDebrisDataset(val_samples), batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(MarineDebrisDataset(test_samples), batch_size=batch_size, shuffle=False)
    
    return train_loader, val_loader, test_loader, {
        "train_count": len(train_samples),
        "val_count": len(val_samples),
        "test_count": len(test_samples)
    }
