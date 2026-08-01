// Script de diagnóstico: verifica que el login Auth0 (client credentials) y la
// llamada a la API real funcionen, sin tener que pasar por la UI de la app.
//
// Uso:
//   node scripts/check-api-auth.mjs
//
// Lee las variables directamente de .env (no depende de "dotenv" ni de correr
// dentro de Next.js).

import { readFileSync } from "node:fs";

const loadEnvFile = () => {
  try {
    const content = readFileSync(new URL("../.env", import.meta.url), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    console.warn("No se pudo leer .env, se usarán solo las variables de entorno ya definidas.");
  }
};

loadEnvFile();

const {
  API_BASE_URL,
  AUTH0_DOMAIN,
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
} = process.env;

const need = { API_BASE_URL, AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET };
const missing = Object.entries(need)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  console.error(`✗ Faltan variables en .env: ${missing.join(", ")}`);
  process.exit(1);
}

const step = (label) => console.log(`\n— ${label} —`);

const main = async () => {
  step("1. Pidiendo access token a Auth0 (client_credentials)");
  console.log(`   POST https://${AUTH0_DOMAIN}/oauth/token`);
  console.log(`   client_id: ${AUTH0_CLIENT_ID}`);
  console.log(`   audience:  ${AUTH0_AUDIENCE}`);

  const tokenRes = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_AUDIENCE,
    }),
  });

  const tokenText = await tokenRes.text();
  if (!tokenRes.ok) {
    console.error(`✗ Auth0 respondió ${tokenRes.status}:`);
    console.error(tokenText);
    console.error(
      "\nRevisa: AUTH0_CLIENT_SECRET correcto, AUTH0_CLIENT_ID/AUTH0_DOMAIN/AUTH0_AUDIENCE tal como están en Auth0 → Applications → tu app M2M, y que esa app tenga autorizada la API (Auth0 → APIs → mediagenda-api → Machine to Machine Applications)."
    );
    process.exit(1);
  }

  const tokenData = JSON.parse(tokenText);
  console.log(`✓ Token obtenido (expira en ${tokenData.expires_in}s, tipo ${tokenData.token_type})`);

  step("2. Probando GET /health (sin auth)");
  const healthRes = await fetch(`${API_BASE_URL}/health`);
  console.log(`   HTTP ${healthRes.status}`);
  if (healthRes.ok) {
    console.log(`✓ La API responde. Body: ${await healthRes.text()}`);
  } else {
    console.warn(`⚠ /health no respondió OK — puede que la API esté dormida (Heroku free/eco dyno) o caída.`);
  }

  step("3. Probando GET /especialistas con el token (endpoint autenticado)");
  const especialistasRes = await fetch(`${API_BASE_URL}/especialistas?activo=true`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const especialistasText = await especialistasRes.text();
  console.log(`   HTTP ${especialistasRes.status}`);

  if (especialistasRes.ok) {
    const list = JSON.parse(especialistasText);
    console.log(`✓ Auth OK — la API aceptó el token y devolvió ${Array.isArray(list) ? list.length : "?"} especialista(s).`);
    if (Array.isArray(list) && list.length > 0) {
      console.log("   Ejemplo de forma de un especialista:");
      console.log("  ", JSON.stringify(list[0], null, 2).split("\n").join("\n   "));
    }
  } else if (especialistasRes.status === 401) {
    console.error("✗ 401 Unauthorized: el token no fue aceptado. Revisa audience/scopes en Auth0.");
    console.error(especialistasText);
  } else if (especialistasRes.status === 403) {
    console.error("✗ 403 Forbidden: el token es válido pero no tiene permiso para este recurso (revisa scopes/roles de la app M2M).");
    console.error(especialistasText);
  } else {
    console.error(`✗ Respuesta inesperada (${especialistasRes.status}):`);
    console.error(especialistasText);
  }
};

main().catch((e) => {
  console.error("✗ Error inesperado corriendo el diagnóstico:", e);
  process.exit(1);
});
