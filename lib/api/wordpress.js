import { GraphQLClient, gql } from "graphql-request";
import { ApiError, readJson } from "./http.js";

export const DEFAULT_WORDPRESS_URL = "http://wp-headless-test.local";

const WORDPRESS_CONTENT_QUERY = gql`
  query GetHeadlessHome {
    generalSettings {
      title
      description
    }
    posts(first: 100) {
      nodes {
        id
        title
        date
      }
    }
  }
`;

export function getWordPressUrl() {
  return (
    process.env.NEXT_PUBLIC_WORDPRESS_URL || DEFAULT_WORDPRESS_URL
  ).replace(/\/$/, "");
}

export function normalizeWordPressContent(payload) {
  const nodes = payload?.posts?.nodes;

  if (!Array.isArray(nodes)) {
    throw new ApiError("WordPress returned an invalid posts collection.", 502);
  }

  const posts = nodes
    .filter(
      (post) =>
        post &&
        typeof post.id === "string" &&
        typeof post.title === "string" &&
        typeof post.date === "string",
    )
    .map((post) => ({
      id: post.id,
      title: post.title.trim() || "Untitled post",
      date: post.date,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    posts,
    settings: {
      title: payload?.generalSettings?.title || "WordPress Headless Demo",
      description:
        payload?.generalSettings?.description ||
        "Recent posts supplied by WPGraphQL.",
    },
  };
}

export async function fetchWordPressContent() {
  const client = new GraphQLClient(`${getWordPressUrl()}/graphql`);

  try {
    const payload = await client.request(WORDPRESS_CONTENT_QUERY);
    return normalizeWordPressContent(payload);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "Could not load posts from WordPress. Confirm Local and WPGraphQL are running.",
      503,
    );
  }
}

export function extractCurrency(payload) {
  const currency =
    payload?.currency ||
    payload?.settings?.currency ||
    payload?.data?.currency ||
    payload?.edd_currency;

  if (typeof currency !== "string" || currency.trim().length !== 3) {
    throw new ApiError("EDD returned an invalid currency setting.", 502);
  }

  return currency.trim().toUpperCase();
}

async function requestWordPress(path, options, context) {
  try {
    const response = await fetch(`${getWordPressUrl()}${path}`, options);
    return await readJson(response, context);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      `${context} could not reach WordPress. Confirm the Local site is running.`,
      503,
    );
  }
}

export async function fetchStoreCurrency() {
  const payload = await requestWordPress(
    "/wp-json/edd/v1/settings",
    { headers: { Accept: "application/json" } },
    "EDD settings",
  );
  return extractCurrency(payload);
}

export async function submitName(name) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new ApiError("Enter a name before submitting.", 400);
  }

  const payload = await requestWordPress(
    "/wp-json/custom/v1/submit-name",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: normalizedName }),
    },
    "Name submission",
  );

  if (payload?.message !== "Saved" || typeof payload?.reversed !== "string") {
    throw new ApiError("WordPress returned an invalid name response.", 502);
  }

  return payload.reversed;
}

export async function fetchStoredName() {
  const payload = await requestWordPress(
    "/wp-json/custom/v1/get-name",
    { headers: { Accept: "application/json" } },
    "Stored name retrieval",
  );

  if (typeof payload?.reversed_name !== "string") {
    throw new ApiError("WordPress returned an invalid stored name.", 502);
  }

  return payload.reversed_name;
}
