export class FetchError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type Envelope<T> = { data: T } | { error: { message: string; fieldErrors?: Record<string, string[]> } };

async function unwrap<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const body = (await res.json().catch(() => null)) as Envelope<T> | null;

  if (!res.ok) {
    const message = body && "error" in body ? body.error.message : "Request failed";
    const fieldErrors = body && "error" in body ? body.error.fieldErrors : undefined;
    throw new FetchError(message, res.status, fieldErrors);
  }

  if (!body || !("data" in body)) {
    throw new FetchError("Unexpected response shape", res.status);
  }

  return body.data;
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return unwrap<T>(res);
}

export async function apiSend<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return unwrap<T>(res);
}
