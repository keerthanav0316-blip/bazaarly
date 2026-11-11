import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Bike,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudLightning,
  Database,
  Gift,
  Heart,
  IndianRupee,
  Laptop,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: string;
  image: string;
  badge?: string;
  accent: string;
  delivery: string;
  stock: Record<string, number>;
  aliases?: string[];
};

type CartLine = { product: Product; quantity: number };

type ServiceStatus = { configured: boolean; label: string };

const products: Product[] = [
  {
    id: "soundpods-air",
    name: "SoundPods Air ANC",
    category: "Electronics",
    price: 1799,
    mrp: 2999,
    rating: 4.6,
    reviews: "2.4k",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
    badge: "Bestseller",
    accent: "#e7f0ff",
    delivery: "Tomorrow",
    stock: { Mumbai: 22, Bengaluru: 18, Delhi: 31, Pune: 14 },
    aliases: ["bluetooth", "bluetoth", "earphones", "earbuds", "wireless"],
  },
  {
    id: "daily-kettle",
    name: "Daily Brew Electric Kettle",
    category: "Home & Kitchen",
    price: 899,
    mrp: 1499,
    rating: 4.4,
    reviews: "1.1k",
    image:
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=85",
    badge: "Kitchen pick",
    accent: "#fff3cd",
    delivery: "Tomorrow",
    stock: { Mumbai: 8, Bengaluru: 11, Delhi: 0, Pune: 6 },
  },
  {
    id: "city-runner",
    name: "City Runner Everyday Sneakers",
    category: "Fashion",
    price: 1299,
    mrp: 2499,
    rating: 4.3,
    reviews: "876",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    badge: "New drop",
    accent: "#e8f7ef",
    delivery: "Thu, 14 Nov",
    stock: { Mumbai: 9, Bengaluru: 4, Delhi: 15, Pune: 3 },
  },
  {
    id: "glow-serum",
    name: "Glow Theory Vitamin C Serum",
    category: "Beauty",
    price: 699,
    mrp: 999,
    rating: 4.7,
    reviews: "3.8k",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85",
    badge: "Top rated",
    accent: "#ffe8ef",
    delivery: "Tomorrow",
    stock: { Mumbai: 17, Bengaluru: 13, Delhi: 21, Pune: 10 },
  },
  {
    id: "workpack-24",
    name: "WorkPack 24L Laptop Backpack",
    category: "Bags & Travel",
    price: 1199,
    mrp: 1999,
    rating: 4.5,
    reviews: "1.7k",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    badge: "Office ready",
    accent: "#edeaff",
    delivery: "Tomorrow",
    stock: { Mumbai: 12, Bengaluru: 7, Delhi: 20, Pune: 5 },
  },
  {
    id: "smartphone-lite",
    name: "Nova Lite 5G Smartphone",
    category: "Electronics",
    price: 10999,
    mrp: 13999,
    rating: 4.2,
    reviews: "642",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
    badge: "Launch offer",
    accent: "#e4f8fb",
    delivery: "Fri, 15 Nov",
    stock: { Mumbai: 4, Bengaluru: 6, Delhi: 2, Pune: 0 },
  },
  {
    id: "air-fryer-mini",
    name: "CrispMate Mini Air Fryer",
    category: "Home & Kitchen",
    price: 2499,
    mrp: 3999,
    rating: 4.5,
    reviews: "908",
    image:
      "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=85",
    badge: "Deal of the day",
    accent: "#fff0e2",
    delivery: "Tomorrow",
    stock: { Mumbai: 6, Bengaluru: 5, Delhi: 7, Pune: 2 },
  },
  {
    id: "cotton-kurta",
    name: "Everyday Cotton Kurta Set",
    category: "Fashion",
    price: 999,
    mrp: 1799,
    rating: 4.4,
    reviews: "512",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
    badge: "Easy festive",
    accent: "#f8eafb",
    delivery: "Thu, 14 Nov",
    stock: { Mumbai: 13, Bengaluru: 8, Delhi: 11, Pune: 6 },
  },
];

const cities = ["Mumbai", "Bengaluru", "Delhi", "Pune"];
const categories = ["All picks", "Electronics", "Fashion", "Home & Kitchen", "Beauty", "Bags & Travel"];

const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const discount = (product: Product) => Math.round((1 - product.price / product.mrp) * 100);

const fuzzyMatch = (product: Product, query: string) => {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return true;
  const haystack = [product.name, product.category, ...(product.aliases ?? [])].join(" ").toLowerCase();
  if (haystack.includes(normalized)) return true;
  const compact = normalized.replace(/[^a-z0-9]/g, "");
  return compact.length > 3 && haystack.split(" ").some(word => word.startsWith(compact.slice(0, 3)));
};

function ServiceBadge({ icon, title, status }: { icon: React.ReactNode; title: string; status: ServiceStatus }) {
  return (
    <div className="service-badge">
      <span className="service-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small><i className={status.configured ? "status-dot live" : "status-dot"} /> {status.configured ? "Connected" : "Showcase mode"}</small>
      </span>
    </div>
  );
}

function Logo() {
  return (
    <div className="brand-lockup" aria-label="Bazaarly home">
      <div className="brand-mark"><span>B</span><i /></div>
      <div><div className="brand-name">bazaarly</div><div className="brand-tagline">everyday India, delivered</div></div>
    </div>
  );
}

export default function Home() {
  const [city, setCity] = useState("Mumbai");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All picks");
  const [maxPrice, setMaxPrice] = useState(15000);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [loginStep, setLoginStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<{ id: string; eventId: string } | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [health, setHealth] = useState<Record<string, ServiceStatus>>({
    postgres: { configured: false, label: "PostgreSQL" },
    kafka: { configured: false, label: "Kafka" },
    opensearch: { configured: false, label: "OpenSearch" },
  });

  useEffect(() => {
    fetch("/api/commerce/health")
      .then(response => response.json())
      .then(data => setHealth(data.services ?? health))
      .catch(() => undefined);
  }, []);

  const filteredProducts = useMemo(() => products.filter(product => {
    const inCategory = category === "All picks" || product.category === category;
    const inPrice = product.price <= maxPrice;
    const inSearch = fuzzyMatch(product, query);
    return inCategory && inPrice && inSearch;
  }), [category, maxPrice, query]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.product.price, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  const total = subtotal + deliveryFee;

  const addToCart = (product: Product) => {
    const available = product.stock[city] ?? 0;
    const existing = cart.find(line => line.product.id === product.id);
    if ((existing?.quantity ?? 0) >= available) {
      toast.error(`Only ${available} left in ${city}`);
      return;
    }
    setCart(current => existing
      ? current.map(line => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
      : [...current, { product, quantity: 1 }]);
    toast.success(`${product.name} added`, { description: `Delivering to ${city}` });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(current => current.flatMap(line => {
      if (line.product.id !== id) return [line];
      const next = line.quantity + delta;
      const available = line.product.stock[city] ?? 0;
      if (next <= 0) return [];
      if (next > available) {
        toast.error(`Only ${available} left in ${city}`);
        return [line];
      }
      return [{ ...line, quantity: next }];
    }));
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacingOrder(true);
    try {
      const response = await fetch("/api/commerce/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, items: cart.map(line => ({ productId: line.product.id, quantity: line.quantity })), total }),
      });
      const result = await response.json();
      setOrder({ id: result.orderId, eventId: result.eventId });
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      toast.success("Order placed successfully", { description: "Your Bazaarly order is on its way." });
    } catch {
      toast.error("Could not place order", { description: "Please try again in a moment." });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="storefront-shell">
      <div className="top-strip">
        <div className="top-strip-inner">
          <span><Sparkles size={13} /> Fresh finds, fair prices, fast delivery</span>
          <div className="top-links"><span>Download app</span><span>Sell with us</span><span>Help centre</span></div>
        </div>
      </div>
      <header className="site-header">
        <div className="header-main">
          <button className="mobile-menu" aria-label="Open menu"><Menu size={22} /></button>
          <Logo />
          <button className="city-picker" onClick={() => setCity(current => cities[(cities.indexOf(current) + 1) % cities.length])}>
            <MapPin size={16} /><span><small>Deliver to</small><strong>{city}</strong></span><ChevronDown size={14} />
          </button>
          <label className="search-box">
            <Search size={19} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search for products, brands and more" /><kbd>⌘ K</kbd>
          </label>
          <div className="header-actions">
            <button className="account-button" onClick={() => setShowLogin(true)}><UserRound size={18} /><span><small>Hello, sign in</small><strong>Account</strong></span><ChevronDown size={14} /></button>
            <button className="icon-action" aria-label="Notifications"><Bell size={20} /><i /></button>
            <button className="cart-button" onClick={() => setShowCart(true)}><ShoppingBag size={20} /><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
          </div>
        </div>
        <nav className="category-nav">
          <div className="nav-inner">
            <button className="all-menu"><Menu size={16} /> All categories <ChevronDown size={14} /></button>
            {categories.slice(1).map(item => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}
            <button onClick={() => setShowPitch(true)} className="nav-pitch"><CloudLightning size={15} /> How Bazaarly works</button>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Curated for {city} <ArrowRight size={14} /></div>
            <h1>The good stuff,<br /><em>delivered.</em></h1>
            <p>From daily little wins to big-ticket upgrades, find what fits your life — with city-smart stock and no-nonsense prices.</p>
            <div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>Shop the edit <ArrowRight size={17} /></button><button className="text-button" onClick={() => setShowPitch(true)}>See our story <ChevronRight size={17} /></button></div>
            <div className="hero-proof"><div className="avatar-stack"><span>RK</span><span>SM</span><span>AP</span><span>+</span></div><span><strong>4.8/5</strong> from 12k+ happy shoppers</span></div>
          </div>
          <div className="hero-art">
            <div className="sun-disc" />
            <div className="hero-note note-one"><Zap size={15} /><span><strong>Fast, not frantic</strong><small>Reliable delivery windows</small></span></div>
            <div className="hero-note note-two"><PackageCheck size={16} /><span><strong>Stock you can trust</strong><small>Checked for {city}</small></span></div>
            <div className="floating-product product-one"><div className="product-glow yellow" /><img src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=500&q=85" alt="Wireless earphones" /><span>SoundPods Air</span></div>
            <div className="floating-product product-two"><div className="product-glow blue" /><img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=85" alt="Laptop backpack" /><span>WorkPack 24L</span></div>
            <div className="hero-arch"><div className="arch-inner"><span>Made for</span><strong>everyday.</strong><small>1,000+ ways to make<br />today a little better</small></div></div>
          </div>
        </section>

        <section className="service-ribbon">
          <div className="service-ribbon-inner container">
            <div className="ribbon-intro"><span className="live-pulse" /> <strong>Built for trust</strong><small>Powered by Aiven services</small></div>
            <ServiceBadge icon={<Database size={17} />} title="PostgreSQL" status={health.postgres} />
            <ServiceBadge icon={<Zap size={17} />} title="Kafka events" status={health.kafka} />
            <ServiceBadge icon={<Search size={17} />} title="OpenSearch" status={health.opensearch} />
            <div className="ribbon-stat"><strong>24 min</strong><small>avg. order to doorstep</small></div>
          </div>
        </section>

        <section className="quick-categories container">
          <div className="section-kicker"><span>Shop by mood</span><button onClick={() => { setCategory("All picks"); setQuery(""); }}>View all <ArrowRight size={14} /></button></div>
          <div className="category-rail">
            {[{ label: "Tech that clicks", icon: Laptop, color: "#e5efff", cat: "Electronics" }, { label: "Easy everyday", icon: Gift, color: "#fff0c7", cat: "Fashion" }, { label: "Home, sorted", icon: Store, color: "#e3f7ea", cat: "Home & Kitchen" }, { label: "Little luxuries", icon: Sparkles, color: "#f9e5ef", cat: "Beauty" }, { label: "Made to move", icon: Bike, color: "#eae7fa", cat: "Bags & Travel" }].map(item => { const Icon = item.icon; return <button className="mood-card" style={{ "--mood": item.color } as React.CSSProperties} key={item.label} onClick={() => setCategory(item.cat)}><span className="mood-icon"><Icon size={22} /></span><span><strong>{item.label}</strong><small>Explore now <ArrowRight size={12} /></small></span></button>; })}
          </div>
        </section>

        <section className="catalog-section container" id="catalog">
          <aside className="filter-panel">
            <div className="filter-heading"><div><span className="tiny-label">Your edit</span><h2>Find your fit</h2></div><button onClick={() => { setCategory("All picks"); setMaxPrice(15000); setQuery(""); }}>Reset</button></div>
            <div className="filter-block"><span className="filter-label">Categories</span>{categories.map(item => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}><span className="filter-radio" />{item}<small>{item === "All picks" ? products.length : products.filter(product => product.category === item).length}</small></button>)}</div>
            <div className="filter-block"><div className="filter-label-row"><span className="filter-label">Price range</span><strong>{formatPrice(maxPrice)}</strong></div><input className="price-range" type="range" min="500" max="15000" step="500" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))} /><div className="range-labels"><span>₹500</span><span>₹15,000+</span></div></div>
            <div className="filter-block"><span className="filter-label">Deliver to</span><button className="city-filter" onClick={() => setCity(current => cities[(cities.indexOf(current) + 1) % cities.length])}><MapPin size={15} />{city}<ChevronDown size={14} /></button><p className="filter-hint">Showing stock available near you</p></div>
            <div className="filter-pledge"><ShieldCheck size={20} /><span><strong>Our easy promise</strong><small>Fair prices, clear delivery dates, no surprises.</small></span></div>
          </aside>
          <div className="catalog-content">
            <div className="catalog-heading"><div><span className="tiny-label">Fresh from the shelves</span><h2>Picked for <em>{city}</em></h2><p>{filteredProducts.length} products matched your search</p></div><div className="sort-control"><span>Sort by</span><button>Popular <ChevronDown size={14} /></button></div></div>
            {filteredProducts.length > 0 ? <div className="product-grid">{filteredProducts.map(product => { const available = product.stock[city] ?? 0; return <article className="product-card" key={product.id}><div className="product-image" style={{ "--product-bg": product.accent } as React.CSSProperties}><span className="product-badge">{product.badge}</span><button className="wishlist" aria-label={`Save ${product.name}`}><Heart size={17} /></button><img src={product.image} alt={product.name} /><span className="quick-view">Quick view <ArrowRight size={13} /></span></div><div className="product-meta"><div className="rating"><Star size={13} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></div><h3>{product.name}</h3><div className="price-row"><strong>{formatPrice(product.price)}</strong><s>{formatPrice(product.mrp)}</s><span>{discount(product)}% off</span></div><div className={`stock-line ${available < 5 ? "low" : ""}`}><span className="stock-dot" /> {available === 0 ? "Out of stock in " + city : available < 5 ? `Only ${available} left in ${city}` : `${available} available in ${city}`}</div><div className="delivery-line"><Truck size={14} /> Delivery by <strong>{product.delivery}</strong></div><button className="add-button" disabled={available === 0} onClick={() => addToCart(product)}>{available === 0 ? "Notify me" : <><Plus size={17} /> Add to cart</>}</button></div></article>; })}</div> : <div className="empty-state"><Search size={32} /><h3>No exact match yet</h3><p>Try a broader search or reset the filters. Our catalog is always getting bigger.</p><button className="primary-button" onClick={() => { setQuery(""); setCategory("All picks"); setMaxPrice(15000); }}>Show all picks</button></div>}
          </div>
        </section>

        <section className="promise-section container"><div className="promise-copy"><span className="tiny-label">The Bazaarly difference</span><h2>Shopping that feels<br /><em>thought through.</em></h2><p>We built the bits we wish every store had: honest stock, useful filters, and a checkout that tells you exactly what is happening behind the scenes.</p><button className="outline-button" onClick={() => setShowPitch(true)}>See how it works <ArrowRight size={16} /></button></div><div className="promise-grid"><div><span className="promise-number">01</span><BadgeCheck size={23} /><h3>Stock, in context</h3><p>City-level inventory helps you choose with confidence.</p></div><div><span className="promise-number">02</span><Zap size={23} /><h3>Events, in motion</h3><p>Every order triggers a clear downstream journey.</p></div><div><span className="promise-number">03</span><ShieldCheck size={23} /><h3>No hidden surprises</h3><p>Price, delivery and availability stay visible.</p></div><div><span className="promise-number">04</span><Heart size={23} /><h3>Made for real life</h3><p>Useful picks for the way India actually shops.</p></div></div></section>

        <section className="newsletter-section container"><div><span className="tiny-label">Good things, occasionally</span><h2>A little note from Bazaarly.</h2><p>New drops, city-specific finds and price drops. No noise.</p></div><form onSubmit={event => { event.preventDefault(); toast.success("You're on the list", { description: "Watch your inbox for the good stuff." }); }}><input type="email" placeholder="Your email address" aria-label="Email address" required /><button className="primary-button" type="submit">Keep me posted <ArrowRight size={16} /></button></form></section>
      </main>

      <footer className="site-footer"><div className="container footer-inner"><div><Logo /><p>Everyday India, delivered with a little more care.</p></div><div className="footer-links"><span>About Bazaarly</span><span>Careers</span><span>Privacy</span><span>Terms</span></div><div className="footer-credit">Aiven-powered demo<br /><span>PostgreSQL · Kafka · OpenSearch</span></div></div></footer>

      {showCart && <div className="overlay"><div className="drawer cart-drawer"><div className="drawer-header"><div><span className="tiny-label">Your bag</span><h2>{cartCount} {cartCount === 1 ? "item" : "items"}</h2></div><button className="close-button" onClick={() => setShowCart(false)}><X size={20} /></button></div>{cart.length === 0 ? <div className="cart-empty"><div className="empty-bag"><ShoppingBag size={32} /></div><h3>Your bag is waiting</h3><p>Add something useful, delightful, or both.</p><button className="primary-button" onClick={() => setShowCart(false)}>Keep browsing</button></div> : <><div className="cart-lines">{cart.map(line => <div className="cart-line" key={line.product.id}><img src={line.product.image} alt="" /><div className="cart-line-info"><h3>{line.product.name}</h3><small>Delivering to {city}</small><strong>{formatPrice(line.product.price)}</strong><div className="quantity-control"><button onClick={() => updateQuantity(line.product.id, -1)}><Minus size={13} /></button><span>{line.quantity}</span><button onClick={() => updateQuantity(line.product.id, 1)}><Plus size={13} /></button><button className="remove-link" onClick={() => setCart(current => current.filter(item => item.product.id !== line.product.id))}>Remove</button></div></div></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div><span>Delivery</span><strong className="free-text">{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</strong></div><div className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><button className="primary-button wide" onClick={() => setShowCheckout(true)}>Proceed to checkout <ArrowRight size={16} /></button><p><ShieldCheck size={14} /> Secure checkout · Easy returns</p></div></>}</div></div>}

      {showLogin && <div className="overlay"><div className="modal login-modal"><button className="close-button modal-close" onClick={() => setShowLogin(false)}><X size={20} /></button><div className="login-art"><div className="login-orbit" /><div className="login-bag"><ShoppingBag size={42} /></div><span>Shop smart.<br /><strong>Live easy.</strong></span></div><div className="login-form"><Logo /><span className="tiny-label">Your Bazaarly account</span><h2>{loginStep === "phone" ? "Let’s get you in." : "Check your messages."}</h2><p>{loginStep === "phone" ? "Sign in to see your orders, saved picks and faster checkout." : `We sent a one-time code to ${phone}.`}</p>{loginStep === "phone" ? <><label>Mobile number or email<input value={phone} onChange={event => setPhone(event.target.value)} placeholder="e.g. 98765 43210" /></label><button className="primary-button wide" onClick={() => { if (!phone.trim()) return toast.error("Enter your mobile number or email"); setLoginStep("otp"); }}>Continue securely <ArrowRight size={16} /></button><small className="legal-copy">By continuing, you agree to Bazaarly’s Terms and Privacy Policy.</small></> : <><label>One-time password<input autoFocus inputMode="numeric" maxLength={6} placeholder="6-digit code" /></label><button className="primary-button wide" onClick={() => { setShowLogin(false); setLoginStep("phone"); toast.success("You’re signed in", { description: "Your Bazaarly account is ready." }); }}>Verify & continue <Check size={16} /></button><button className="back-link" onClick={() => setLoginStep("phone")}>Use a different number</button></>}</div></div></div>}

      {showCheckout && <div className="overlay"><div className="modal checkout-modal"><div className="drawer-header"><div><span className="tiny-label">Almost there</span><h2>Confirm your order</h2></div><button className="close-button" onClick={() => setShowCheckout(false)}><X size={20} /></button></div><div className="checkout-layout"><div className="checkout-form"><div className="checkout-step active"><span>1</span><div><strong>Delivery details</strong><small>Where should we bring it?</small></div></div><label>Full name<input placeholder="e.g. Aditi Rao" defaultValue="Aditi Rao" /></label><label>Phone number<input placeholder="10-digit mobile number" defaultValue="98765 43210" /></label><label>Address<input placeholder="Flat, building, street, area" defaultValue="24, Palm Grove, Bandra West" /></label><div className="address-row"><label>City<input value={city} readOnly /></label><label>PIN code<input placeholder="400050" defaultValue="400050" /></label></div><div className="checkout-step"><span>2</span><div><strong>Payment</strong><small>Cash on delivery for this demo</small></div><Banknote size={18} /></div></div><div className="checkout-review"><span className="tiny-label">Order summary</span>{cart.map(line => <div className="review-line" key={line.product.id}><span>{line.quantity} × {line.product.name}</span><strong>{formatPrice(line.quantity * line.product.price)}</strong></div>)}<div className="review-divider" /><div className="review-line"><span>Delivery</span><strong className="free-text">FREE</strong></div><div className="review-total"><span>Total payable</span><strong>{formatPrice(total)}</strong></div><button className="primary-button wide" onClick={placeOrder} disabled={placingOrder}>{placingOrder ? <><Clock3 size={16} /> Placing order…</> : <>Place order <ArrowRight size={16} /></>}</button><small><ShieldCheck size={13} /> Your details are encrypted and safe.</small></div></div></div></div>}

      {order && <div className="overlay"><div className="modal success-modal"><button className="close-button modal-close" onClick={() => setOrder(null)}><X size={20} /></button><div className="success-icon"><Check size={31} /></div><span className="tiny-label">Order confirmed</span><h2>That’s a wrap.</h2><p>Order <strong>#{order.id}</strong> is confirmed and headed your way.</p><div className="event-trail"><div className="trail-heading"><span>Live order trail</span><small>#{order.eventId}</small></div><div className="trail-step done"><span><Database size={15} /></span><div><strong>Saved to PostgreSQL</strong><small>Order record created securely</small></div><Check size={15} /></div><div className="trail-line active" /><div className="trail-step done"><span><Zap size={15} /></span><div><strong>Kafka event emitted</strong><small>order.placed is on the bus</small></div><Check size={15} /></div><div className="trail-line active" /><div className="trail-step done"><span><PackageCheck size={15} /></span><div><strong>Inventory consumer reacted</strong><small>{city} stock reserved in real time</small></div><Check size={15} /></div><div className="trail-line active" /><div className="trail-step done"><span><Search size={15} /></span><div><strong>OpenSearch index synced</strong><small>Availability stays accurate</small></div><Check size={15} /></div></div><div className="success-actions"><button className="primary-button" onClick={() => setOrder(null)}>Continue shopping <ArrowRight size={16} /></button><button className="text-button" onClick={() => { setOrder(null); toast.info("Order tracking will be available soon."); }}>Track order</button></div></div></div>}

      {showPitch && <div className="overlay"><div className="modal pitch-modal"><button className="close-button modal-close" onClick={() => setShowPitch(false)}><X size={20} /></button><div className="pitch-hero"><span className="eyebrow"><span className="eyebrow-dot" /> The Bazaarly pitch</span><h2>A storefront that knows<br /><em>what happens next.</em></h2><p>We turned a familiar shopping flow into a living demo of a modern event-driven store.</p></div><div className="pitch-cards"><div><span className="pitch-icon postgres"><Database size={20} /></span><h3>PostgreSQL remembers.</h3><p>Products, customers, carts, orders and city-level stock stay durable and consistent.</p></div><div><span className="pitch-icon kafka"><Zap size={20} /></span><h3>Kafka keeps it moving.</h3><p>Order placed and inventory changed events let the store react without blocking the shopper.</p></div><div><span className="pitch-icon search"><Search size={20} /></span><h3>OpenSearch finds it.</h3><p>Fast, typo-tolerant search makes “bluetoth” a useful query, not a dead end.</p></div></div><div className="pitch-footer"><span><ShieldCheck size={16} /> Credentials stay in environment variables.</span><button className="primary-button" onClick={() => setShowPitch(false)}>Explore the store <ArrowRight size={16} /></button></div></div></div>}
    </div>
  );
}
