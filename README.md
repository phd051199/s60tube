# S60Tube

A YouTube Viewer built with Deno and Hono.

## Development

```bash
# Run locally
deno task dev

# Start production server
deno task start
```

## Deployment to Deno Deploy

When deploying to Deno Deploy, you need to set environment variables in the Deno
Deploy dashboard:

1. Go to your project on [dash.deno.com](https://dash.deno.com)
2. Navigate to Settings > Environment Variables
3. Add each variable from your `.env` file
4. Deploy with environment variables:

```bash
deno task deploy
```

The application will automatically detect whether it's running locally or on
Deno Deploy and load the environment variables accordingly.
