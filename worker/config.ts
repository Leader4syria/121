// Site configuration cache with file-based storage
let siteConfig: any = null;
let lastConfigUpdate: number = 0;
const CONFIG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface SiteConfig {
  site_name: string;
  site_name_en: string;
  site_logo_url: string;
  site_description: string;
  primary_color: string;
  secondary_color: string;
  announcement_text: string;
  support_email: string;
  support_phone: string;
  facebook_url: string;
  twitter_url: string;
  min_deposit_amount: string;
  max_deposit_amount: string;
  enable_registrations: string;
}

const defaultConfig: SiteConfig = {
  site_name: 'سوق حلب',
  site_name_en: 'Market Halab',
  site_logo_url: '',
  site_description: 'منصة تجارية متكاملة',
  primary_color: '#dc2626',
  secondary_color: '#059669',
  announcement_text: 'مرحباً بكم في سوق حلب - أفضل المنتجات والخدمات',
  support_email: '',
  support_phone: '',
  facebook_url: '',
  twitter_url: '',
  min_deposit_amount: '10',
  max_deposit_amount: '1000',
  enable_registrations: '1'
};

// Static config storage key for KV
const CONFIG_STORAGE_KEY = 'site_config_v1';

export async function getSiteConfig(db: any, env?: any): Promise<SiteConfig> {
  const now = Date.now();
  
  // Return cached config if still valid
  if (siteConfig && (now - lastConfigUpdate) < CONFIG_CACHE_DURATION) {
    return siteConfig;
  }
  
  // Try to load from static storage first if KV is available
  if (env && env.SITE_CONFIG_KV) {
    try {
      const storedConfig = await env.SITE_CONFIG_KV.get(CONFIG_STORAGE_KEY);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        siteConfig = { ...defaultConfig, ...parsedConfig };
        lastConfigUpdate = now;
        return siteConfig;
      }
    } catch (error) {
      console.warn('Could not load config from KV storage:', error);
    }
  }
  
  try {
    // Fetch settings from database
    const settings = await db.prepare(`
      SELECT setting_key, setting_value FROM settings
    `).all();
    
    const settingsMap = (settings.results || []).reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});
    
    // Merge with defaults
    siteConfig = { ...defaultConfig, ...settingsMap };
    lastConfigUpdate = now;
    
    // Save to static storage if KV is available
    if (env && env.SITE_CONFIG_KV) {
      try {
        await env.SITE_CONFIG_KV.put(CONFIG_STORAGE_KEY, JSON.stringify(siteConfig));
      } catch (error) {
        console.warn('Could not save config to KV storage:', error);
      }
    }
    
    return siteConfig;
  } catch (error) {
    console.error('Error fetching site config:', error);
    return defaultConfig;
  }
}

export async function updateSiteConfig(db: any, newSettings: Partial<SiteConfig>, env?: any): Promise<void> {
  try {
    // Update database
    for (const [key, value] of Object.entries(newSettings)) {
      await db.prepare(`
        INSERT OR REPLACE INTO settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).bind(key, value).run();
    }
    
    // Update cache immediately
    if (siteConfig) {
      siteConfig = { ...siteConfig, ...newSettings };
    } else {
      siteConfig = { ...defaultConfig, ...newSettings };
    }
    lastConfigUpdate = Date.now();
    
    // Save to static storage immediately if KV is available
    if (env && env.SITE_CONFIG_KV) {
      try {
        await env.SITE_CONFIG_KV.put(CONFIG_STORAGE_KEY, JSON.stringify(siteConfig));
      } catch (error) {
        console.warn('Could not save config to KV storage:', error);
      }
    }
  } catch (error) {
    console.error('Error updating site config:', error);
    throw error;
  }
}

export function invalidateConfigCache(): void {
  siteConfig = null;
  lastConfigUpdate = 0;
}

// Force refresh config from database (bypasses cache)
export async function refreshSiteConfig(db: any, env?: any): Promise<SiteConfig> {
  siteConfig = null;
  lastConfigUpdate = 0;
  return await getSiteConfig(db, env);
}

// Get cached config without database access (for fast reads)
export function getCachedSiteConfig(): SiteConfig | null {
  const now = Date.now();
  if (siteConfig && (now - lastConfigUpdate) < CONFIG_CACHE_DURATION) {
    return siteConfig;
  }
  return null;
}

// Set initial config from external source (for fast startup)
export function setInitialConfig(config: SiteConfig): void {
  siteConfig = config;
  lastConfigUpdate = Date.now();
}
