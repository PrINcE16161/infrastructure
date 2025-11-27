import { NetworkState } from '../types/network';

const STORAGE_KEY = 'network_topology_state';

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
