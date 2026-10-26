export const environment = {
  gatewayUrl: 'http://localhost:8080',
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'jobboard',
    clientId: 'jobboard-front',
  },
} as const;
