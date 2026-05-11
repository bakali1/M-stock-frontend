type EnvConfig = {
  API_URL?: string;
};

declare global {
  var __ENV__: EnvConfig | undefined;
}

export const environment = {
  production: false,
  apiUrl: globalThis.__ENV__?.API_URL ?? 'http://localhost:8080/api/v0'
};
