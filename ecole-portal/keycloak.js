import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://v95566.1blu.de/auth',
  realm: 'school',
  clientId: 'portal',
});

export default keycloak;
