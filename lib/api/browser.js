import { readJson } from "./http.js";

export async function fetchExchangeRateFromApp() {
  const response = await fetch("/api/exchange-rate", {
    headers: { Accept: "application/json" },
  });
  return readJson(response, "Exchange-rate service");
}
