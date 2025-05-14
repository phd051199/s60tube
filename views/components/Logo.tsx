import { type FC, memo } from "hono/jsx";

const Logo: FC = memo(({ center = true, large = true }) => {
  return (
    <h1
      style={{
        ...styles.titleContainer,
        textAlign: center ? "center" : "left",
        fontSize: large ? "36px" : "24px",
        marginTop: large ? "24px" : "12px",
      }}
    >
      <span style={styles.logoSpan}>S60</span>
      <span style={styles.textSpan}>Tube</span>
    </h1>
  );
});

const styles = {
  titleContainer: {
    position: "relative",
    width: "fit-content",
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
