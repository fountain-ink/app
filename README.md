<p align="center">
<img alt="Fountain Banner" width="700px" src="https://github.com/user-attachments/assets/f6fe2688-6f64-4db6-aa01-a6dad326742b" />
<h3 align="center">A batteries-included, self-hostable web3 alternative to Medium, Substack, and Mirror. </h3>
<h4 align="center">Own your content and audience through decentralized publishing</h4>


</p>

## Stack

The Fountain app is entirely self-hostable and built using the following tools:

- [Lens Protocol](https://lens.xyz/docs/protocol) - Decentralized social protocol
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
