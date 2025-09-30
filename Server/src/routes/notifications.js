import express from 'express'
import { sendSMS, twilioConfigured, twilioStatus } from '../services/smsService.js'

const notificationsRouter = express.Router()

// Configuration status for Twilio/SMS
notificationsRouter.get('/status', (req, res) => {
  try {
    const status = typeof twilioStatus === 'function'
      ? twilioStatus()
      : { configured: twilioConfigured() }
    return res.json({ configured: twilioConfigured(), status })
  } catch (e) {
    return res.status(500).json({ status: 'error', error: e.message })
  }
})

// Simple GET helper for quick manual testing
// Usage:
//   - Open in browser: /api/notifications/test-sms?to=+15551234567&body=Hello
//   - Or POST JSON: { "to": "+15551234567", "body": "Hello" }
notificationsRouter.get('/test-sms', async (req, res) => {
  try {
    if (!twilioConfigured()) {
      return res.status(400).json({ success: false, error: 'Twilio not configured' })
    }
    const { to, body } = req.query || {}
    if (to && body) {
      const resp = await sendSMS(to, body)
      return res.json({ success: true, sid: resp.sid })
    }
    return res.json({
      success: true,
      message: 'SMS test endpoint. Provide ?to=E.164&body=Your+message as query or POST JSON { to, body }.',
      example: '/api/notifications/test-sms?to=+15551234567&body=Test',
      method: 'GET or POST',
    })
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message })
  }
})

notificationsRouter.post('/test-sms', async (req, res) => {
  try {
    if (!twilioConfigured()) return res.status(400).json({ success: false, error: 'Twilio not configured' })
    const { to, body } = req.body || {}
    if (!to || !body) return res.status(400).json({ success: false, error: 'to and body required' })
    const resp = await sendSMS(to, body)
    res.json({ success: true, sid: resp.sid })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default notificationsRouter
