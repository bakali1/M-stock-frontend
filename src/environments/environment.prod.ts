type EnvConfig = {
  API_URL?: string;
};

declare global {
  var __ENV__: EnvConfig | undefined;
};

export const environment = {
  production: true,
  apiUrl: globalThis.__ENV__?.API_URL ?? 'https://api.mstock.example.com/api/v0'
};
