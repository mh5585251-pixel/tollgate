# Organizer adapter

The JSONL fixture is a Tollgate example, not the organizer's schema. Change `config/organizer.mapping.json` to match the actual stream. Dot paths select source fields; metric names are Tollgate's enums. Invalid configured metrics or timestamps fail with an explicit error.

`OrganizerStreamAdapter.file(path)`, `.stdin()`, and `.sse(url, signal)` produce the same normalized Tier 1 event interface. Only the adapter performs organizer I/O. Detection and recommendation code perform no network requests. The collector will support `ORGANIZER_JSONL`, `ORGANIZER_STDIN=1`, or `ORGANIZER_SSE`; normal simulation remains the zero-config default.
