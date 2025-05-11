import type { FC } from "hono/jsx";

const StreamingInstructions: FC = () => {
  return (
    <>
      <h2 style={styles.h2}>Streaming</h2>
      <h4 style={styles.h4}>
        Please copy the link below and use
        <a href="/static/coreplayer.sis" style={styles.link}>
          <span> CorePlayer </span>
        </a>
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
};

const DownloadSection: FC<{ url: string }> = (props) => {
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
          <b>Quality: </b>
        </span>
        <span>360p</span>
      </div>
      <div style={styles.infoItem}>
        <span>
          <b>Format: </b>
        </span>
        <span>mp4</span>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <span>
          <b>Codecs: </b>
        </span>
        <span>avc1, mp4a</span>
      </div>
      <a href={props.url}>
        <button type="button" style={styles.downloadButton}>
          Download
        </button>
      </a>
    </div>
  );
};

const DetailPage: FC = (props) => {
  return (
    <main>
      <StreamingInstructions />
      <input style={styles.input} value={props.url} />
      <DownloadSection url={props.url} />
    </main>
  );
};

const styles = {
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
  },
  downloadSection: {
    margin: "32px 0px",
    fontSize: "14px",
  },
  downloadInfo: {
    marginBottom: "6px",
    fontSize: "1rem",
  },
  infoItem: {
    marginBottom: "4px",
  },
  downloadButton: {
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  downloadButtonHover: {
    backgroundColor: "#0056b3",
  },
};

export default DetailPage;
