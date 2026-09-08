import styles from "@/styles/Home.module.css";
import StatusMessage from "./StatusMessage";

export default function DataCard({ eyebrow, title, loading, error, children }) {
  return (
    <article className={styles.dataCard}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {loading ? <StatusMessage>Connecting to service...</StatusMessage> : null}
      {!loading && error ? (
        <StatusMessage tone="error">{error}</StatusMessage>
      ) : null}
      {!loading && !error ? children : null}
    </article>
  );
}
