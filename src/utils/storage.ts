import { NetworkState } from '../types/network';

const STORAGE_KEY = 'network_topology_state';
const THEME_KEY = 'network_topology_theme';
const AUTH_TOKEN_KEY = 'network_topology_auth_token';

export const saveNetworkState = (state: NetworkState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save network state:', error);
  }
};

export const loadNetworkState = (): NetworkState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load network state:', error);
  }
  return null;
};

export const clearNetworkState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
};

export const loadTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
  return 'light';
};

export const saveAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

export const loadAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to load auth token:', error);
  }
  return null;
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};