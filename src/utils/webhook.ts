export async function sendToWebhook(payload: unknown) {
  const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_N8N_WEBHOOK_URL is not configured');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Webhook request failed (${res.status}): ${text}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

