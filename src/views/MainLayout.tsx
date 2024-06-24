import type { FC } from 'hono/jsx';

const Layout: FC = (props) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>S60 Tube - {props.title}</title>
      </head>

      <body style={styles.body}>{props.children}</body>
    </html>
  );
};

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0.5rem'
  }
};

export default Layout;
