from roboflow import Roboflow
rf = Roboflow(api_key="KwL8ZlENF5RK4zoYuCID")
workspace = rf.workspace()
print(f"Exact Workspace ID: {getattr(workspace, 'id', getattr(workspace, 'name', 'unknown'))}")
print(f"Project list: {getattr(workspace, 'project_list', 'none')}")
