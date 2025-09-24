import React, { useEffect, useState } from 'react';

export default function TrustDashboard({ token, bondId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!bondId || !token) return;
    fetch(`/api/trust/bonds/${bondId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error);
  }, [token, bondId]);

  const b = data?.data;
  if (!b) return <div>Loading trust…</div>;

  return (
    <div>
      <h3>Trust Score: {b.trustScore} ({b.trustBand})</h3>
      <div>Purpose: {b.scope?.purpose || '—'}</div>
      <div>Permissions: {(b.scope?.permissions || []).join(', ') || '—'}</div>
      <div>Expires: {b.scope?.expiresAt ? new Date(b.scope.expiresAt).toLocaleString() : '—'}</div>
    </div>
  );
}