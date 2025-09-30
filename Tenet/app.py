"""
Face Recognition System - Streamlit App (No Database)

Requirements:
- Place reference images in the "known_faces" folder beside this app.
- Each image filename should be the person's name (e.g., john.jpg, sarah.png).
- Run: streamlit run app.py

Libraries: face_recognition, opencv-python, streamlit, numpy, pillow
"""

import os
import io
import sys
from typing import Dict, List, Tuple, Any

import numpy as np
from PIL import Image, ImageDraw, ImageFont

import streamlit as st

# Lazy import heavy libs to improve startup messages and error handling
try:
    import cv2  # type: ignore
except Exception as e:  # pragma: no cover - optional at import
    cv2 = None
    _cv2_err = e

try:
    import face_recognition  # type: ignore
except Exception as e:  # pragma: no cover - optional at import
    face_recognition = None
    _fr_err = e

TOLERANCE = 0.6
KNOWN_FACES_DIR = os.path.join(os.path.dirname(__file__), "known_faces")

# ---------------------- Utils ----------------------

def _safe_image_open(file_bytes: bytes) -> Image.Image:
    try:
        img = Image.open(io.BytesIO(file_bytes))
        # Convert to RGB to avoid mode issues
        if img.mode != "RGB":
            img = img.convert("RGB")
        return img
    except Exception as e:
        raise ValueError(f"Could not open image: {e}")


def _pil_to_ndarray(img: Image.Image) -> np.ndarray:
    return np.array(img)


def _ndarray_to_pil(arr: np.ndarray) -> Image.Image:
    return Image.fromarray(arr)


# ---------------------- Core Logic ----------------------

def load_known_faces() -> Dict[str, np.ndarray]:
    """Load known faces from KNOWN_FACES_DIR.

    Returns a dict mapping lowercase name -> encoding (128-d vector)
    If multiple faces in one image, take the first encoding only.
    Skips files that do not contain a detectable face.
    """
    if face_recognition is None:
        raise RuntimeError(
            f"face_recognition import failed. Install the dependency. Original error: {_fr_err}"
        )

    known: Dict[str, np.ndarray] = {}

    if not os.path.isdir(KNOWN_FACES_DIR):
        os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
        return known

    for fname in os.listdir(KNOWN_FACES_DIR):
        fpath = os.path.join(KNOWN_FACES_DIR, fname)
        if not os.path.isfile(fpath):
            continue
        name, ext = os.path.splitext(fname)
        if ext.lower() not in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
            continue
        try:
            image = face_recognition.load_image_file(fpath)
            encodings = face_recognition.face_encodings(image)
            if len(encodings) == 0:
                # No face in image; skip
                continue
            known[name.lower()] = encodings[0]
        except Exception:
            # Skip corrupted or unreadable files
            continue

    return known


def _match_face(known_encs: Dict[str, np.ndarray], encoding: np.ndarray) -> Tuple[str, float]:
    """Compare encoding to known faces.

    Returns (name, confidence_percent). If no match within tolerance, returns ("Unknown", 0.0).
    """
    if not known_encs:
        return "Unknown", 0.0

    names = list(known_encs.keys())
    encs = np.stack([known_encs[n] for n in names], axis=0)

    matches = face_recognition.compare_faces(encs, encoding, tolerance=TOLERANCE)
    distances = face_recognition.face_distance(encs, encoding)

    if len(distances) == 0:
        return "Unknown", 0.0

    best_idx = int(np.argmin(distances))
    best_dist = float(distances[best_idx])

    if matches[best_idx] and best_dist < TOLERANCE:
        # Convert distance to a rough confidence (heuristic)
        # Map [0, TOLERANCE] to [100, ~60] approximately
        conf = max(0.0, 1.0 - best_dist / TOLERANCE)  # 1 at 0, 0 at tolerance
        confidence = 60.0 + conf * 40.0  # 60-100%
        return names[best_idx], confidence
    else:
        return "Unknown", 0.0


def process_image(image_bytes: bytes, known_encs: Dict[str, np.ndarray]) -> Tuple[Image.Image, List[Tuple[Tuple[int, int, int, int], str, float]], Dict[str, Any], List[Image.Image]]:
    """Detect and recognize faces in an image.

    Returns annotated PIL image, list of results, a summary dict, and face thumbnails list.
    results: list of (face_location(top,right,bottom,left), name, confidence)
    """
    if face_recognition is None:
        raise RuntimeError(
            f"face_recognition import failed. Install the dependency. Original error: {_fr_err}"
        )

    img = _safe_image_open(image_bytes)
    img_np = _pil_to_ndarray(img)

    # Detect faces and compute encodings
    locations = face_recognition.face_locations(img_np)
    encodings = face_recognition.face_encodings(img_np, locations)

    results: List[Tuple[Tuple[int, int, int, int], str, float]] = []
    thumbnails: List[Image.Image] = []
    for loc, enc in zip(locations, encodings):
        name, confidence = _match_face(known_encs, enc)
        results.append((loc, name, confidence))
        # Create thumbnail from original RGB image
        top, right, bottom, left = loc
        pad = 10
        t = max(0, top - pad)
        b = min(img_np.shape[0], bottom + pad)
        l = max(0, left - pad)
        r = min(img_np.shape[1], right + pad)
        face_crop = img_np[t:b, l:r]
        if face_crop.size != 0:
            thumbnails.append(Image.fromarray(face_crop))

    # Draw boxes
    annotated = img.copy()
    draw = ImageDraw.Draw(annotated)
    for (top, right, bottom, left), name, conf in results:
        color = (0, 200, 0) if name != "Unknown" else (220, 0, 0)
        draw.rectangle([(left, top), (right, bottom)], outline=color, width=3)
        label = f"{name} ({conf:.1f}%)" if name != "Unknown" else name
        text_size = draw.textlength(label) if hasattr(draw, "textlength") else len(label) * 6
        # Draw label background
        draw.rectangle([(left, bottom), (left + text_size + 10, bottom + 18)], fill=color)
        draw.text((left + 5, bottom + 2), label, fill=(255, 255, 255))

    summary = {
        "total_faces": len(results),
        "identified": sum(1 for _, n, _ in results if n != "Unknown"),
        "unknown": sum(1 for _, n, _ in results if n == "Unknown"),
    }

    return annotated, results, summary, thumbnails


def process_video(video_bytes: bytes, known_encs: Dict[str, np.ndarray]) -> Tuple[List[Dict[str, Any]], List[Image.Image]]:
    """Process uploaded video, sample every 30th frame, detect and deduplicate faces, compare to known faces.

    Returns list of detections [{frame, location, name, confidence}] and preview thumbnails list.
    """
    if cv2 is None:
        raise RuntimeError(f"cv2 import failed. Install opencv-python. Original error: {_cv2_err}")
    if face_recognition is None:
        raise RuntimeError(
            f"face_recognition import failed. Install the dependency. Original error: {_fr_err}"
        )

    # Write bytes to a temp file to allow VideoCapture to read
    import tempfile

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    cap = cv2.VideoCapture(tmp_path)
    if not cap.isOpened():
        cap.release()
        os.unlink(tmp_path)
        raise ValueError("Could not open video. The file may be corrupted or unsupported.")

    frame_idx = 0
    sampled_idx = 0
    detections: List[Dict[str, Any]] = []
    thumbnails: List[Image.Image] = []

    unique_encodings: List[np.ndarray] = []

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frame_idx += 1

            # Sample every 30th frame
            if frame_idx % 30 != 0:
                continue
            sampled_idx += 1

            # Convert BGR to RGB
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            locations = face_recognition.face_locations(rgb)
            encodings = face_recognition.face_encodings(rgb, locations)

            # Deduplicate: only keep encodings that are not close to existing unique_encodings
            for loc, enc in zip(locations, encodings):
                is_new = True
                if unique_encodings:
                    # Compare against existing unique encodings
                    distances = face_recognition.face_distance(np.stack(unique_encodings), enc)
                    if np.any(distances < TOLERANCE):
                        is_new = False
                if is_new:
                    unique_encodings.append(enc)
                    # Match to known
                    name, confidence = _match_face(known_encs, enc)
                    detections.append({
                        "frame": frame_idx,
                        "location": loc,
                        "name": name,
                        "confidence": confidence,
                    })
                    # Save a thumbnail around the face
                    top, right, bottom, left = loc
                    face_img = rgb[max(0, top-10):bottom+10, max(0, left-10):right+10]
                    if face_img.size != 0:
                        thumbnails.append(Image.fromarray(face_img))
    finally:
        cap.release()
        os.unlink(tmp_path)

    return detections, thumbnails


# ---------------------- Streamlit UI ----------------------

def display_results_image(annotated: Image.Image, results: List[Tuple[Tuple[int, int, int, int], str, float]], summary: Dict[str, Any], thumbnails: List[Image.Image]):
    st.subheader("Results")
    col1, col2 = st.columns([2, 1])
    with col1:
        st.image(annotated, caption="Annotated Image", use_column_width=True)
    with col2:
        st.markdown("### Summary")
        st.write({k: int(v) if isinstance(v, (int, np.integer)) else v for k, v in summary.items()})
        st.markdown("### Faces")
        if thumbnails:
            caps = []
            for (_, name, conf), _thumb in zip(results, thumbnails):
                label = f"{name} ({conf:.1f}%)" if name != "Unknown" else name
                caps.append(label)
            st.image(thumbnails, caption=caps, width=160)
        else:
            for _loc, name, conf in results:
                st.write(f"{name} - {conf:.1f}%")


def display_results_video(detections: List[Dict[str, Any]], thumbnails: List[Image.Image]):
    st.subheader("Results")
    if thumbnails:
        st.image(thumbnails, caption=[f"{d['name']} ({d['confidence']:.1f}%)" for d in detections], width=160)
    st.markdown("### Summary")
    identified = sum(1 for d in detections if d["name"] != "Unknown")
    st.write({
        "unique_faces": len(detections),
        "identified": identified,
        "unknown": len(detections) - identified,
    })


def main():
    st.set_page_config(page_title="Face Recognition System", layout="wide")
    st.title("Face Recognition System")
    st.caption("No database. Drop images into 'known_faces' and run.")

    # Sidebar: Known faces
    with st.sidebar:
        st.header("Known Faces")
        st.write("Place images in Tenet/known_faces. Filename = person's name.")

        try:
            known_encs = load_known_faces()
        except Exception as e:
            st.error(str(e))
            return

        if not known_encs:
            st.warning("No known faces found. Add images to 'known_faces' to enable recognition.")
        else:
            st.success(f"Loaded {len(known_encs)} known faces: {', '.join(known_encs.keys())}")
            # Show thumbnails from folder
            try:
                valid_exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
                imgs = []
                caps = []
                for fname in os.listdir(KNOWN_FACES_DIR):
                    name, ext = os.path.splitext(fname)
                    if ext.lower() not in valid_exts:
                        continue
                    fpath = os.path.join(KNOWN_FACES_DIR, fname)
                    try:
                        im = Image.open(fpath)
                        if im.mode != "RGB":
                            im = im.convert("RGB")
                        imgs.append(im)
                        caps.append(name)
                    except Exception:
                        continue
                if imgs:
                    st.image(imgs, caption=caps, width=120)
            except Exception:
                pass

    # Tabs for Image and Video
    tab1, tab2 = st.tabs(["Upload Image", "Upload Video"])

    with tab1:
        img_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png", "bmp", "webp"], key="img")
        if img_file is not None:
            st.image(img_file, caption="Uploaded Image", use_column_width=True)
        if st.button("Process Image", type="primary"):
            if img_file is None:
                st.error("Please upload an image first.")
            else:
                try:
                    annotated, results, summary, thumbs = process_image(img_file.read(), known_encs)
                    if summary["total_faces"] == 0:
                        st.warning("No faces detected in the image.")
                    display_results_image(annotated, results, summary, thumbs)
                except Exception as e:
                    st.error(f"Failed to process image: {e}")

    with tab2:
        vid_file = st.file_uploader("Upload a video", type=["mp4", "mov", "avi", "mkv", "webm"], key="vid")
        if st.button("Process Video", type="primary"):
            if vid_file is None:
                st.error("Please upload a video first.")
            else:
                try:
                    detections, thumbs = process_video(vid_file.read(), known_encs)
                    if len(detections) == 0:
                        st.warning("No faces detected in sampled frames.")
                    display_results_video(detections, thumbs)
                except Exception as e:
                    st.error(f"Failed to process video: {e}")


if __name__ == "__main__":
    main()
