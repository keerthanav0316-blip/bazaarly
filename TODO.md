# Bazaarly delivery outcomes

## Responsive Indian marketplace storefront
- [ ] Customers can browse a product catalog with prices, ratings, badges, city context and current stock messaging.
- [ ] The storefront has a customer-first blue-and-yellow identity and an original marketplace interaction pattern.
- [ ] The experience is usable on narrow mobile widths as well as desktop widths.

## Product discovery backed by search behavior
- [ ] Customers can search products from the header search bar.
- [ ] Search tolerates a common typo such as “bluetoth” and still surfaces the Bluetooth earphones result.
- [ ] Customers can filter by category, price range and city, and the result count responds to the selected filters.

## Cart and checkout behavior
- [ ] Customers can add products to a cart, change quantities, remove items and see subtotal, delivery and total pricing.
- [ ] Checkout collects an Indian delivery address and shows an order-placement action.
- [ ] Order placement confirms a created order and prevents checkout with an empty cart.

## Original login and account experience
- [ ] Customers can open a polished marketplace login modal from the header.
- [ ] Login presents phone/email and OTP-style interaction copy without copying any existing brand.
- [ ] Customers can close the modal and continue browsing without losing cart state.

## Aiven commerce pipeline visibility
- [ ] The app exposes a server-backed health seam for PostgreSQL, Kafka and OpenSearch configuration status.
- [ ] The order flow creates a visible order record, emits an order-placed event, shows consumer processing, updates inventory and synchronizes the search index.
- [ ] Credentials remain environment-variable based and are not committed to the repository.

## Pitch and handoff
- [ ] The storefront includes a concise in-app pitch explaining the roles of PostgreSQL, Kafka and OpenSearch.
- [ ] The application serves a valid `/manus-routes.json` route manifest for all page routes.
- [ ] The project passes TypeScript checking and starts through the configured development command.
