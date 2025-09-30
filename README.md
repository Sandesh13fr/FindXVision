# FindXVision Face Recognition Integration

This repository combines the FindXVision MERN application with the Tenet face-recognition workflow. The integration adds an administrator-only console that can:

- Upload still images or video clips for recognition.
- Stream frames from the browser webcam and surface matches in real time.
- Store every detection in MongoDB, including optional device geolocation.
- Retrieve history snapshots so administrators can review recent matches.

## Prerequisites

1. **Face matching service** – Run the Flask service from the `Tenet` project (or any compatible service) and note its public URL.
2. **MongoDB** – The Express API already connects using the `.env` configuration. Ensure the database is reachable.
3. **Node.js 18+ & npm** – Required for both the API (`Server/`) and the Vite React app (`FindXVision/FindXVision/`).

## Environment variables

Add the following value to `Server/.env` (create the file if it does not exist):

```
FACE_SERVICE_URL=http://localhost:5001
```

Adjust the URL to match where the Flask face service is running.

The frontend uses `FindXVision/FindXVision/.env` to read `VITE_API_URL` (defaults to `http://localhost:5000/api`). Update as needed when deploying.

## Running the stack

1. **Back-end API**
   ```powershell
   Set-Location -Path 'd:\face\FindXVision\Server'
   npm install
   npm run dev
   ```

2. **Face service (Flask)** – Run the Python service from the `Tenet` project in a separate terminal.

3. **Front-end admin console**
   ```powershell
   Set-Location -Path 'd:\face\FindXVision\FindXVision'
   npm install
   npm run dev
   ```

   Navigate to `http://localhost:5173` and sign in with an administrator account. The *Face Recognition* entry appears in the navigation.

## Quality checks

- Frontend linting: `npm run lint` inside `FindXVision/FindXVision/`.
- Backend linting: `npm run lint` inside `FindXVision/Server/`.
- Backend tests: `npm test` inside `FindXVision/Server/` (runs Jest – add coverage as features grow).

> **Heads-up:** Some pre-existing frontend components outside the new face-recognition console still flag unused variables under linting. They do not affect functionality but should be tidied up in a follow-up pass.

## Usage tips

- Enable the **Attach device location** switch to capture GPS coordinates alongside detections. The browser will prompt once per session.
- Live camera mode samples frames every ~750ms. Matches trigger a momentary visual flash and push detections into MongoDB.
- The *Recent Matches* section aggregates results by person and tracks the first/last sighting plus source channel (image, video, live).

## Next steps

- Wire alerting (SMS/WhatsApp) using the stored detection metadata.
- Add automated tests for the new `/api/face` endpoints.
- Resolve outstanding lint warnings in legacy auth components.
