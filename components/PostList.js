import styles from "@/styles/Home.module.css";

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function PostList({ posts }) {
  if (posts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span>00</span>
        <p>No published posts were returned by WordPress.</p>
      </div>
    );
  }

  return (
    <ol className={styles.postList}>
      {posts.map((post, index) => {
        const date = new Date(post.date);
        const formattedDate = Number.isNaN(date.getTime())
          ? "Date unavailable"
          : dateFormatter.format(date);

        return (
          <li className={styles.postItem} key={post.id}>
            <span className={styles.postIndex}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{post.title}</h3>
              <time dateTime={post.date}>{formattedDate}</time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
