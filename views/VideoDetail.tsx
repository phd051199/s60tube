import { type FC, memo } from "hono/jsx";

const StreamingInstructions: FC = memo(() => {
  return (
    <>
      <h2 style={styles.h2}>Streaming</h2>
      <h4 style={styles.h4}>
        Please copy the link below and use{" "}
        <a
          href="https://dph.io.vn/static/coreplayer.sis"
          style={styles.link}
        >
          <span>CorePlayer</span>
        </a>{" "}
        to play it.
      </h4>
      <p style={styles.instructionText}>
        (Open <b>CorePlayer</b>
        {" > "}
        <u>Menu</u>
        {" > "}
        <u>Open URL...</u>
        {" > "}
        Paste link)
      </p>
    </>
  );
});

const DownloadSection: FC<{ url: string; format: any }> = memo((props) => {
  return (
    <div style={styles.downloadSection}>
      <h2 style={styles.h2}>Download</h2>
      <div style={styles.downloadInfo}>
        <span>
          <b>File information</b>
        </span>
      </div>

      <div style={styles.infoItem}>
        <span>
          <b>Quality:</b>
          {" "}
        </span>
        <span>
          {props.format.quality_label}
          {props.format.fps || ""}
        </span>
      </div>

      <div style={styles.infoItem}>
        <span>
          <b>MIME:</b>
          {" "}
        </span>
        <span>{props.format.mime_type}</span>
      </div>

      <a href={props.url} style={styles.downloadLink}>
        Download
      </a>
    </div>
  );
});

const DetailPage: FC<{ url: string; format: any }> = memo((props) => {
  return (
    <main style={styles.container}>
      <div style={styles.content}>
        <StreamingInstructions />
        <input
          style={styles.input}
          value={props.url}
          onClick={(e) => {
            const target = e.currentTarget as any;
            target.select();
            console.log("User clicked to copy URL");
          }}
        />
        <DownloadSection url={props.url} format={props.format} />
      </div>
    </main>
  );
});

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "0 4px",
  },
  content: {
    width: "100%",
    maxWidth: "600px",
  },
  h2: {
    fontSize: "2rem",
    margin: "12px 0px",
  },
  h4: {
    margin: "4px 0px",
    fontSize: "1rem",
  },
  link: {
    color: "#0000EE",
    textDecoration: "none",
  },
  instructionText: {
    fontSize: "14px",
    margin: "8px 0px",
  },
  input: {
    width: "100%",
    marginTop: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",
    padding: "8px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  downloadSection: {
    margin: "16px 0px",
    fontSize: "14px",
  },
  downloadInfo: {
    marginBottom: "6px",
    fontSize: "1rem",
  },
  infoItem: {
    marginBottom: "6px",
  },
  downloadLink: {
    marginTop: "12px",
    display: "inline-block",
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "#007bff",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
  },
};

export default DetailPage;
