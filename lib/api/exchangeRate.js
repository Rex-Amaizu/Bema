import { ApiError, readJson } from "./http.js";

export const EXCHANGE_RATE_ENDPOINT =
  "https://api.exchangerate.host/latest?base=NGN&symbols=USD";

export function normalizeExchangeRate(payload) {
  if (payload?.success === false || payload?.error) {
    const providerMessage =
      payload?.error?.info || payload?.error?.message || payload?.message;
    throw new ApiError(providerMessage || "The rate provider rejected the request.", 502);
  }

  const rate = Number(payload?.rates?.USD);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new ApiError("The rate provider returned an invalid NGN to USD rate.", 502);
  }

  return {
    base: typeof payload?.base === "string" ? payload.base : "NGN",
    target: "USD",
    rate,
    date: typeof payload?.date === "string" ? payload.date : null,
  };
}

export async function fetchExchangeRate({
  apiKey = process.env.EXCHANGE_RATE_API_KEY,
  fetchImpl = fetch,
} = {}) {
  const url = new URL(EXCHANGE_RATE_ENDPOINT);

  if (apiKey) {
    url.searchParams.set("access_key", apiKey);
  }

  const response = await fetchImpl(url, {
    headers: { Accept: "application/json" },
  });
  const payload = await readJson(response, "Exchange-rate provider");
  return normalizeExchangeRate(payload);
}
