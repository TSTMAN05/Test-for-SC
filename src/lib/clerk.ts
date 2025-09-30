// Clerk utility functions for role management

export type UserRole = 'super_admin' | 'admin' | 'user';

// Check if user is super admin using Clerk metadata
export const isUserSuperAdmin = (user: any): boolean => {
  if (!user) return false;
  return user.publicMetadata?.role === 'super_admin';
};

// Check if user has admin privileges (super_admin or admin)
export const isUserAdmin = (user: any): boolean => {
  if (!user) return false;
  const role = user.publicMetadata?.role;
  return role === 'super_admin' || role === 'admin';
};

// Get user role from Clerk metadata
export const getUserRole = (user: any): UserRole => {
  if (!user) return 'user';
  return user.publicMetadata?.role || 'user';
};

// Set user role (this would typically be done server-side)
// For now, we'll provide instructions on how to set it manually
export const setUserRoleInstructions = (userId: string, role: UserRole) => {
  return {
    message: `To set user role to ${role}:`,
    steps: [
      '1. Go to your Clerk Dashboard',
      '2. Navigate to Users',
      `3. Find user with ID: ${userId}`,
      '4. Click on the user',
      '5. Go to the "Metadata" tab',
      '6. In "Public metadata" section, add:',
      `   { "role": "${role}" }`,
      '7. Save the changes'
    ]
  };
};