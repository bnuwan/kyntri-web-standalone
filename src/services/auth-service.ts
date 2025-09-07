import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  attributes: Record<string, any>;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Configure Amplify
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || 'mock-pool-id',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || 'mock-client-id',
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || 'mock-identity-pool-id',
      loginWith: {
        email: true,
        username: false,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        },
      },
      allowGuestAccess: false,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
};

Amplify.configure(awsConfig);

export class AuthService {
  async login({ username, password }: LoginCredentials): Promise<AuthUser> {
    try {
      console.log('Attempting to sign in with username:', username);
      
      const signInResult = await signIn({
        username,
        password,
      });

      console.log('Sign in result:', signInResult);

      if (signInResult.isSignedIn) {
        const currentUser = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
        
        console.log('Current user:', currentUser);
        console.log('User attributes:', userAttributes);

        return {
          id: currentUser.userId,
          username: currentUser.username,
          email: userAttributes.email || '',
          name: userAttributes.name || username,
          attributes: userAttributes,
        };
      } else {
        throw new Error('Sign in not completed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      return {
        id: currentUser.userId,
        username: currentUser.username,
        email: userAttributes.email || '',
        name: userAttributes.name || currentUser.username,
        attributes: userAttributes,
      };
    } catch (error) {
      console.log('No current user found');
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();