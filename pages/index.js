import Head from "next/head";
import { useEffect, useState } from "react";
import DataCard from "@/components/DataCard";
import NameForm from "@/components/NameForm";
import PostList from "@/components/PostList";
import StatusMessage from "@/components/StatusMessage";
import ToggleButton from "@/components/ToggleButton";
import { fetchExchangeRateFromApp } from "@/lib/api/browser";
import { messageFromError } from "@/lib/api/http";
import {
  fetchStoreCurrency,
  fetchWordPressContent,
} from "@/lib/api/wordpress";
import styles from "@/styles/Home.module.css";

const initialRequestState = { loading: true, data: null, error: "" };

export default function Home() {
  const [content, setContent] = useState(initialRequestState);
  const [currency, setCurrency] = useState(initialRequestState);
  const [exchangeRate, setExchangeRate] = useState(initialRequestState);
  const [showAllPosts, setShowAllPosts] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const data = await fetchWordPressContent();
        if (active) setContent({ loading: false, data, error: "" });
      } catch (error) {
        if (active) {
          setContent({
            loading: false,
            data: null,
            error: messageFromError(error, "WordPress content is unavailable."),
          });
        }
      }
    }

    async function loadCurrency() {
      try {
        const data = await fetchStoreCurrency();
        if (active) setCurrency({ loading: false, data, error: "" });
      } catch (error) {
        if (active) {
          setCurrency({
            loading: false,
            data: null,
            error: messageFromError(error, "Store currency is unavailable."),
          });
        }
      }
    }

    async function loadExchangeRate() {
      try {
        const data = await fetchExchangeRateFromApp();
        if (active) setExchangeRate({ loading: false, data, error: "" });
      } catch (error) {
        if (active) {
          setExchangeRate({
            loading: false,
            data: null,
            error: messageFromError(error, "Exchange rate is unavailable."),
          });
        }
      }
    }

    loadContent();
    loadCurrency();
    loadExchangeRate();

    return () => {
      active = false;
    };
  }, []);

  const posts = content.data?.posts || [];
  const visiblePosts = showAllPosts ? posts : posts.slice(0, 3);
  const siteSettings = content.data?.settings;

  return (
    <>
      <Head>
        <title>Bema Headless Hub</title>
        <meta
          name="description"
          content="A Next.js headless WordPress integration for the Bema developer skills test."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.page}>
        <header className={styles.hero}>
          <nav className={styles.nav} aria-label="Project identity">
            <a className={styles.brand} href="#top" aria-label="Bema Headless Hub home">
              <span>B</span>
              <strong>Bema Headless Hub</strong>
            </a>
            <span className={styles.liveBadge}>
              <i /> WordPress + Next.js
            </span>
          </nav>

          <div className={styles.heroCopy} id="top">
            <p className={styles.eyebrow}>Software Developer Skills Test</p>
            <h1>One clean view of your headless content stack.</h1>
            <p className={styles.heroDescription}>
              GraphQL posts, EDD configuration, live currency data, and a custom
              WordPress workflow—composed in a resilient Next.js interface.
            </p>
            <div className={styles.stackList} aria-label="Technology stack">
              <span>Next.js 16</span>
              <span>WPGraphQL</span>
              <span>REST APIs</span>
            </div>
          </div>
        </header>

        <section className={styles.contentGrid} aria-label="Connected service data">
          <DataCard
            eyebrow="EDD REST"
            title="Store currency"
            loading={currency.loading}
            error={currency.error}
          >
            <p className={styles.metric}>{currency.data}</p>
            <p className={styles.cardNote}>Configured in Easy Digital Downloads</p>
          </DataCard>

          <DataCard
            eyebrow="External REST"
            title="NGN → USD"
            loading={exchangeRate.loading}
            error={exchangeRate.error}
          >
            <p className={styles.metric}>
              ${Number(exchangeRate.data?.rate).toFixed(6)}
            </p>
            <p className={styles.cardNote}>
              1 {exchangeRate.data?.base} · {exchangeRate.data?.date || "Latest rate"}
            </p>
          </DataCard>
        </section>

        <section className={styles.panel} aria-labelledby="posts-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>WPGraphQL feed</p>
              <h2 id="posts-title">{siteSettings?.title || "Recent posts"}</h2>
              {siteSettings?.description ? <p>{siteSettings.description}</p> : null}
            </div>
            {!content.loading && !content.error ? (
              <ToggleButton
                showAll={showAllPosts}
                total={posts.length}
                onToggle={() => setShowAllPosts((current) => !current)}
              />
            ) : null}
          </div>

          {content.loading ? <StatusMessage>Loading WordPress posts...</StatusMessage> : null}
          {!content.loading && content.error ? (
            <StatusMessage tone="error">{content.error}</StatusMessage>
          ) : null}
          {!content.loading && !content.error ? <PostList posts={visiblePosts} /> : null}
        </section>

        <NameForm />

        <footer className={styles.footer}>
          <span>Bema Integrated Services Ltd</span>
          <span>Headless CMS assessment · 2026</span>
        </footer>
      </main>
    </>
  );
}
