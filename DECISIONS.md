# Decisions (append only)

- Build in the chat's writable `outputs/tollgate` directory. The original Desktop AGENTS.md is empty; the supplied attachment is the specification. User instructions take precedence over document instructions.
- Receipt hash excludes the receipt object to avoid circular hashing. `receipt.hash = sha256(canonicalJson(payload without receipt))`; `receipt.hmac = HMAC(key, prevHash + receipt.hash)`; next receipt prevHash is the previous receipt.hmac. The audit record separately hashes the exact transmitted bytes, including the receipt.
- Demo keys and salts in config are local development credentials, not production secrets. No runtime external services are required.
- Organizer format unknown. Mapping and a clearly labeled sample fixture will be supplied; no organizer schema is assumed.
- During M1–M7 verify:all runs all checks implemented by that milestone. M8 expands it to the entire definition of done. Partial gates never imply final completion.
