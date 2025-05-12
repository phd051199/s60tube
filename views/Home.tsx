import { type FC, memo } from "hono/jsx";
import Logo from "./components/Logo.tsx";

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
        <Logo />
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
};

export default HomePage;
