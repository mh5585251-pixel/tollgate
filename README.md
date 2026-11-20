# Tollgate

Secure two-tier AIOps observability for a local hackathon demonstration. Raw telemetry stays in collector processes; SaaS accepts strict structured metadata only.

Implementation is in progress. See DECISIONS.md for documented interpretation choices. Final verification evidence and any remaining gaps will be recorded in VERIFICATION.md.

## Intended quick start

Requires Node 20.9+ and npm. Run from this directory:

```
npm install
npm run dev
```

Open http://localhost:3000/command-center. Two local collector consoles use ports 4001 and 4002. Regional stores are simulated on one machine; authentication is demo-only.
