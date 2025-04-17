interface ElectronAPI {
  task: {
    create: (data: any) => Promise<any>;
    getAll: () => Promise<any[]>;
    getByFilters: (filters: any) => Promise<any[]>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  taskType: {
    getAll: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  tag: {
    getAll: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
  reportingPeriod: {
    get: () => Promise<any>;
    update: (data: any) => Promise<any>;
  };
  automationRule: {
    getAll: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
  settings: {
    get: () => Promise<any>;
    update: (data: any) => Promise<any>;
  };
  ai: {
    generateSummary: (tasks: any[], options: any) => Promise<any>;
  };
  files: {
    readFile: (filePath: string) => Promise<string>;
    saveFile: (content: string, defaultPath: string) => Promise<any>;
  };
  app: {
    getVersion: () => Promise<string>;
    backupDatabase: () => Promise<any>;
  };
}

declare interface Window {
  api: ElectronAPI;
} 