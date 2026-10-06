const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { summarize } = require('./gemini');

// 金鑰存在 Google Secret Manager：firebase functions:secrets:set GEMINI_API_KEY
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

exports.summarize = onRequest(
  { region: 'asia-east1', secrets: [GEMINI_API_KEY], timeoutSeconds: 120, memory: '256MiB', maxInstances: 5 },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      const summary = await summarize(req.body, GEMINI_API_KEY.value(), process.env.GEMINI_MODEL);
      res.json({ summary });
    } catch (e) {
      if (!e.status) console.error(e);
      res.status(e.status || 500).json({ error: e.status ? e.message : '伺服器錯誤' });
    }
  }
);
