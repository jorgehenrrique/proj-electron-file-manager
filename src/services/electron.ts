import { AppSettings } from '../../electron/shared/types';

declare global {
  interface Window {
    electron: {
      invoke: (channel: string, data?: unknown) => Promise<unknown>;
    };
  }
}

export const electronAPI = {
  loadSettings: (): Promise<AppSettings> => {
    return window.electron.invoke('load-settings') as Promise<AppSettings>;
  },

  saveSettings: (settings: AppSettings): Promise<boolean> => {
    return window.electron.invoke(
      'save-settings',
      settings
    ) as Promise<boolean>;
  },

  getRandomLocation: (locationsPath: string): Promise<string> => {
    return window.electron.invoke(
      'get-random-location',
      locationsPath
    ) as Promise<string>;
  },

  updateLocation: (paths: {
    originalPath: string;
    newPath: string;
  }): Promise<boolean> => {
    return window.electron.invoke('update-location', paths) as Promise<boolean>;
  },
};
