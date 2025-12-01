let configCache = null;
let configPromise = null;

// Initialize config on module load with immediate fallback
function initializeConfig() {
  if (configPromise) return configPromise;
  
  configPromise = (async () => {
    try {
      const res = await fetch('/config.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load config.json');
      configCache = await res.json();
      console.log('✓ Config loaded from config.json:', configCache);
      return configCache;
    } catch (e) {
      console.warn('⚠ Failed to load config.json, using fallback:', e.message);
      // Fallback to env var or Cloud Run backend
      configCache = {
        apiBase:
          process.env.REACT_APP_API_URL ||
          'https://password-tracker-backend-681629792414.us-central1.run.app',
      };
      return configCache;
    }
  })();
  
  return configPromise;
}

// Pre-initialize config immediately on module load
initializeConfig();

export async function getRuntimeConfig() {
  // Always wait for initialization to complete
  return await initializeConfig();
}

export async function getApiBase() {
  const cfg = await getRuntimeConfig();
  if (!cfg || !cfg.apiBase) {
    console.warn('⚠ API base not configured, using default');
    return 'https://password-tracker-backend-681629792414.us-central1.run.app';
  }
  console.log('✓ Using API base:', cfg.apiBase);
  return cfg.apiBase;
}


