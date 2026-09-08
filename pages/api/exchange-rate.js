import { fetchExchangeRate } from "@/lib/api/exchangeRate";
import { messageFromError } from "@/lib/api/http";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  try {
    const rate = await fetchExchangeRate();
    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json(rate);
  } catch (error) {
    return response.status(502).json({
      error: messageFromError(
        error,
        "The NGN to USD exchange rate is unavailable.",
      ),
    });
  }
}
