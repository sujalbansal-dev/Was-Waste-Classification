from ultralytics import YOLO

# Load the previous best brain to continue progress
model = YOLO('best.pt') 

# Optimized training for M4 chip
results = model.train(
    data='waste-dataset-v5-prev-2/data.yaml', 
    epochs=15, 
    imgsz=640,
    device='mps', 
    batch=-1,             # Auto-find the maximum speed for M4 RAM
    cache='disk',         # Pre-load images to avoid slow SSD reads
    workers=8,
    hsv_v=0.4,   
    degrees=15.0, 
    fliplr=0.5    
)
