export async function sendToWebhook(webhookUrl, message, senderName, avatarUrl) {
  const payload = { username: senderName, content: message };
  if (avatarUrl) payload.avatar_url = avatarUrl;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok || res.status === 204;
  } catch (error) {
    console.error('Webhook send error:', error);
    return false;
  }
}
