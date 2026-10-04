import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader

VESSEL_CLASSES = ["Cargo", "Fishing", "Tanker", "Tug", "Suspicious/Unclassified"]

class MaritimeVesselDataset(Dataset):
    def __init__(self, samples):
        self.samples = samples

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]
        img_data = sample["image"] # numpy (3, 128, 128)
        label = sample["label"]   # int 0..4
        
        tensor_img = torch.from_numpy(img_data).float() / 255.0
        tensor_label = torch.tensor(label, dtype=torch.long)
        
        return tensor_img, tensor_label
