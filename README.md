<p align="center">
  <img src="https://github.com/fountain-ink/app/raw/main/public/logo.png" height="150" alt="Fountain Logo">
</p>

# Fountain

A batteries-included, self-hostable web3 alternative to Medium, Substack, and Mirror. Own your content and audience through decentralized publishing.

## Features

- **Own your content and audience** - Built on blockchain technology, no one can take it away
- **Automatic copyright** - All posts are timestamped and written to blockchain with your chosen license
- **Direct monetization** - Get rewarded directly by readers who enjoy your work
- **Seamless collaboration** - Write with friends by simply sharing a link
- **Decentralized** - Built on [Lens Protocol](https://lens.xyz) with zero vendor lock-in

## Tech Stack

The Fountain app is entirely self-hostable with the following tech stack:

- [Lens Protocol](https://lens.xyz/docs/protocol) - Decentralized social media protocol
- [Grove](https://lens.xyz/docs/storage) - Decentralized storage 
- [Next.js](https://nextjs.org/) - React framework for the frontend
- [Plate.js](https://platejs.org/) - Customizable editor framework
- [Y.js](https://yjs.dev/) - Collaborative sync layer for the editor
- [Supabase](https://supabase.io/) - Off-chain storage
- [Listmonk](https://listmonk.app/) - Mailing list manager

> **Note:** The Fountain app is still in early development, self-hosting documentation is coming soon.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.2.5 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/fountain-ink/app.git
cd app

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun run dev

# Run the collaboration server
bun run collab

# Run the notifications server (WIP)
bun run notifications
```

### Building for Production

```bash
# Build the application
bun run build

# Start the production server
bun run start
```

## Coming Soon

- Docs portal (Q1)
- Deployment SDKs (Q2)

## License

AGPLv3 - See [LICENSE](LICENSE) for more information.