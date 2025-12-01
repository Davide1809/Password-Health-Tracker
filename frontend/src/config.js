let configCache = null;

// Initialize config on module load with immediate fallback
async function initializeConfig() {
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load config.json');
    configCache = await res.json();
    console.log('Config loaded from config.json:', configCache);
  } catch (e) {
    console.warn('Failed to load config.json, using fallback:', e.message);
    // Fallback to env var or Cloud Run backend
    configCache = {
      apiBase:
        process.env.REACT_APP_API_URL ||
        'https://password-tracker-backend-681629792414.us-central1.run.app',
    };
  }
}

// Pre-initialize config immediately
initializeConfig();

export async function getRuntimeConfig() {
  // Wait for initial config to complete
  if (!configCache) {
    await initializeConfig();
  }
  return configCache;
}

export async function getApiBase() {
  const cfg = await getRuntimeConfig();
  if (!cfg || !cfg.apiBase) {
    console.warn('API base not configured, using default');
    return 'https://password-tracker-backend-681629792414.us-central1.run.app';
  }
  return cfg.apiBase;
}

