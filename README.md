<p align="center">
<img alt="Fountain Banner" src="https://github.com/user-attachments/assets/aff1445f-25db-4f2b-9cc0-be1a9312df55" />
</p>

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

## Coming Soon

- Docs portal (Q2)
- Deployment SDKs (Q2)

## Getting Started

### Installation
- Using [Bun](https://bun.sh/) (v1.2.5 or higher)

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

## License

AGPLv3 - See [LICENSE](LICENSE) for more information.
