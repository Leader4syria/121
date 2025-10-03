import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  siteName: string;
  siteNameEn: string;
  siteLogoUrl: string;
  updateTheme: (primaryColor: string, secondaryColor: string) => void;
  updateSiteInfo: (name: string, nameEn: string, logoUrl: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [primaryColor, setPrimaryColor] = useState('#dc2626');
  const [secondaryColor, setSecondaryColor] = useState('#059669');
  const [siteName, setSiteName] = useState('سوق حلب');
  const [siteNameEn, setSiteNameEn] = useState('Market Halab');
  const [siteLogoUrl, setSiteLogoUrl] = useState('');

  useEffect(() => {
    // Load theme from settings API immediately
    loadThemeFromAPI();
    
    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      const { primaryColor: newPrimary, secondaryColor: newSecondary } = event.detail;
      if (newPrimary) {
        setPrimaryColor(newPrimary);
        applyColorToCSS(newPrimary, newSecondary);
      }
    };

    const handleSiteInfoChange = (event: CustomEvent) => {
      const { siteName: newName, siteNameEn: newNameEn, siteLogoUrl: newLogo } = event.detail;
      if (newName) {
        setSiteName(newName);
      }
      if (newNameEn) {
        setSiteNameEn(newNameEn);
      }
      if (newLogo !== undefined) {
        setSiteLogoUrl(newLogo);
        if (newLogo) {
          updateFavicon(newLogo);
        }
      }
      if (newName || newNameEn) {
        updateDocumentTitle(newName || siteName, newNameEn || siteNameEn);
      }
    };

    const handleConfigRefresh = () => {
      // Force reload theme when config is updated
      loadThemeFromAPI();
    };

    window.addEventListener('themeColorChange', handleThemeChange as EventListener);
    window.addEventListener('siteInfoChange', handleSiteInfoChange as EventListener);
    window.addEventListener('configRefresh', handleConfigRefresh as EventListener);

    return () => {
      window.removeEventListener('themeColorChange', handleThemeChange as EventListener);
      window.removeEventListener('siteInfoChange', handleSiteInfoChange as EventListener);
      window.removeEventListener('configRefresh', handleConfigRefresh as EventListener);
    };
  }, [siteName, siteNameEn]);

  const loadThemeFromAPI = async () => {
    try {
      // First try to get everything from home API (includes colors now)
      const response = await fetch('/api/public/home', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update site info
        if (data.site_name) {
          setSiteName(data.site_name);
        }
        if (data.site_name_en) {
          setSiteNameEn(data.site_name_en);
        }
        if (data.site_logo_url) {
          setSiteLogoUrl(data.site_logo_url);
          updateFavicon(data.site_logo_url);
        }
        
        // Update colors from home API data
        if (data.primary_color) {
          setPrimaryColor(data.primary_color);
        }
        if (data.secondary_color) {
          setSecondaryColor(data.secondary_color);
        }
        
        // Apply colors to CSS immediately
        applyColorToCSS(
          data.primary_color || '#dc2626', 
          data.secondary_color || '#059669'
        );
        
        // Update document title immediately
        updateDocumentTitle(
          data.site_name || 'سوق حلب', 
          data.site_name_en || 'Market Halab'
        );
      }

      // Fallback: try to load admin settings if home API doesn't have colors
      if (!response.ok) {
        try {
          const adminResponse = await fetch('/api/admin/settings', {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (adminResponse.ok) {
            const settings = await adminResponse.json();
            
            if (settings.site_name) {
              setSiteName(settings.site_name);
            }
            if (settings.site_name_en) {
              setSiteNameEn(settings.site_name_en);
            }
            if (settings.site_logo_url) {
              setSiteLogoUrl(settings.site_logo_url);
              updateFavicon(settings.site_logo_url);
            }
            if (settings.primary_color) {
              setPrimaryColor(settings.primary_color);
            }
            if (settings.secondary_color) {
              setSecondaryColor(settings.secondary_color);
            }
            
            // Apply colors to CSS
            applyColorToCSS(
              settings.primary_color || '#dc2626', 
              settings.secondary_color || '#059669'
            );
            
            // Update document title
            updateDocumentTitle(
              settings.site_name || 'سوق حلب', 
              settings.site_name_en || 'Market Halab'
            );
          }
        } catch (adminError) {
          console.warn('Admin settings not accessible, using defaults');
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const updateDocumentTitle = (siteNameAr: string, siteNameEn: string) => {
    document.title = `${siteNameAr} - ${siteNameEn}`;
  };

  const updateFavicon = (logoUrl: string) => {
    let favicon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'shortcut icon';
      favicon.type = 'image/x-icon';
      document.head.appendChild(favicon);
    }
    favicon.href = logoUrl;
    
    // Also update apple touch icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.sizes = '180x180';
      appleTouchIcon.type = 'image/png';
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = logoUrl;
  };

  const applyColorToCSS = (primary: string, secondary: string) => {
    const root = document.documentElement;
    
    // Convert hex to RGB for Tailwind CSS variables
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    if (primaryRgb) {
      root.style.setProperty('--color-primary', `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);
      root.style.setProperty('--color-red-600', primary);
      root.style.setProperty('--color-red-500', primary);
      root.style.setProperty('--color-red-700', adjustBrightness(primary, -20));
      root.style.setProperty('--color-red-800', adjustBrightness(primary, -40));
    }

    if (secondaryRgb) {
      root.style.setProperty('--color-secondary', `${secondaryRgb.r} ${secondaryRgb.g} ${secondaryRgb.b}`);
      root.style.setProperty('--color-green-600', secondary);
      root.style.setProperty('--color-green-500', secondary);
      root.style.setProperty('--color-green-700', adjustBrightness(secondary, -20));
    }
  };

  const adjustBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const updateTheme = (newPrimaryColor: string, newSecondaryColor: string) => {
    setPrimaryColor(newPrimaryColor);
    setSecondaryColor(newSecondaryColor);
    applyColorToCSS(newPrimaryColor, newSecondaryColor);
  };

  const updateSiteInfo = (name: string, nameEn: string, logoUrl: string) => {
    setSiteName(name);
    setSiteNameEn(nameEn);
    setSiteLogoUrl(logoUrl);
    updateDocumentTitle(name, nameEn);
    if (logoUrl) {
      updateFavicon(logoUrl);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        secondaryColor,
        siteName,
        siteNameEn,
        siteLogoUrl,
        updateTheme,
        updateSiteInfo,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
