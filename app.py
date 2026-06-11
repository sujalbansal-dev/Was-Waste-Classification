import streamlit as st
from PIL import Image
import json
import os
import time
from datetime import datetime
import streamlit_authenticator as stauth
from auth import get_authenticator
from model_utils import predict_waste, model
from database import init_db, add_user, get_all_users

# Must be first Streamlit command
st.set_page_config(page_title="Wasify - AI Waste Detection", page_icon="♻️", layout="wide", initial_sidebar_state="expanded")

def apply_custom_css():
    st.markdown("""
        <style>
        /* Base Background */
        .stApp {
            background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80");
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
        }

        /* 1. The Glassmorphism Card */
        [data-testid="column"]:nth-of-type(2) > div {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(12px);
            border-radius: 20px;
            padding: 2rem;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px 0 rgba(0,0,0,0.5);
        }

        /* 2. Premium Tabs Design */
        [data-baseweb="tab-list"] {
            gap: 8px;
            border-bottom: none !important;
            background-color: rgba(0,0,0,0.2);
            padding: 6px;
            border-radius: 12px;
        }
        [data-baseweb="tab"] {
            border-radius: 8px !important;
            padding: 8px 16px !important;
            color: #9CA3AF !important;
            border: none !important;
            background: transparent !important;
        }
        [data-baseweb="tab"]:hover {
            color: white !important;
        }
        [aria-selected="true"] {
            background-color: #10B981 !important; /* Tech Green */
            color: white !important;
        }
        [data-baseweb="tab-highlight"] {
            display: none !important;
        }

        /* 3. Inputs & Buttons */
        div[data-baseweb="input"] {
            background-color: rgba(0, 0, 0, 0.4) !important;
            border-radius: 10px !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            color: white !important;
        }
        div[data-baseweb="input"]:focus-within {
            border: 1px solid #10B981 !important;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
        }
        input[class*="st-"] {
            color: white !important;
        }
        
        .stButton > button {
            background-color: #10B981 !important;
            color: white !important;
            border: none !important;
            border-radius: 10px !important;
            font-weight: 700 !important;
            padding: 0.5rem 1rem !important;
            transition: all 0.3s ease !important;
        }
        .stButton > button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
            filter: brightness(1.1);
        }
        .stButton > button:active {
            transform: translateY(0px);
        }

        /* 4. Dashboard Glass Cards */
        [data-testid="stVerticalBlockBorderWrapper"] {
            background: rgba(15, 23, 42, 0.6) !important;
            backdrop-filter: blur(12px) !important;
            border-radius: 15px !important;
            padding: 20px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 8px 32px 0 rgba(0,0,0,0.5) !important;
        }

        /* 5. Metrics styling */
        [data-testid="stMetricValue"] {
            color: #10B981 !important;
            font-size: 2.5rem !important;
            font-weight: 800 !important;
        }
        [data-testid="stMetricLabel"] {
            color: #9CA3AF !important;
            font-size: 1.1rem !important;
            font-weight: 600 !important;
        }
        </style>
        """, unsafe_allow_html=True)

HISTORY_FILE = "history.json"

def save_history(label, confidence):
    history = []
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            try:
                history = json.load(f)
            except json.JSONDecodeError:
                history = []
    history.insert(0, {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "label": label,
        "confidence": float(confidence)
    })
    history = history[:50]
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

# Session State Initialization
if 'logout' not in st.session_state:
    st.session_state['logout'] = None
if 'authentication_status' not in st.session_state:
    st.session_state['authentication_status'] = None
if 'name' not in st.session_state:
    st.session_state['name'] = None
if 'username' not in st.session_state:
    st.session_state['username'] = None

if "camera_open" not in st.session_state:
    st.session_state.camera_open = False
if "image_data" not in st.session_state:
    st.session_state.image_data = None
if "analysis_result" not in st.session_state:
    st.session_state.analysis_result = None

def main():
    apply_custom_css()
    
    # Initialize the SQLite database on startup
    init_db()
    
    # Instantiate the authenticator dynamically
    authenticator = get_authenticator()
    
    if st.session_state.get("authentication_status"):
        # User logged in, render Dashboard
        st.title("♻️ Wasify AI Dashboard")
        st.markdown(f"Welcome to the **Wasify AI** object detection platform, *{st.session_state['name']}*. Upload an image or use your camera to instantly classify waste using our advanced YOLO vision model.")

        if model is None:
            st.warning("Model missing. Please run train.py to train your model, then ensure waste_model.pt exists in this folder.")

        # Sidebar Configuration
        st.sidebar.header("⚙️ Configuration")
        conf_threshold = st.sidebar.slider("Confidence Threshold", 0.0, 1.0, 0.5, 0.05)
        
        st.sidebar.markdown("### Image Input")
        
        if not st.session_state.camera_open:
            if st.sidebar.button("Open Camera 📸", use_container_width=True):
                st.session_state.camera_open = True
                st.session_state.image_data = None
                st.session_state.analysis_result = None
                st.rerun()
        else:
            if st.sidebar.button("Close Camera ❌", use_container_width=True):
                st.session_state.camera_open = False
                st.rerun()
            
            camera_img = st.sidebar.camera_input("Capture Image", label_visibility="collapsed")
            if camera_img:
                st.session_state.image_data = camera_img
                st.session_state.camera_open = False
                st.session_state.analysis_result = None
                st.rerun()
                
        st.sidebar.markdown("<p style='text-align: center; margin: 10px 0; color: #6B7280; font-weight: bold;'>OR</p>", unsafe_allow_html=True)
        
        upload_img = st.sidebar.file_uploader("Upload Image 🖼️", type=["jpg", "jpeg", "png", "webp"])
        if upload_img and st.session_state.image_data != upload_img:
            st.session_state.image_data = upload_img
            st.session_state.analysis_result = None

        # Preview and Analyze Process
        if st.session_state.image_data is not None and not st.session_state.camera_open:
            img_preview = Image.open(st.session_state.image_data)
            
            st.divider()
            st.subheader("Model Inference")
            
            # Columns for Original and Result
            col1, col2 = st.columns(2)
            
            with col1:
                with st.container(border=True):
                    st.markdown("#### Original Uploaded Image")
                    st.image(img_preview, use_container_width=True)
                    
                    analyze_button = st.button("ANALYZE", type="primary", disabled=(model is None), use_container_width=True)

            if analyze_button and model is not None:
                with st.spinner("Classifying with YOLO..."):
                    try:
                        annotated_img_rgb, label_name, top_conf = predict_waste(img_preview, conf_threshold)
                        
                        st.session_state.analysis_result = {
                            "image": annotated_img_rgb,
                            "label": label_name,
                            "confidence": top_conf
                        }
                        save_history(label_name, top_conf)
                    except Exception as e:
                        st.error(f"Failed to analyze: {str(e)}")

            with col2:
                with st.container(border=True):
                    st.markdown("#### AI Detection Result")
                    if st.session_state.analysis_result is not None:
                        res = st.session_state.analysis_result
                        st.image(res["image"], use_container_width=True)
                    else:
                        st.info("Click ANALYZE to view results here.")

            # Analytics Section
            if st.session_state.analysis_result is not None:
                st.divider()
                st.subheader("Confidence Score & Analytics")
                
                with st.container(border=True):
                    res = st.session_state.analysis_result
                    
                    col_a, col_b = st.columns(2)
                    with col_a:
                        st.markdown("<br>", unsafe_allow_html=True)
                        if res["label"] == "No Objects Detected":
                            st.warning("⚠️ No waste objects were detected in the image.")
                        else:
                            st.success(f"✅ Detected Class: **{res['label']}**")
                    with col_b:
                        st.metric(label="AI Confidence", value=f"{res['confidence']*100:.1f}%")
                    
                    if st.button("New Scan", key="new_scan", use_container_width=True):
                        st.session_state.image_data = None
                        st.session_state.analysis_result = None
                        st.rerun()

        st.divider()
        
        # Classification History
        history = load_history()
        if history:
            st.subheader('Classification History 🕰️')
            for item in history:
                with st.container(border=True):
                    st.markdown(
                        f'''
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: bold; color: white; font-size: 1.1rem;">{item['label']}</span>
                            <span style="color: #10B981; font-weight: bold; font-size: 1.1rem;">{item['confidence']*100:.1f}%</span>
                        </div>
                        <div style="color: #9CA3AF; font-size: 13px; margin-top: 4px;">{item['timestamp']}</div>
                        ''', unsafe_allow_html=True
                    )

        # Logout functionality
        authenticator.logout('Logout', 'sidebar')
        
    else:
        # User not logged in, show Login and Register tabs
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.markdown("<h1 style='text-align: center; color: white;'>♻️ Wasify</h1>", unsafe_allow_html=True)
            st.markdown("<p style='text-align: center; color: #9CA3AF;'>Please login or register to continue.</p>", unsafe_allow_html=True)
            
            tab1, tab2 = st.tabs(['Login', 'Register'])
            
            with tab1:
                authenticator.login()
                
                if st.session_state.get("authentication_status") is False:
                    st.error('Username/password is incorrect')
                elif st.session_state.get("authentication_status") is None:
                    st.warning('Please enter your username and password')
                    
            with tab2:
                st.markdown("### Create an Account")
                with st.form("register_form"):
                    new_name = st.text_input("Name")
                    new_username = st.text_input("Username")
                    new_password = st.text_input("Password", type="password")
                    submit_btn = st.form_submit_button("Register")
                    
                    if submit_btn:
                        if new_name and new_username and new_password:
                            # Hash the password
                            hashed_pw = stauth.Hasher.hash(new_password)
                            # Insert into database
                            success = add_user(new_username, new_name, hashed_pw)
                            
                            if success:
                                st.success("Registration successful! You can now switch to the Login tab.")
                                time.sleep(1.5)
                                st.rerun()
                            else:
                                st.error("Username already exists. Please choose another.")
                        else:
                            st.warning("Please fill out all fields.")

if __name__ == "__main__":
    main()
