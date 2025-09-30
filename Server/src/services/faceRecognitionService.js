import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { FaceDetection } from '../models/FaceDetection.js';
import { sendSMS, twilioConfigured } from './smsService.js';

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://localhost:5001';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '../../uploads/face-temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const sanitizeMatches = (matches = []) => {
  return matches.map((match) => ({
    name: match.name,
    confidence: match.confidence,
    frame: match.frame,
    thumbnail: match.thumbnail,
    mediaUrl: match.mediaUrl,
  }));
};

export const faceRecognitionService = {
  async ping() {
    try {
      const { data } = await axios.get(`${FACE_SERVICE_URL}/api/health`);
      return data;
    } catch (error) {
      throw new Error(`Face service unavailable: ${error.message}`);
    }
  },

  async processImage(file, options = {}) {
    const tempPath = path.join(tempDir, `${Date.now()}-${file.originalname}`);
    await fs.promises.writeFile(tempPath, file.buffer);

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempPath), file.originalname);

      const { data } = await axios.post(`${FACE_SERVICE_URL}/api/process-image`, formData, {
        headers: formData.getHeaders(),
        timeout: 120000,
      });

      const matches = sanitizeMatches(data.matches || []);

      if (matches.length) {
        const payload = matches.map((match) => ({
          personName: match.name,
          confidence: match.confidence,
          source: 'image',
          frame: match.frame,
          thumbnail: match.thumbnail,
          mediaUrl: match.mediaUrl,
          captureTime: options.captureTime || new Date(),
          location: options.location,
          metadata: options.metadata,
        }));
        const docs = await FaceDetection.insertMany(payload);
        // Send SMS alerts (best-effort)
        if (twilioConfigured()) {
          const to = options?.notifyTo || process.env.ALERT_SMS_TO || null;
          if (to) {
            for (let i = 0; i < matches.length; i++) {
              const m = matches[i];
              const d = docs?.[i];
              if (!m || !d) continue;
              const when = d.captureTime?.toISOString?.() || new Date().toISOString();
              const loc = d.location && d.location.lat && d.location.lon
                ? ` https://maps.google.com/?q=${d.location.lat},${d.location.lon}`
                : '';
              const body = `FindXVision: Match found for ${m.name} (${m.confidence}% ). Time: ${when}.${loc}`;
              try { await sendSMS(to, body) } catch (_) {}
            }
          }
        }
      }

      return {
        success: data.success,
        matched: data.matched,
        matches,
      };
    } finally {
      fs.promises.unlink(tempPath).catch(() => {});
    }
  },

  async processVideo(file, options = {}) {
    const tempPath = path.join(tempDir, `${Date.now()}-${file.originalname}`);
    await fs.promises.writeFile(tempPath, file.buffer);

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempPath), file.originalname);

      const { data } = await axios.post(`${FACE_SERVICE_URL}/api/process-video`, formData, {
        headers: formData.getHeaders(),
        timeout: 240000,
      });

      const matches = sanitizeMatches(data.matches || []);

      if (matches.length) {
        const payload = matches.map((match) => ({
          personName: match.name,
          confidence: match.confidence,
          source: 'video',
          frame: match.frame,
          thumbnail: match.thumbnail,
          mediaUrl: match.mediaUrl,
          captureTime: options.captureTime || new Date(),
          location: options.location,
          metadata: { ...options.metadata, frame: match.frame },
        }));
        const docs = await FaceDetection.insertMany(payload);
        if (twilioConfigured()) {
          const to = options?.notifyTo || process.env.ALERT_SMS_TO || null;
          if (to) {
            for (let i = 0; i < matches.length; i++) {
              const m = matches[i];
              const d = docs?.[i];
              if (!m || !d) continue;
              const when = d.captureTime?.toISOString?.() || new Date().toISOString();
              const loc = d.location && d.location.lat && d.location.lon
                ? ` https://maps.google.com/?q=${d.location.lat},${d.location.lon}`
                : '';
              const body = `FindXVision: Match found for ${m.name} (${m.confidence}% ). Time: ${when}.${loc}`;
              try { await sendSMS(to, body) } catch (_) {}
            }
          }
        }
      }

      return {
        success: data.success,
        matched: data.matched,
        matches,
      };
    } finally {
      fs.promises.unlink(tempPath).catch(() => {});
    }
  },

  async processFrame(payload = {}) {
  const { frame, frameNumber, location, captureTime } = payload;
  if (!frame) {
      throw new Error('Frame payload missing');
    }

    const { data } = await axios.post(`${FACE_SERVICE_URL}/api/process-frame`, { frame }, {
      timeout: 20000,
    });

    if (data?.matched && data?.face_data) {
      const match = data.face_data;
      const doc = await FaceDetection.create({
        personName: match.name,
        confidence: match.confidence,
        source: 'live',
        frame: match.frame ?? frameNumber,
        thumbnail: match.thumbnail || payload.thumbnail,
        captureTime: captureTime ? new Date(captureTime) : new Date(),
        location,
        metadata: payload.metadata,
      });
      if (twilioConfigured()) {
        const to = payload?.notifyTo || process.env.ALERT_SMS_TO || null;
        if (to) {
          const when = doc.captureTime?.toISOString?.() || new Date().toISOString();
          const loc = doc.location && doc.location.lat && doc.location.lon
            ? ` https://maps.google.com/?q=${doc.location.lat},${doc.location.lon}`
            : '';
          const body = `FindXVision: Live match for ${match.name} (${match.confidence}% ). Time: ${when}.${loc}`;
          try { await sendSMS(to, body) } catch (_) {}
        }
      }
    }

    return data;
  },

  async listDetections(query = {}) {
    const {
      limit = 50,
      offset = 0,
      person,
      source,
    } = query;

    const filters = {};
    if (person) filters.personName = person;
    if (source) filters.source = source;

    const [items, total] = await Promise.all([
      FaceDetection.find(filters)
        .sort({ captureTime: -1 })
        .skip(Number(offset))
        .limit(Math.min(Number(limit), 200)),
      FaceDetection.countDocuments(filters),
    ]);

    return { items, total };
  },
};
