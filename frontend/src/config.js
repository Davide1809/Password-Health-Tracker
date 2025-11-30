let configCache = null;

export async function getRuntimeConfig() {
  if (configCache) return configCache;
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load config.json');
    configCache = await res.json();
    return configCache;
  } catch (e) {
    // Fallback to env var or Cloud Run backend
    configCache = {
      apiBase:
        process.env.REACT_APP_API_URL ||
        'https://password-tracker-backend-681629792414.us-central1.run.app',
    };
    return configCache;
  }
}

export async function getApiBase() {
  const cfg = await getRuntimeConfig();
  return cfg.apiBase;
}
