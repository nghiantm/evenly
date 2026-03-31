import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setTokenProvider } from '@/lib/apiClient';

/**
 * Invisible component that wires the Clerk getToken function into the
 * axios interceptor so every API call gets a fresh JWT automatically.
 * Must be rendered inside ClerkProvider and inside the authenticated tree.
 */
const TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE;

export function TokenSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    const getTemplateToken = TEMPLATE
      ? (options?: Parameters<typeof getToken>[0]) => getToken({ ...options, template: TEMPLATE })
      : getToken;

    setTokenProvider(getTemplateToken);

    getTemplateToken().then(token => {
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.email) {
          console.log('[TokenSync] email is empty in JWT payload:', payload);
        }
      } catch (e) {
        console.error('[TokenSync] failed to decode token', e);
      }
    });

    return () => setTokenProvider(null);
  }, [getToken]);

  return null;
}
