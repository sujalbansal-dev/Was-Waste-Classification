# --- YOUR ORIGINAL SETTINGS (Turned off for now) ---
# from ultralytics import YOLO
# model = YOLO('yolo11n.pt')
# model.train(
#     data='waste-dataset-v5-prev-1/data.yaml',
#     epochs=50,
#     imgsz=640,
#     batch=8,
#     workers=2,
#     cache=False,
#     device='mps',
#     project='runs',
#     name='waste_yolo11_m4_optimized',
#     exist_ok=True,
#     patience=10,
#     amp=True
# 

# --- THE RESUME SCRIPT 
from ultralytics import YOLO

# 1. Load saved brain (which remembers all the settings above)
model = YOLO('/Users/purukumar/Wasify/runs/detect/runs/waste_yolo11_m4_optimized/weights/last.pt') 

# 2. Start training exactly where it crashed
model.train(resume=True)