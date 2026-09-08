import { useState } from "react";
import { fetchStoredName, submitName } from "@/lib/api/wordpress";
import { messageFromError } from "@/lib/api/http";
import styles from "@/styles/Home.module.css";

export default function NameForm() {
  const [name, setName] = useState("Eko");
  const [reversedName, setReversedName] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setReversedName("");

    try {
      await submitName(name);
      const storedName = await fetchStoredName();
      setReversedName(storedName);
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(
        messageFromError(
          requestError,
          "The name could not be submitted and retrieved.",
        ),
      );
    }
  }

  return (
    <article className={`${styles.panel} ${styles.namePanel}`}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Custom REST workflow</p>
          <h2>Reverse and store a name</h2>
        </div>
        <span className={styles.stepLabel}>POST → GET</span>
      </div>

      <form className={styles.nameForm} onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <div className={styles.formRow}>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter a name"
            autoComplete="name"
            maxLength={80}
            disabled={status === "loading"}
          />
          <button
            className={styles.primaryButton}
            type="submit"
            disabled={status === "loading" || !name.trim()}
          >
            {status === "loading" ? "Working..." : "Submit name"}
          </button>
        </div>
      </form>

      <div className={styles.nameResult} aria-live="polite">
        {status === "idle" ? (
          <p>Try the assessment example: Eko becomes okE.</p>
        ) : null}
        {status === "success" ? (
          <>
            <span>Stored response</span>
            <strong>{reversedName || "Empty value"}</strong>
          </>
        ) : null}
        {status === "error" ? <p className={styles.inlineError}>{error}</p> : null}
      </div>
    </article>
  );
}
