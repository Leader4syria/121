import { useAuth as useMochaAuth } from '@getmocha/users-service/react';
import { useState, useEffect } from 'react';

interface LocalUser {
  id: number;
  mocha_user_id: string;
  username: string;
  email: string;
  full_name: string;
  balance: number;
  is_admin: boolean;
  is_vip: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ExtendedUser {
  id: string;
  email: string;
  google_sub: string;
  google_user_data: {
    email: string;
    email_verified: boolean;
    family_name?: string | null;
    given_name?: string | null;
    hd?: string | null;
    name?: string | null;
    picture?: string | null;
    sub: string;
  };
  last_signed_in_at: string;
  created_at: string;
  updated_at: string;
  localUser?: LocalUser;
  balance?: number;
}

export function useAuth() {
  const mochaAuth = useMochaAuth();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<{ [key: string]: ExtendedUser }>({});

  const fetchExtendedUser = async (forceRefresh = false) => {
    if (mochaAuth.user) {
      const cacheKey = mochaAuth.user.id;
      
      // Check cache first if not forcing refresh
      if (!forceRefresh && userCache[cacheKey]) {
        setExtendedUser(userCache[cacheKey]);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          // Add balance to the extended user
          const userWithBalance = {
            ...userData,
            balance: userData.localUser?.balance || 0
          };
          
          // Cache the user data
          setUserCache(prev => ({
            ...prev,
            [cacheKey]: userWithBalance
          }));
          
          setExtendedUser(userWithBalance);
        }
      } catch (error) {
        console.error('Error fetching extended user data:', error);
      }
    } else {
      setExtendedUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!mochaAuth.isPending) {
      fetchExtendedUser();
    }
  }, [mochaAuth.user, mochaAuth.isPending]);

  const logout = async () => {
    await mochaAuth.logout();
    setExtendedUser(null);
  };

  // Legacy login function (redirects to OAuth)
  const login = async (): Promise<boolean> => {
    // For backward compatibility with existing components
    // Redirect to OAuth login instead
    await mochaAuth.redirectToLogin();
    return true;
  };

  // Legacy register function (redirects to OAuth)
  const register = async (): Promise<boolean> => {
    // For backward compatibility with existing components
    // Redirect to OAuth login instead
    await mochaAuth.redirectToLogin();
    return true;
  };

  return {
    ...mochaAuth,
    user: extendedUser,
    loading: loading || mochaAuth.isPending,
    logout,
    refreshUser: () => fetchExtendedUser(true),
    login,
    register,
  };
}
