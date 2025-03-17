# SNS -> Listmonk Notification Server

> [!CAUTION]
> Work in progress, this is not currently used in production.

This server handles Amazon SNS notifications when new posts are published in a subscribed group. When a notification is received, the server creates and sends email campaigns via Listmonk to all newsletter subscribers of the corresponding blog.

## Features

- Handles AWS SNS subscription confirmation
- Processes PostCreated notifications
- Creates email campaigns in Listmonk for new posts
- Automatically sends campaigns to newsletter subscribers

## Getting Started

### Prerequisites

- Node.js v18+ and npm
- Listmonk server set up and configured
- Access to the necessary API with appropriate permissions

### Environment Variables

The server requires the following environment variables:

```
# Listmonk API configuration
LISTMONK_API_URL=http://localhost:9000/api
LISTMONK_API_USERNAME=admin
LISTMONK_API_TOKEN=your_listmonk_token

# SNS Webhook configuration
WEBHOOK_URL=https://your-api-domain.com/notifications
PORT=8080
```

### Running the Server

Start the server using the provided npm script:

```bash
npm run notification-server
```

This will start the Express server on the configured port (default: 8080).

## API Endpoints

### `POST /notifications`

Handles SNS notifications. This endpoint should be publicly accessible to AWS SNS.

### `POST /api/subscribe`

Subscribes a blog to SNS notifications for a specific group address.

Request body:
```json
{
  "blogHandle": "blog-handle",
  "webhookUrl": "https://your-api-domain.com/notifications"
}
```

### `GET /health`

Health check endpoint that returns status 200 if the server is running.

## Using the Next.js API

You can also use the provided Next.js API route to subscribe a blog to SNS notifications:

```
POST /api/newsletter/[blog]/subscribe-sns
```

Where `[blog]` is the blog handle or address.

## Architecture

1. A blog subscribes to SNS notifications via the API
2. The notification source sends SNS notifications to the webhook endpoint when a new post is published
3. The server processes the notification and extracts post information
4. The server creates a campaign in Listmonk targeting the blog's mailing list
5. The campaign is sent to all newsletter subscribers

## Development

To run the server in development mode:

```bash
npm run notification-server
``` 