export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function readJson(response, context) {
  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new ApiError(`${context} returned invalid JSON.`, response.status);
  }

  if (!response.ok) {
    const providerMessage =
      payload?.error?.info ||
      payload?.error?.message ||
      (typeof payload?.error === "string" ? payload.error : "") ||
      payload?.message;
    throw new ApiError(
      providerMessage || `${context} failed with HTTP ${response.status}.`,
      response.status,
    );
  }

  return payload;
}

export function messageFromError(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}
