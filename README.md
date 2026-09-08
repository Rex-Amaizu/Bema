# Bema Headless Hub

A JavaScript Next.js Pages Router application that reads content from a local WordPress installation through WPGraphQL and REST. It loads the complete post list once, displays the three newest posts by default, toggles to all loaded posts without refetching, displays the Easy Digital Downloads currency, fetches the current NGN-to-USD rate, and exercises a custom WordPress POST-to-GET name workflow.

## Prerequisites

- Node.js 20.9 or newer (developed with Node.js 24.15.0)
- npm
- Local by Flywheel
- A Local site named `wp-headless-test`
- WPGraphQL and Easy Digital Downloads installed and active
- An optional exchangerate.host API key if the provider rejects anonymous requests

## WordPress setup

1. Install and open Local by Flywheel.
2. Create a site named `wp-headless-test` and start it. The expected default URL is `http://wp-headless-test.local`.
3. In WordPress Admin, open **Plugins > Add New**. Install and activate **WPGraphQL** and **Easy Digital Downloads**.
4. Open **Downloads > Settings > General > Currency**, select **Nigerian Naira (NGN)**, and save.
5. Open **Posts > Add New** and publish at least three posts, for example:
   - Building reliable headless experiences
   - Designing resilient API boundaries
   - Automating the content lifecycle
6. Copy the contents of `wordpress/functions.php-snippet.php` into the active theme's `functions.php`. The snippet contains the assessment's two custom routes plus the documented EDD compatibility route.
7. Open **Settings > Permalinks** and click **Save Changes** once so all REST routes are refreshed.

The assessment requires `GET /wp-json/edd/v1/settings`, but current EDD documentation describes its separate `/edd-api/` interface and does not expose that settings path consistently. The included compatibility route keeps the assessment's exact URL and reads the currency using `edd_get_currency()` when EDD is active.

The custom routes use public permission callbacks because that is the supplied assessment contract. They are appropriate only for this isolated local test. A production version must authenticate callers, authorize writes, validate stricter limits, and add abuse protection.

## Install and run

```bash
npm install
copy .env.example .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

Environment variables:

```dotenv
NEXT_PUBLIC_WORDPRESS_URL=http://wp-headless-test.local
EXCHANGE_RATE_API_KEY=
```

`NEXT_PUBLIC_WORDPRESS_URL` is intentionally public because the browser calls the public local WordPress APIs. `EXCHANGE_RATE_API_KEY` is optional and server-only: the browser calls `/api/exchange-rate`, whose thin API route delegates to `lib/api/exchangeRate.js`. Never commit `.env.local` or real credentials.

## How the application works

- `pages/index.js` owns page composition and local request/UI state. Its mount effect starts three independent loaders so one unavailable service does not hide successful data from another.
- `lib/api/wordpress.js` uses `graphql-request` for the WPGraphQL request and provides the EDD and custom REST clients.
- `lib/api/exchangeRate.js` validates and normalizes the external provider response. It is reused by both `pages/api/exchange-rate.js` and the standalone `exchange-rate.js` script.
- `lib/types/index.js` documents the JavaScript response contracts with JSDoc.
- `components/` contains the reusable list, toggle, data-card, status, and form UI.
- The full post array is stored in component state. The toggle only chooses between `posts.slice(0, 3)` and the existing array; it does not call an API.

## Test and verify

Run automated checks:

```bash
npm test
npm run lint
npm run build
```

Run the standalone exchange-rate script:

```bash
node exchange-rate.js
```

If exchangerate.host requires authentication, put `EXCHANGE_RATE_API_KEY` in `.env.local` for Next.js. For the standalone PowerShell session, set it only for that process before running the script.

Verify WordPress directly in PowerShell:

```powershell
$site = 'http://wp-headless-test.local'

$graphBody = @{
  query = '{ generalSettings { title description } posts(first: 100) { nodes { id title date } } }'
} | ConvertTo-Json

Invoke-RestMethod "$site/graphql" -Method Post -ContentType 'application/json' -Body $graphBody
Invoke-RestMethod "$site/wp-json/edd/v1/settings"
Invoke-RestMethod "$site/wp-json/custom/v1/submit-name" -Method Post -ContentType 'application/json' -Body '{"name":"Eko"}'
Invoke-RestMethod "$site/wp-json/custom/v1/get-name"
```

The final GET must return `{"reversed_name":"okE"}`. In the browser, open DevTools > Network, clear the log, toggle between three and all posts, and confirm no new `/graphql` request is made. Also stop the Local site temporarily and confirm that WordPress errors are shown while the exchange-rate section continues independently.

### Verification record

- Live Local site: `wp-headless-test.local`, WordPress 7.1, WPGraphQL 2.22.2, and Easy Digital Downloads 3.7.0 are active.
- Five published posts are seeded in the live site so the default three-post view and no-refetch all-posts toggle are both observable.
- Direct GraphQL, EDD settings, custom POST, and custom GET requests were run successfully; the name acceptance case returned `okE` and the currency returned `NGN`.
- The toggle was exercised after stopping WordPress; all five already-loaded posts remained available, proving the toggle does not refetch.
- WordPress downtime was tested and produced focused posts/currency errors without hiding the independent sections.
- `npm test` (7 passing), `npm run lint`, and `npm run build` completed successfully. Desktop and 390px mobile layouts were visually inspected; the mobile document had no horizontal overflow.
- The live exchangerate.host request currently returns an access-key-required response. The exact required URL is retained, the optional server-only key is supported, and the UI safely shows the provider failure until a key is supplied.

## Architecture & Reasoning

1. **Why is the project organized this way?**
   - `lib/api/` isolates transport, endpoint, parsing, and error concerns from React rendering.
   - `lib/types/` makes external data contracts visible in a JavaScript project.
   - `components/` keeps recurring UI and states reusable and independently understandable.
   - `pages/` composes those capabilities into public pages and thin server routes.

2. **Where does state live, and why?**
   - API results, errors, loading status, and the post-toggle flag live locally in `pages/index.js` because only that page consumes them.
   - Name form input and submission state live inside `NameForm`, which is the smallest owner of that interaction.
   - Global state would add indirection without solving a current sharing problem. If multiple pages needed the same server data, a query cache such as SWR or TanStack Query would become appropriate.

3. **What would break at 10+ API calls, and how would it be mitigated?**
   - More mount-time requests would increase latency, duplicated retry/loading code, rate-limit pressure, and inconsistent cache freshness.
   - I would add a query/cache layer with deduplication, request cancellation, retry policy, stale-while-revalidate behavior, and shared observability.
   - I would group related WordPress fields into efficient GraphQL queries, paginate large connections, set timeouts, and keep each service adapter modular.

4. **What happens if WordPress goes down?**
   - The posts, EDD currency, and custom-name workflows report focused errors instead of throwing an unhandled render error.
   - The exchange-rate request is independent and can still succeed.
   - A production deployment could add cached last-known content, server health checks, an error boundary for unexpected render failures, and monitoring for upstream availability.

5. **What could n8n automate?**
   - New-post publication, editorial approval, content synchronization, cache invalidation, link checks, and Slack notifications are good event-driven candidates.
   - WordPress would send a signed webhook containing the post ID and status. n8n would verify the signature, fetch the canonical post, filter for newly published content, format the notification, post to Slack, and record the result with retries and an error workflow.

6. **How was AI used, and what was manually verified?**
   - AI assisted with interpreting the supplied assessment, drafting the application structure, writing tests, and handling most wordpress related integrations.
   - The implementation is manually checked with Node tests, ESLint, a production Next.js build, direct endpoint requests, and browser interaction. Any check that cannot run because Local, WordPress, or an external key is unavailable is reported as unverified rather than implied to have passed.

## n8n automation outline

On publication, a small WordPress hook would send a signed POST to an n8n Webhook node with the post ID, URL, title, status, and publication timestamp. The workflow would verify an HMAC signature, reject any event whose status is not `publish`, retrieve the canonical post through WordPress, and use a deterministic event ID such as `post:{id}:published:{timestamp}` to prevent duplicate notifications.

n8n would format a concise Slack message and send it through the Slack node. Transient WordPress or Slack errors would retry with exponential backoff; exhausted attempts would enter an error workflow that records the payload and alerts an operations channel. Secrets would live in n8n credentials, not in WordPress source or the Next.js client.

## Issues and assumptions

- The local WordPress hostname defaults to `wp-headless-test.local`; change `NEXT_PUBLIC_WORDPRESS_URL` if Local assigns another URL.
- WPGraphQL must allow the Next.js development origin. If the browser reports a CORS failure, configure the local WordPress development origin rather than disabling browser security.
- The GraphQL query requests the first 100 published posts, which is sufficient for this exercise. A production implementation should use cursor pagination to retrieve an unbounded collection.
- The provided exchangerate.host URL may return an access-key error under the provider's current service policy. The exact endpoint is retained, an optional key is supported, and provider failures are displayed safely.
- The EDD settings route is an assessment compatibility shim around the plugin's live currency value.
