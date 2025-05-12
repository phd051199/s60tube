import { jsxRenderer } from "hono/jsx-renderer";

const styles = {
  body: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0.2rem",
  },
};

export default jsxRenderer(
  ({ children }) => {
    return (
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="shortcut icon" href="https://hono.dev/favicon.ico" />

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
          <style>
            {`
              a { text-decoration: none; }
              table { border-collapse: collapse; }
            `}
          </style>
        </head>
        <body style={styles.body}>{children}</body>
      </html>
    );
  },
  {
    docType:
      `<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.0//EN" "http://www.wapforum.org/DTD/xhtml-mobile10.dtd">`,
  },
);
