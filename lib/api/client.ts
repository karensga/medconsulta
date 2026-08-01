// Cliente HTTP para la API real (MediAgenda / NunkiCitas), desplegada en Heroku.
// Maneja la autenticación Auth0 client-credentials (M2M) igual que el script
// "before-request" de la colección Bruno en /Downloads/api: pide un access token,
// lo cachea en memoria del proceso y lo renueva cuando faltan <60s para que expire.

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const API_BASE_URL = process.env.API_BASE_URL;

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;
let inFlight: Promise<string> | null = null;

const assertConfigured = () => {
  const missing = [
    ["API_BASE_URL", API_BASE_URL],
    ["AUTH0_DOMAIN", AUTH0_DOMAIN],
    ["AUTH0_AUDIENCE", AUTH0_AUDIENCE],
    ["AUTH0_CLIENT_ID", AUTH0_CLIENT_ID],
    ["AUTH0_CLIENT_SECRET", AUTH0_CLIENT_SECRET],
  ].filter(([, v]) => !v);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno para hablar con la API real: ${missing
        .map(([k]) => k)
        .join(", ")}. Revisa el archivo .env.`
    );
  }
};

const fetchAccessToken = async (): Promise<string> => {
  const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_AUDIENCE,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `No se pudo obtener el token de Auth0 (HTTP ${res.status}): ${body}`
    );
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return tokenCache.token;
};

const getAccessToken = async (): Promise<string> => {
  assertConfigured();

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  // Evita pedir varios tokens en paralelo si llegan varias requests a la vez.
  if (!inFlight) {
    inFlight = fetchAccessToken().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const token = await getAccessToken();
  const url = new URL(`${API_BASE_URL}${path}`);

  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const rawText = await res.text();
  const data = rawText ? safeJsonParse(rawText) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, extractErrorMessage(data, res.status, path));
  }

  return data as T;
};

// Para los "getX(id)" que deben devolver null cuando el recurso no existe.
// Solo absorbe el 404 real — cualquier otro error (401/403 de auth, 500, red
// caída, etc.) se vuelve a lanzar para que no quede escondido como "no encontrado".
export const ifNotFound = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
};

const extractErrorMessage = (data: unknown, status: number, path: string): string => {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // Forma típica de NestJS con validación (class-validator):
    // { statusCode: 400, message: ["campo X no debe estar vacío", ...], error: "Bad Request" }
    // El detalle útil está en "message" (a veces string, a veces array), y "error"
    // suele ser solo una etiqueta genérica del status ("Bad Request").
    if (Array.isArray(obj.message) && obj.message.length > 0) {
      return obj.message.map(String).join(" · ");
    }
    if (typeof obj.message === "string" && obj.message) return obj.message;
    if (typeof obj.error === "string" && obj.error) return obj.error;
  }
  if (typeof data === "string" && data) return data;
  return `Error ${status} al llamar ${path}`;
};

const safeJsonParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
