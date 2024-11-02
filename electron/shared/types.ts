export interface TraderConfig {
  scriptPath: string;
  locationsPath: string;
  intervalMinutes: number;
  isRunning: boolean;
  lastChange?: Date;
}

export interface TraderLocation {
  folderPath: string;
  name: string;
}

export interface AppSettings {
  config: TraderConfig;
  history: {
    timestamp: Date;
    location: string;
  }[];
}
