export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    const { action, database_id, page_id, properties } = body;

    if (req.method === 'GET') {
      const db_id = req.query.database_id;
      const r = await fetch(`https://api.notion.com/v1/databases/${db_id}/query`, {
        method: 'POST', headers, body: JSON.stringify({ page_size: 100 })
      });
      return res.json(await r.json());
    }

    if (action === 'create') {
      // AI Summarization Logic via Gemini
      const { summarize, transcript: rawTranscript } = body;
      if (summarize && rawTranscript) {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        let summaryText = rawTranscript;
        
        if (GEMINI_API_KEY) {
          try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `你是一位牙科專業秘書，請將以下牙科看診轉錄稿整理成簡短、專業且條列式的病歷重點摘要。只輸出摘要內容，不要有額外廢話：\n\n${rawTranscript}`
                  }]
                }]
              })
            });
            const geminiData = await geminiRes.json();
            summaryText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || rawTranscript;
          } catch (e) {
            console.error("Gemini API call failed:", e);
            summaryText = `[摘要失敗] ${rawTranscript}`;
          }
        }
        properties["Summary"] = { rich_text: [{ text: { content: summaryText } }] };
      }

      // Handle file uploads (e.g. audio/images)
      const { fileData, fileName, fileType } = body;
      if (fileData && fileName) {
        // Notion API doesn't support direct file uploads via /pages.
        // Files must be hosted elsewhere and provided as URLs.
        // However, we can use an external service or a temporary workaround.
        // For now, we'll store the filename and assume external hosting logic.
        properties["AudioFile"] = { rich_text: [{ text: { content: fileName } }] };
      }

      // Convert our simplified properties to Notion API format
      const notionProps = {};
      for (const [key, val] of Object.entries(properties || {})) {
        if (key.startsWith('date:')) continue; // handled separately
        notionProps[key] = val;
      }
      // Handle dates
      for (const [key, val] of Object.entries(properties || {})) {
        if (key.startsWith('date:')) {
          const parts = key.split(':');
          const propName = parts[1];
          const subKey = parts[2];
          if (!notionProps[propName]) notionProps[propName] = { date: {} };
          if (subKey === 'start' && val) notionProps[propName].date.start = val;
        }
      }
      const r = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST', headers,
        body: JSON.stringify({ parent: { database_id }, properties: notionProps })
      });
      const data = await r.json();
      return res.json(data);
    }

    if (action === 'update') {
      const r = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ properties })
      });
      return res.json(await r.json());
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
