import { useUser } from '@clerk/clerk-react';

export function useAuth() {
  const { user, isLoaded } = useUser();
  
  return { 
    user, 
    loading: !isLoaded 
  };
}