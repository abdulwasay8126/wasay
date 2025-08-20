import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatApiResponse, ChatRequestBody } from '../../src/types';
import { sendToWebhook } from '../../src/utils/webhook';

function isValid(body: any): body is ChatRequestBody {
  return body && typeof body.message === 'string' && typeof body.timestamp === 'string';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatApiResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!isValid(req.body)) {
    return res.status(400).json({ ok: false, error: 'Invalid payload' });
  }

  try {
    const result = await sendToWebhook({
      message: req.body.message,
      timestamp: req.body.timestamp,
      metadata: {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });

    const reply = (result && (result.reply || result.message)) || `Received: ${req.body.message}`;
    return res.status(200).json({ ok: true, reply });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message || 'Webhook failed' });
  }
}

