import base64
import io
import os
from datetime import datetime
from typing import Dict, List, Tuple
from pathlib import Path
import tempfile

import numpy as np
from PIL import Image
from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    import face_recognition  # type: ignore
except Exception as e:
    face_recognition = None
    _fr_err = e

app = Flask(__name__)
CORS(app)

TOLERANCE = 0.6
BASE_DIR = Path(__file__).resolve().parent
# Load environment from local .env if present (python-dotenv)
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=BASE_DIR / '.env', override=False)
except Exception:
    pass
# Allow override through env var (useful when pointing to FindXVision known_faces)
KNOWN_DIR = Path(os.getenv('KNOWN_FACES_DIR') or (BASE_DIR / 'known_faces'))

# Optional Supabase storage integration
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('SBase_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY') or os.getenv('SBase_Anon_key')
SUPABASE_BUCKET = os.getenv('SUPABASE_BUCKET', 'faces')
SUPABASE_ENABLED = bool(SUPABASE_URL and SUPABASE_ANON_KEY)

KNOWN_ENCODINGS: List[np.ndarray] = []
KNOWN_NAMES: List[str] = []

# A small cache dir under Tenet backend for downloaded Supabase faces
CACHE_DIR = BASE_DIR / '.faces-cache'
CACHE_DIR.mkdir(exist_ok=True)

def _fetch_supabase_faces() -> None:
    """Download images from Supabase Storage bucket into CACHE_DIR/faces and
    merge them alongside local KNOWN_DIR for encoding. Only uses public/anon key.
    """
    if not SUPABASE_ENABLED:
        return
    try:
        import requests
        # List objects: public endpoint: /storage/v1/object/list/{bucket}
        list_url = f"{SUPABASE_URL}/storage/v1/object/list/{SUPABASE_BUCKET}"
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f"Bearer {SUPABASE_ANON_KEY}",
            'Content-Type': 'application/json'
        }
    # List recursively
        resp = requests.post(list_url, headers=headers, json={'prefix': ''}, timeout=15)
        resp.raise_for_status()
        items = resp.json() if isinstance(resp.json(), list) else []

        bucket_dir = CACHE_DIR / SUPABASE_BUCKET
        bucket_dir.mkdir(parents=True, exist_ok=True)

        for it in items:
            name = it.get('name')
            if not name:
                continue
            # filter by image extensions
            ext = os.path.splitext(name)[1].lower()
            if ext not in {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}:
                continue

            # Prefer private fetch: /storage/v1/object/{bucket}/{path}
            obj_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{name}"
            try:
                r = requests.get(obj_url, headers=headers, timeout=20)
                r.raise_for_status()
                out_path = bucket_dir / name.replace('/', '_')
                with open(out_path, 'wb') as f:
                    f.write(r.content)
            except Exception:
                # Fallback to public path if bucket is public
                try:
                    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{name}"
                    r = requests.get(public_url, headers={'apikey': SUPABASE_ANON_KEY}, timeout=20)
                    r.raise_for_status()
                    out_path = bucket_dir / name.replace('/', '_')
                    with open(out_path, 'wb') as f:
                        f.write(r.content)
                except Exception:
                    continue
    except Exception:
        # Fail soft: keep local faces working even if Supabase fetch fails
        pass


def load_known_faces() -> Tuple[List[str], List[np.ndarray]]:
    if face_recognition is None:
        raise RuntimeError(f"face_recognition import failed: {_fr_err}")

    names: List[str] = []
    encodings: List[np.ndarray] = []

    # Refresh Supabase copies first (if enabled)
    _fetch_supabase_faces()

    # Build a list of directories to scan: local + cache bucket
    dirs = []
    if KNOWN_DIR.is_dir():
        dirs.append(KNOWN_DIR)
    bucket_dir = CACHE_DIR / SUPABASE_BUCKET
    if bucket_dir.is_dir():
        dirs.append(bucket_dir)

    for d in dirs:
        for fname in os.listdir(d):
            fpath = d / fname
            if not fpath.is_file():
                continue
            name, ext = os.path.splitext(fname)
            if ext.lower() not in {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}:
                continue
            try:
                image = face_recognition.load_image_file(str(fpath))
                encs = face_recognition.face_encodings(image)
                if not encs:
                    continue
                names.append(name)
                encodings.append(encs[0])
            except Exception:
                continue

    return names, encodings


KNOWN_NAMES, KNOWN_ENCODINGS = load_known_faces()


def _b64_to_image(data_url: str) -> np.ndarray:
    # data_url like 'data:image/jpeg;base64,...'
    if ',' in data_url:
        _, b64 = data_url.split(',', 1)
    else:
        b64 = data_url
    img_bytes = base64.b64decode(b64)
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    return np.array(img)


def _match(encoding: np.ndarray) -> Tuple[bool, str, float]:
    if not KNOWN_ENCODINGS:
        return False, "", 0.0
    encs = np.stack(KNOWN_ENCODINGS)
    matches = face_recognition.compare_faces(encs, encoding, tolerance=TOLERANCE)
    distances = face_recognition.face_distance(encs, encoding)
    if len(distances) == 0:
        return False, "", 0.0
    best_idx = int(np.argmin(distances))
    best_dist = float(distances[best_idx])
    if matches[best_idx] and best_dist < TOLERANCE:
        # Confidence heuristic similar to frontend
        conf = max(0.0, 1.0 - best_dist / TOLERANCE)
        confidence = 60.0 + conf * 40.0
        return True, KNOWN_NAMES[best_idx], confidence
    return False, "", 0.0


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'ok': True,
        'known_faces': len(KNOWN_ENCODINGS),
        'tolerance': TOLERANCE,
        'known_faces_dir': str(KNOWN_DIR),
        'supabase': {
            'enabled': SUPABASE_ENABLED,
            'bucket': SUPABASE_BUCKET if SUPABASE_ENABLED else None
        }
    })

@app.route('/api/reload', methods=['POST'])
def reload_faces():
    global KNOWN_NAMES, KNOWN_ENCODINGS
    try:
        KNOWN_NAMES, KNOWN_ENCODINGS = load_known_faces()
        return jsonify({'ok': True, 'known_faces': len(KNOWN_ENCODINGS)})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


@app.route('/api/process-image', methods=['POST'])
def process_image():
    if face_recognition is None:
        return jsonify({'success': False, 'error': str(_fr_err)}), 500

    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    file = request.files['file']
    try:
        img = Image.open(file.stream).convert('RGB')
        rgb = np.array(img)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Invalid image: {e}'}), 400

    locations = face_recognition.face_locations(rgb)
    encodings = face_recognition.face_encodings(rgb, locations)

    matches_out = []
    for loc, enc in zip(locations, encodings):
        matched, name, conf = _match(enc)
        if matched:
            top, right, bottom, left = loc
            # Extract thumbnail
            pad = 10
            t = max(0, top - pad)
            b = min(rgb.shape[0], bottom + pad)
            l = max(0, left - pad)
            r = min(rgb.shape[1], right + pad)
            thumb = rgb[t:b, l:r]
            # Encode thumbnail to base64
            pil_thumb = Image.fromarray(thumb)
            buf = io.BytesIO()
            pil_thumb.save(buf, format='JPEG')
            thumb_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

            matches_out.append({
                'name': name,
                'confidence': conf,
                'thumbnail': f'data:image/jpeg;base64,{thumb_b64}'
            })

    if not matches_out:
        return jsonify({'success': True, 'matched': False, 'matches': []})
    return jsonify({'success': True, 'matched': True, 'matches': matches_out})


@app.route('/api/process-video', methods=['POST'])
def process_video():
    if face_recognition is None:
        return jsonify({'success': False, 'error': str(_fr_err)}), 500

    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    file = request.files['file']

    # Save to temp to read with cv2
    import tempfile
    try:
        data = file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
            tmp.write(data)
            path = tmp.name
    except Exception as e:
        return jsonify({'success': False, 'error': f'Invalid video: {e}'}), 400

    try:
        import cv2
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            cap.release()
            os.unlink(path)
            return jsonify({'success': False, 'error': 'Cannot open video'}), 400

        unique_encs: List[np.ndarray] = []
        out_matches = []
        frame_idx = 0

        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frame_idx += 1
            if frame_idx % 30 != 0:
                continue
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            locations = face_recognition.face_locations(rgb)
            encodings = face_recognition.face_encodings(rgb, locations)

            for loc, enc in zip(locations, encodings):
                is_new = True
                if unique_encs:
                    dists = face_recognition.face_distance(np.stack(unique_encs), enc)
                    if np.any(dists < TOLERANCE):
                        is_new = False
                if not is_new:
                    continue
                unique_encs.append(enc)

                matched, name, conf = _match(enc)
                if matched:
                    top, right, bottom, left = loc
                    pad = 8
                    t = max(0, top - pad)
                    b = min(rgb.shape[0], bottom + pad)
                    l = max(0, left - pad)
                    r = min(rgb.shape[1], right + pad)
                    thumb = rgb[t:b, l:r]
                    pil_thumb = Image.fromarray(thumb)
                    buf = io.BytesIO()
                    pil_thumb.save(buf, format='JPEG')
                    thumb_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

                    out_matches.append({
                        'frame': frame_idx,
                        'name': name,
                        'confidence': conf,
                        'thumbnail': f'data:image/jpeg;base64,{thumb_b64}'
                    })
        cap.release()
    finally:
        try:
            os.unlink(path)
        except Exception:
            pass

    if not out_matches:
        return jsonify({'success': True, 'matched': False, 'matches': []})
    return jsonify({'success': True, 'matched': True, 'matches': out_matches})


@app.route('/api/process-frame', methods=['POST'])
def process_frame():
    if face_recognition is None:
        return jsonify({'success': False, 'error': str(_fr_err)}), 500

    data = request.get_json(silent=True) or {}
    frame_data = data.get('frame')
    if not frame_data:
        return jsonify({'success': False, 'error': 'Missing frame'}), 400

    try:
        rgb = _b64_to_image(frame_data)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Invalid frame: {e}'}), 400

    locations = face_recognition.face_locations(rgb)
    encodings = face_recognition.face_encodings(rgb, locations)

    for loc, enc in zip(locations, encodings):
        matched, name, conf = _match(enc)
        if matched:
            # Build response with timestamp
            return jsonify({
                'success': True,
                'matched': True,
                'face_data': {
                    'name': name,
                    'confidence': conf,
                    'timestamp': datetime.utcnow().isoformat() + 'Z'
                }
            })

    return jsonify({'success': True, 'matched': False})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5001'))
    app.run(host='0.0.0.0', port=port, debug=True)
