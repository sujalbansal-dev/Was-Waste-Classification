import io
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="YOLO Object Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once
model = YOLO("yolov8n.pt")
print("Model loaded successfully")

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    print("Request received in /predict")
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Run YOLO inference
        results = model(image)
        
        # Parse results
        predictions = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # get bounding box coords
                b = box.xyxy[0].tolist() 
                # get confidence
                conf = float(box.conf[0])
                # get class id
                cls_id = int(box.cls[0])
                # get class name
                cls_name = model.names[cls_id]
                
                predictions.append({
                    "box": b,
                    "confidence": conf,
                    "class": cls_name,
                    "label": cls_name  # for frontend fallback
                })
        
        # Sort predictions by confidence
        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Add top predictions to root object for classifyApi.ts pickLabel/pickConfidence
        top_label = predictions[0]["label"] if predictions else "No object detected"
        top_conf = predictions[0]["confidence"] if predictions else 0.0
        
        return JSONResponse(content={
            "predictions": predictions,
            "label": top_label,
            "confidence": top_conf
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    print("Backend running on network IP: 10.129.23.25:5001")
    uvicorn.run("Model:app", host="0.0.0.0", port=5001, reload=True)
