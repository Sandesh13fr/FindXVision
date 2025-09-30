# FindXVision

FindXVision is a comprehensive platform designed to streamline the process of managing missing person cases. By leveraging modern web technologies, it provides tools for reporting, tracking, and resolving cases efficiently while fostering collaboration among responders, volunteers, and families.

---

## **Table of Contents**

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Folder Structure](#folder-structure)
6. [Contributing](#contributing)
7. [License](#license)

---

## **Features**

### **Case Lifecycle Management**
- Create, update, and resolve cases with detailed profiles and timelines.
- Attach evidence like photos, documents, and notes.
- Track case progress with audit-ready timelines.

### **Missing Person Intake**
- Guided form for reporting missing persons with validation.
- Image uploads for attaching photos.
- Geolocation support to pinpoint last-seen locations.

### **Advanced Search & Filters**
- Search by name, location, or case number.
- Filter cases by status, priority, or age range.
- Sort results to prioritize high-urgency cases.

### **Role-Based Security Controls**
- Role-based access for responders, admins, and law enforcement.
- Audit logging to track every action.
- Privacy tooling to protect sensitive data.

### **Real-Time Notifications**
- SMS and email alerts for critical updates.
- Customizable notification preferences.
- Real-time updates to ensure no lead is missed.

### **Face Recognition Console**
- Upload images or videos for face matching.
- Live camera mode for real-time recognition.
- Store detections with metadata like timestamps and geolocation.

### **Operational Dashboards**
- Track case throughput and response times.
- Monitor notification activity.
- View system-wide statistics.

---

## **Technologies Used**

### **Frontend**
- React
- Vite
- Material-UI
- Redux

### **Backend**
- Node.js
- Express.js
- MongoDB

### **Other Tools**
- Passport.js for authentication
- Prometheus for metrics monitoring
- Twilio for SMS notifications

---

## **Installation**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### **Steps**

1. Clone the repository:
   ```bash
   git clone https://github.com/Sandesh13fr/FindXVision.git
   ```

2. Navigate to the project directory:
   ```bash
   cd FindXVision
   ```

3. Install dependencies for both frontend and backend:
   ```bash
   npm install
   cd Server
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the `Server` directory.
   - Add the following variables:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     TWILIO_SID=your_twilio_sid
     TWILIO_AUTH_TOKEN=your_twilio_auth_token
     ```

5. Start the development servers:
   - Backend:
     ```bash
     cd Server
     npm run dev
     ```
   - Frontend:
     ```bash
     cd FindXVision
     npm run dev
     ```

6. Open the application in your browser:
   ```
   http://localhost:3000
   ```

---

## **Usage**

1. **Report a Missing Person**
   - Navigate to the "Report Missing Person" page.
   - Fill out the form with details and upload images.

2. **Search for Missing Persons**
   - Use the search bar and filters to find cases.

3. **Admin Tools**
   - Approve or reject cases.
   - Manage user roles and permissions.

4. **Face Recognition**
   - Upload images to identify individuals.
   - Use live camera mode for real-time recognition.

---

## **Folder Structure**

```
FindXVision/
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page-level components
│   ├── services/          # API services
│   ├── store/             # Redux store
│   ├── theme/             # Theme configuration
│   └── App.jsx            # Main app entry point
├── Server/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Middleware functions
│   │   ├── services/      # Backend services
│   │   └── index.js       # Server entry point
│   └── .env               # Environment variables
└── package.json           # Project metadata
```

---

## **Contributing**

We welcome contributions to FindXVision! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

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
