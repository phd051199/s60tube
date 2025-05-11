import { memo, type FC } from "hono/jsx";

const HomePage: FC = memo(() => {
  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={styles.titleContainer}>
          <span style={styles.logoSpan}>S60</span>
          <span>Tube</span>
          <div style={styles.versionDiv}>VN</div>
        </h1>
      </div>

      <form
        action="/search"
        method="get"
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <input
          id="inputField"
          className="input-field"
          name="q"
          style={styles.inputField}
          placeholder="Search Youtube"
        />
        <button
          type="submit"
          className="submit-button"
          style={styles.submitButton}
        >
          Search
        </button>
      </form>
    </main>
  );
});

const styles = {
  inputField: {
    width: "79%",
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
  },
  submitButton: {
    display: "block",
    width: "20%",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#606060",
    border: "none",
    cursor: "pointer",
  },
  submitButtonHover: {
    backgroundColor: "#0056b3",
  },
  titleContainer: {
    position: "relative",
    width: "fit-content",
    textAlign: "center",
    marginTop: "20px",
  },
  logoSpan: {
    backgroundColor: "#dd2c00",
    color: "#fff",
    padding: "2px 6px",
    marginRight: "2px",
  },
  versionDiv: {
    position: "absolute",
    right: -20,
    top: 0,
    color: "#606060",
    fontSize: "12px",
  },
};

export default HomePage;
