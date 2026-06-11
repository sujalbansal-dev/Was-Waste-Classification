from roboflow import Roboflow
rf = Roboflow(api_key="KwL8ZlENF5RK4zoYuCID")
project = rf.workspace("sujals-workspace-5hfno").project("waste-dataset-v5-prev-wpqez")
version = project.version(2)
dataset = version.download("yolov11")
