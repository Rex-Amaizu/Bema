import styles from "@/styles/Home.module.css";

export default function StatusMessage({ tone = "info", children }) {
  return (
    <p className={`${styles.status} ${styles[`status-${tone}`]}`} role="status">
      {children}
    </p>
  );
}
