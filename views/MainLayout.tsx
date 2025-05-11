import { jsxRenderer } from "hono/jsx-renderer";

const styles = {
  body: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f0f0f0",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0.5rem",
  },
};

export default jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="shortcut icon" href="https://hono.dev/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Bringing YouTube back to Nokia S60 Devices"
        />
        <meta name="keywords" content="S60 Tube" />
        <meta property="og:title" content="S60 Tube" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://hono.dev/favicon.ico" />
        <meta
          property="og:description"
          content="Bringing YouTube back to Nokia S60 Devices"
        />
        <title>S60 Tube</title>
      </head>

      <body style={styles.body}>{children}</body>
    </html>
  );
});
