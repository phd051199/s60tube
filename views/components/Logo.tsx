import { type FC, memo } from "hono/jsx";

const Logo: FC = memo(() => {
  return (
    <h1 style={styles.titleContainer}>
      <span style={styles.logoSpan}>S60</span>
      <span style={styles.textSpan}>Tube</span>
    </h1>
  );
});

const styles = {
  titleContainer: {
    position: "relative",
    width: "fit-content",
    textAlign: "center",
    marginTop: "12px",
    fontSize: "24px",
  },
  logoSpan: {
    backgroundColor: "#dd2c00",
    color: "#fff",
    padding: "1px 4px",
    marginRight: "2px",
  },
  textSpan: {
    color: "black",
  },
};

export default Logo;
