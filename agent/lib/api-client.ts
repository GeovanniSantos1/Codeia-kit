function getAgentApiBaseUrl(): string {
  const explicit = process.env.AGENT_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) return appUrl.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:5000";
}

export async function agentFetch(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<unknown> {
  const secret = process.env.AGENT_INTERNAL_SECRET?.trim();
  if (!secret) {
    throw new Error("AGENT_INTERNAL_SECRET não configurado.");
  }

  const url = new URL(path, `${getAgentApiBaseUrl()}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha na API interna (${response.status}): ${body}`);
  }

  return response.json();
}
