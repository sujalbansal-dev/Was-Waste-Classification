# Wasify - Real-Time AI Waste Classification System

## Project Evolution

Wasify (V1) was initially built using React Native to provide a mobile application interface for waste management. However, to better handle the rigorous performance requirements of our custom YOLO vision model during real-time classification, the system was pivoted to a modular, enterprise-grade Streamlit web architecture (V2). This evolution allows for significantly improved model inference speeds, easier deployment, and a more robust foundation for advanced computer vision tasks.

## Tech Stack

- **Machine Learning & Vision:** PyTorch, Ultralytics YOLO11, OpenCV
- **Web Interface (Active V2):** Streamlit
- **Database:** SQLite
- **Mobile Interface (Legacy V1):** React Native, Expo

## Local Setup

To run the active Streamlit web application locally, please ensure your Python environment is set up and execute the following commands from the root directory:

```bash
# Install the required Python dependencies
pip install -r requirements.txt

# Launch the Streamlit application
streamlit run app.py
```
