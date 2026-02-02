export type ArtiforgePing = { status?: string; version?: string } | { [key: string]: any };

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} must be set in environment (e.g. .env.local / Vercel env)`) ;
  return v;
}

export async function pingArtiforge(): Promise<ArtiforgePing> {
  const base = requireEnv('ARTIFORGE_API_URL').replace(/\/$/, '');
  const key = requireEnv('ARTIFORGE_API_KEY');

  // Try a conservative health endpoint; if your Artiforge provider uses a different path,
  // update this function to the correct path (e.g. `/v1/health` or `/status`).
  const url = `${base}/health`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const text = await res.text();
  try {
    return res.ok ? JSON.parse(text) : { ok: false, status: res.status, body: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, body: text };
  }
}

export async function callArtiforge(endpoint: string, body?: unknown, method = 'POST') {
  const base = requireEnv('ARTIFORGE_API_URL').replace(/\/$/, '');
  const key = requireEnv('ARTIFORGE_API_KEY');

  const res = await fetch(`${base}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, body: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, body: text };
  }
}
