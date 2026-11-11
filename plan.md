# Bazaarly implementation plan

## Product approach
Bazaarly is a responsive Indian marketplace storefront for everyday purchases across cities. The demo prioritizes fast discovery, city-aware availability, a low-friction cart, and an order flow that makes the Aiven event journey visible without exposing credentials.

The application uses the initialized React/Express/tRPC/Drizzle project. The customer-facing page is implemented in React with local state for the demo catalog, cart, search, filters, login and checkout. Express exposes `/api/commerce/health` and `/api/commerce/orders` so the UI has a server-backed commerce seam. Aiven-ready connection flags are read only from environment variables (`AIVEN_POSTGRES_URL`, `AIVEN_KAFKA_BROKERS`, `AIVEN_OPENSEARCH_URL`, plus optional credentials); no secrets are committed. The demo remains usable when those variables are absent and presents the event trail as a deterministic showcase.

## Project structure
- `client/src/pages/Home.tsx`: responsive storefront, filters, product cards, cart drawer, login modal, checkout and event pipeline.
- `client/src/index.css`: Bazaarly visual system, responsive layout, marketplace surfaces and motion.
- `server/_core/index.ts`: Express health and commerce demo endpoints alongside the starter tRPC server.
- `public/manus-routes.json`: route manifest for `/` and `/404`.
- `plan.md`, `TODO.md`: approved design and delivery outcomes.

## Design direction

### Style candidates
- **Indicative probability 0.07:** Neo-bazaar editorial — warm paper, cobalt, saffron, product-led storytelling.
- **Indicative probability 0.05:** Monsoon utility — indigo utility surfaces, high-contrast lime and weathered textures.
- **Indicative probability 0.04:** Soft premium catalog — pale stone, ink, and polished copper with quieter cards.

### Chosen style: Neo-bazaar editorial

**Design Movement:** Contemporary Indian marketplace editorial with the energy of a street-side bazaar translated into a clean digital catalog.

**Core Principles:** Make discovery feel immediate; keep commerce states legible; use bright accents as wayfinding; let product photography carry the emotion.

**Color Philosophy:** Deep ink-blue is the reliable anchor; saffron yellow supplies optimism and recognition; a small mint-green signal is reserved for healthy inventory and delivery moments; pale blue-gray creates breathing room around dense shopping information.

**Layout Paradigm:** A wide utility header leads into a split editorial hero, followed by an asymmetric content rail: persistent filters on the left and a wide product canvas on the right. Modals and drawers keep shopping context visible instead of replacing the page.

**Signature Elements:** A tiny saffron orbit around the B mark; pill-shaped city and service indicators; an event pipeline rendered as a compact sequence of connected nodes after checkout.

**Interaction Philosophy:** Every action should give an immediate, human-readable response: buttons become confirmation states, filters update count labels, stock is visible before cart, and checkout explains what the platform is doing.

**Animation:** Use 180–260ms ease-out transitions; cards lift 2px on hover; the hero has a slow floating product-card drift; pipeline nodes reveal in sequence; avoid continuous motion in content-dense areas.

**Typography System:** Use the browser-safe `Inter`/`ui-sans-serif` stack for clarity, with large compact display weights for headings and tight uppercase micro-labels for service/status metadata.

**Brand Essence:** Everyday India, delivered with more care — useful, optimistic, dependable. Personality: bright, thoughtful, grounded.

**Brand Voice:** Direct, warm, and lightly conversational. Example lines: “The good stuff, delivered.” and “Picked for your city, ready when you are.”

**Wordmark & Logo:** Lowercase `bazaarly` with a saffron orbit dot on the B-like mark; the wordmark is paired with a small “everyday India” descriptor.

**Signature Brand Color:** `#1749C4`, a confident cobalt called Bazaar Blue.

## Data and service story
The product card model carries city-level stock and search metadata. Checkout sends the cart to Express, which returns an order id, an order-placed event id, and the visible downstream steps: PostgreSQL order persistence, Kafka event emission, inventory consumer update, and OpenSearch index sync. When Aiven env vars are configured, the same seam can be extended with real clients; when not configured, the demo is explicit that it is running in showcase mode.
