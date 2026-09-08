import styles from "@/styles/Home.module.css";

export default function ToggleButton({ showAll, total, onToggle }) {
  const disabled = total <= 3;

  return (
    <button
      className={styles.secondaryButton}
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={showAll}
    >
      {showAll ? "Show 3 most recent" : `Show all ${total} posts`}
    </button>
  );
}
