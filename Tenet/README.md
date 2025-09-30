# Tenet - Face Recognition System (No DB)

Simple, folder-based face recognition app using Streamlit.

## Quick start

1. Install dependencies (Windows PowerShell):

```powershell
pip install streamlit face_recognition opencv-python pillow numpy
```

Note: If `face_recognition` fails to install, ensure you have:
- Python 3.8–3.11 recommended
- CMake and Visual Studio Build Tools for dlib
- Alternatively, try: `pip install face-recognition` (hyphen) and `pip install dlib` prebuilt wheels for your Python/CPU.

2. Add reference images
- Put 2–3 images in `known_faces/` next to `app.py`.
- Filename = person name, e.g., `john.jpg`, `sarah.png`.

3. Run the app

```powershell
streamlit run app.py
```

4. Use it
- Upload an image or a video.
- Click "Process".
- See annotated results and summary.

## Notes
- No database; everything is in-memory.
- Only first face in each known image is used.
- Matching tolerance = 0.6 (lower is stricter).
