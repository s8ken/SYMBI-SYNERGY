import React, { useState } from 'react';

export default function TrustScoringDemo({ token, bondId }) {
  const [resp, setResp] = useState(null);
  async function send(path, body) {
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify(body)
    });
    setResp(await r.json());
  }
  const safe = () => send('/api/chat/send', { bondId, sessionId:'demo', scopes:['chat.write'], content:{ type:'text', text:'Hello!' } });
  const exportReq = () => send('/api/chat/send', { bondId, sessionId:'demo', scopes:['data.export'], content:{ type:'text', text:'Export my medical data.' }, classification:'medical' });

  return (
    <div>
      <button onClick={safe}>Safe Send</button>
      <button onClick={exportReq}>Export Request (should block)</button>
      <pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(resp, null, 2)}</pre>
    </div>
  );
}