export type ArtiforgePing = { status?: string; version?: string } | { [key: string]: any };

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} must be set in environment (e.g. .env.local / Vercel env)`) ;
  return v;
}

function getEnv(name: string): string | undefined {
  return process.env[name];
}

export async function pingArtiforge(): Promise<ArtiforgePing> {
  const baseUrl = getEnv('ARTIFORGE_API_URL');
  const key = getEnv('ARTIFORGE_API_KEY');
  
  if (!baseUrl || !key) {
    return { error: 'Artiforge environment variables not configured. Set ARTIFORGE_API_URL and ARTIFORGE_API_KEY in your environment.' };
  }
  
  const base = baseUrl.replace(/\/$/, '');

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
  const baseUrl = getEnv('ARTIFORGE_API_URL');
  const key = getEnv('ARTIFORGE_API_KEY');
  
  if (!baseUrl || !key) {
    throw new Error('Artiforge environment variables not configured. Set ARTIFORGE_API_URL and ARTIFORGE_API_KEY in your environment.');
  }
  
  const base = baseUrl.replace(/\/$/, '');

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
