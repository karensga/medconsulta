import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Cliente Auth0 para el LOGIN de personas (panel administrativo). Es una
// Auth0 Application distinta a la que usa lib/api/client.ts: esa es una
// "Machine to Machine" para que el servidor llame a la API real; esta debe
// ser una "Regular Web Application" para el login interactivo. Por eso usa
// variables de entorno con nombre propio (AUTH0_WEBAPP_*) y no las
// AUTH0_CLIENT_ID / AUTH0_CLIENT_SECRET que ya están tomadas por el cliente M2M.
export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_WEBAPP_CLIENT_ID,
  clientSecret: process.env.AUTH0_WEBAPP_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  appBaseUrl: process.env.APP_BASE_URL,
});
