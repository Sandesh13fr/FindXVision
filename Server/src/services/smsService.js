import 'dotenv/config'
import twilio from 'twilio'

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SMS_FROM,
  TWILIO_MESSAGING_SERVICE_SID,
  NOTIFY_SMS_ENABLED = 'true',
} = process.env

let client = null
let initError = null
try {
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  } else {
    initError = 'Missing SID or TOKEN'
  }
} catch (err) {
  initError = err?.message || String(err)
}

export function twilioStatus() {
  return {
    enabledFlag: NOTIFY_SMS_ENABLED === 'true',
    hasSid: Boolean(TWILIO_ACCOUNT_SID),
    hasToken: Boolean(TWILIO_AUTH_TOKEN),
    hasSender: Boolean(TWILIO_SMS_FROM || TWILIO_MESSAGING_SERVICE_SID),
    usingMessagingService: Boolean(TWILIO_MESSAGING_SERVICE_SID),
    fromNumberSet: Boolean(TWILIO_SMS_FROM),
    clientReady: Boolean(client),
    initError,
  }
}

export function twilioConfigured() {
  const s = twilioStatus()
  return Boolean(s.enabledFlag && s.clientReady && s.hasSender && !s.initError)
}

export async function sendSMS(to, body) {
  if (!twilioConfigured()) throw new Error('Twilio not configured')
  const message = {
    to,
    body,
  }
  if (TWILIO_MESSAGING_SERVICE_SID) {
    message.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID
  } else {
    message.from = TWILIO_SMS_FROM
  }
  return client.messages.create(message)
}
