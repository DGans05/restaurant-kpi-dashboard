import React from 'react';
import { pingArtiforge } from '@/lib/artiforge';

export default async function ArtiforgeTestPage() {
  let result: unknown;
  try {
    result = await pingArtiforge();
  } catch (err: any) {
    result = { error: err?.message ?? String(err) };
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Artiforge connection test</h1>
      <p>Endpoint: <code>{process.env.ARTIFORGE_API_URL ?? '(not set)'}</code></p>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 12, borderRadius: 6 }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
