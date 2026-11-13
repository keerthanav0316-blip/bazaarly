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
  CreditCard,
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
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  UserRound,
  WalletCards,
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
type CustomerDetails = { name: string; phone: string; address: string; city: string; state: string; pin: string };
type ConfirmedOrder = { id: string; eventId: string; items: CartLine[]; total: number; customer: CustomerDetails };
type DeliveryStatus = "Confirmed" | "Packed" | "Out for delivery" | "Delivered";

type ServiceStatus = { configured: boolean; label: string };

const featuredProducts: Product[] = [
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

const extraCatalog: Array<[string, string, string, number, number, string]> = [
  ["cable-clips", "TidyLoop Cable Clips", "Electronics", 149, 249, "photo-1586953208448-b95a79798f07"], ["smartwatch-fit", "PulseFit Smartwatch", "Electronics", 2499, 4999, "photo-1523275335684-37898b6baf30"], ["speaker-go", "BeatBox Go Bluetooth Speaker", "Electronics", 1499, 2499, "photo-1608043152269-423dbba4e7e1"], ["powerbank-20k", "PowerPlus 20,000mAh Power Bank", "Electronics", 1299, 2199, "photo-1609592424642-3e3d4f6b8f72"], ["webcam-pro", "ClearView HD Webcam", "Electronics", 1899, 2999, "photo-1587825140708-dfaf72ae4b04"], ["keyboard-mech", "TypeFast Mechanical Keyboard", "Electronics", 2799, 4499, "photo-1587829741301-dc798b83add3"], ["mouse-silent", "SwiftClick Silent Mouse", "Electronics", 699, 1299, "photo-1527814050087-3793815479db"], ["tablet-slate", "StudySlate 10 Tablet", "Electronics", 8999, 11999, "photo-1544244015-0df4b3ffc6b0"], ["router-air", "ConnectAir Wi-Fi 6 Router", "Electronics", 3299, 4999, "photo-1606904825846-647eb07f5be2"], ["trimmer-pro", "TrimPro Beard Trimmer", "Electronics", 1199, 1999, "photo-1621607512214-68297480165e"],
  ["utility-hooks", "StickRight Utility Hooks", "Home & Kitchen", 99, 179, "photo-1586023492125-27b2c045efd7"], ["lamp-desk", "GlowDesk LED Study Lamp", "Home & Kitchen", 799, 1499, "photo-1507473885765-e6ed057f782c"], ["cookware-set", "StoneChef 5-Piece Cookware Set", "Home & Kitchen", 2399, 3999, "photo-1556911220-bff31c812dba"], ["mixer-quick", "QuickMix 500W Mixer Grinder", "Home & Kitchen", 1999, 3299, "photo-1570222094114-d054a817e56b"], ["bedsheet-cotton", "CloudSoft Cotton Bedsheet", "Home & Kitchen", 899, 1599, "photo-1584100936595-c0654b55a2e2"], ["storage-box", "SmartStore Storage Box Set", "Home & Kitchen", 599, 999, "photo-1586023492125-27b2c045efd7"], ["vacuum-mini", "DustAway Mini Vacuum", "Home & Kitchen", 2199, 3499, "photo-1558317374-067fb5f30001"], ["water-bottle", "HydraSteel Insulated Bottle", "Home & Kitchen", 749, 1299, "photo-1602143407151-7111542de6e8"], ["lunchbox-steel", "FreshCarry Steel Lunch Box", "Home & Kitchen", 649, 999, "photo-1606787366850-de6330128bfc"], ["organizer-desk", "NeatNest Desk Organizer", "Home & Kitchen", 449, 799, "photo-1494438639946-1ebd1d20bf85"],
  ["socks-cotton", "Everyday Cotton Socks", "Fashion", 79, 149, "photo-1586350977771-b3b0abd50c82"], ["kurta-blue", "Indigo Comfort Kurta", "Fashion", 799, 1499, "photo-1583391733956-6c78276477e2"], ["sneaker-white", "CloudStep White Sneakers", "Fashion", 1499, 2799, "photo-1549298916-b41d501d3772"], ["denim-jacket", "Weekend Denim Jacket", "Fashion", 1799, 2999, "photo-1551028719-00167b16eac5"], ["tote-canvas", "Everyday Canvas Tote", "Fashion", 499, 899, "photo-1544816155-12df9643f363"], ["saree-print", "Utsav Printed Saree", "Fashion", 1299, 2499, "photo-1610030469983-98e550d6193c"], ["hoodie-fleece", "Cozy Fleece Hoodie", "Fashion", 1099, 1999, "photo-1556821840-3a63f95609a7"], ["shirt-linen", "Breeze Linen Shirt", "Fashion", 899, 1599, "photo-1602810318383-e386cc2a3ccf"], ["wallet-leather", "Classic Leather Wallet", "Fashion", 599, 999, "photo-1627123424574-724758594e93"], ["sunglasses-sun", "Sunline Polarised Sunglasses", "Fashion", 699, 1299, "photo-1511499767150-a48a237f0083"], ["sandals-comfort", "WalkEasy Comfort Sandals", "Fashion", 749, 1299, "photo-1543163521-1bf539c55dd2"],
  ["facewash-gentle", "PureKind Gentle Face Wash", "Beauty", 349, 499, "photo-1556228578-8c89e6adf883"], ["sunscreen-spf", "SunGuard SPF 50 Lotion", "Beauty", 599, 899, "photo-1556228720-195a672e8a03"], ["hair-dryer", "AirStyle Hair Dryer", "Beauty", 1299, 1999, "photo-1522337360788-8b13dee7a37e"], ["lip-care-set", "PetalGlow Lip Care Set", "Beauty", 449, 699, "photo-1586495777744-4413f21062fa"], ["body-lotion", "SilkRoot Body Lotion", "Beauty", 399, 599, "photo-1608248543803-ba4f8c70ae0b"], ["shampoo-herbal", "HerbalRoot Daily Shampoo", "Beauty", 499, 799, "photo-1556229010-6c3f2c9ca5f8"], ["perfume-mist", "Monsoon Bloom Body Mist", "Beauty", 699, 1099, "photo-1541643600914-78b084683601"], ["makeup-brush", "BlendRight Makeup Brush Set", "Beauty", 549, 899, "photo-1522335789203-aabd1fc54bc9"],
  ["travel-neck", "CloudRest Travel Neck Pillow", "Bags & Travel", 599, 999, "photo-1589391886645-d51941baf7fb"], ["duffle-weekend", "Weekender Cabin Duffle", "Bags & Travel", 1599, 2799, "photo-1553062407-98eeb64c6a62"], ["passport-cover", "Voyage Passport Cover", "Bags & Travel", 399, 699, "photo-1581553680321-4fffae59fccd"], ["packing-cubes", "PackSmart Travel Cubes", "Bags & Travel", 799, 1299, "photo-1566576912321-d58ddd7a6088"], ["sling-bag", "MetroMove Sling Bag", "Bags & Travel", 899, 1599, "photo-1553062407-98eeb64c6a62"], ["rain-cover", "AllWeather Backpack Cover", "Bags & Travel", 299, 499, "photo-1531891437562-4301cf35b7e4"], ["travel-mug", "RoamSip Travel Mug", "Bags & Travel", 699, 1099, "photo-1513558161293-cdaf765ed2fd"], ["luggage-scale", "TripReady Luggage Scale", "Bags & Travel", 449, 799, "photo-1553531384-cc64ac80f931"],
];

const additionalProducts: Product[] = extraCatalog.map(([id, name, category, price, mrp, photo], index) => ({
  id, name, category, price, mrp,
  rating: Number((4.1 + (index % 7) * 0.1).toFixed(1)),
  reviews: `${140 + index * 37}`,
  image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=85`,
  badge: index % 4 === 0 ? "Fresh pick" : index % 4 === 1 ? "Good value" : index % 4 === 2 ? "Popular" : "Everyday pick",
  accent: ["#e7f0ff", "#fff3cd", "#e8f7ef", "#ffe8ef", "#edeaff"][index % 5],
  delivery: index % 3 === 0 ? "Tomorrow" : index % 3 === 1 ? "Thu, 14 Nov" : "Fri, 15 Nov",
  stock: { Mumbai: 5 + (index % 18), Bengaluru: 4 + (index % 12), Delhi: 7 + (index % 20), Pune: 3 + (index % 10) },
  aliases: name.toLowerCase().split(" "),
}));

const products: Product[] = [...featuredProducts, ...additionalProducts];
const priceShortcuts = [
  { label: "Under ₹100", max: 100, note: "Tiny everyday wins" },
  { label: "Under ₹200", max: 200, note: "Useful picks" },
  { label: "Under ₹500", max: 500, note: "Easy upgrades" },
  { label: "Under ₹1,000", max: 1000, note: "Best value" },
];
const cities = ["Mumbai", "Bengaluru", "Delhi", "Pune"];
const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];
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
  const [deliveryState, setDeliveryState] = useState("Maharashtra");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All picks");
  const [maxPrice, setMaxPrice] = useState(15000);
  const [selectedPriceShortcut, setSelectedPriceShortcut] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showHelpDesk, setShowHelpDesk] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackingProduct, setTrackingProduct] = useState<CartLine | null>(null);
  const [trackingStep, setTrackingStep] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<ConfirmedOrder | null>(() => {
    try {
      const saved = window.localStorage.getItem("bazaarly:last-confirmed-order");
      return saved ? JSON.parse(saved) as ConfirmedOrder : null;
    } catch {
      return null;
    }
  });
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({ name: "Aditi Rao", phone: "98765 43210", address: "24, Palm Grove, Bandra West", city: "Mumbai", state: "Maharashtra", pin: "400050" });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash on delivery");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
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

  useEffect(() => {
    const shouldLock = showCart || showLogin || showCheckout || showPitch || showWishlist || showOrders || showHelpDesk || showFeedback || showOrderConfirmation || Boolean(selectedProduct) || Boolean(trackingProduct);
    if (!shouldLock) return;
    const scrollY = window.scrollY;
    const previous = {
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.documentElement.style.overflow = previous.htmlOverflow;
      document.body.style.overflow = previous.bodyOverflow;
      document.body.style.position = previous.bodyPosition;
      document.body.style.top = previous.bodyTop;
      document.body.style.width = previous.bodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [showCart, showLogin, showCheckout, showPitch, showWishlist, showOrders, showHelpDesk, showFeedback, showOrderConfirmation, selectedProduct, trackingProduct]);

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
  const deliveryStatuses: DeliveryStatus[] = ["Confirmed", "Packed", "Out for delivery", "Delivered"];
  const trackingStatus = deliveryStatuses[trackingStep];

  const applyPriceShortcut = (max: number) => {
    setMaxPrice(max);
    setSelectedPriceShortcut(max);
    setCategory("All picks");
    setQuery("");
    window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const openTracking = (line: CartLine) => {
    setTrackingProduct(line);
    setTrackingStep(0);
  };

  const advanceTracking = () => {
    setTrackingStep(current => Math.min(current + 1, deliveryStatuses.length - 1));
  };

  const rateProduct = (product: Product, rating: number) => {
    setProductRatings(current => ({ ...current, [product.id]: rating }));
    toast.success("Thanks for rating this product", { description: `${product.name} · ${rating}/5` });
  };

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

  const toggleWishlist = (product: Product) => {
    const saved = wishlistIds.includes(product.id);
    setWishlistIds(current => saved ? current.filter(id => id !== product.id) : [...current, product.id]);
    toast(saved ? "Removed from wishlist" : "Saved to wishlist", { description: product.name });
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacingOrder(true);
    try {
      const response = await fetch("/api/commerce/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, paymentMethod, items: cart.map(line => ({ productId: line.product.id, quantity: line.quantity })), total }),
      });
      const result = await response.json();
      const confirmedOrder = { id: result.orderId, eventId: result.eventId, items: cart, total, customer: customerDetails };
      setOrder(confirmedOrder);
      setShowOrderConfirmation(true);
      try {
        window.localStorage.setItem("bazaarly:last-confirmed-order", JSON.stringify(confirmedOrder));
      } catch {
        // The order remains visible for this session if browser storage is unavailable.
      }
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
          <div className="top-links"><span>Download app</span><span>Sell with us</span><button onClick={() => setShowHelpDesk(true)}>Help Desk</button></div>
        </div>
      </div>
      <header className="site-header">
        <div className="header-main">
          <button className="mobile-menu" aria-label="Open menu"><Menu size={22} /></button>
          <Logo />
          <label className="city-picker"><MapPin size={16} /><span><small>Deliver to</small><select value={deliveryState} onChange={event => { setDeliveryState(event.target.value); toast.success("Delivery location updated", { description: `Showing options for ${event.target.value}` }); }} aria-label="Delivery state">{states.map(item => <option key={item}>{item}</option>)}</select></span><ChevronDown size={14} /></label>
          <form className={`search-box ${searchOpen ? "search-box-active" : ""}`} onSubmit={event => { event.preventDefault(); setSearchOpen(true); }}>
            <Search size={19} /><input value={query} onFocus={() => setSearchOpen(true)} onChange={event => setQuery(event.target.value)} placeholder="Search for products, brands and more" /><kbd>⌘ K</kbd>
          </form>
          <div className="header-actions">
            <button className="account-button" onClick={() => setShowLogin(true)}><UserRound size={18} /><span><small>Hello, sign in</small><strong>Account</strong></span><ChevronDown size={14} /></button>
            <button className="icon-action" aria-label="Wishlist" onClick={() => setShowWishlist(true)}><Heart size={20} fill={wishlistIds.length ? "currentColor" : "none"} /><i className={wishlistIds.length ? "wishlist-pulse" : ""} /></button>
            <div className="notification-wrap"><button className="icon-action" aria-label="Notifications" onClick={() => setShowNotifications(current => !current)}><Bell size={20} /><i /></button>{showNotifications && <div className="notification-panel"><div><span className="tiny-label">Updates</span><button onClick={() => setShowNotifications(false)}><X size={14} /></button></div><strong>Your Bazaarly updates</strong><p><PackageCheck size={16} /> Your city-smart stock is checked before every order.</p><p><Zap size={16} /> Live Kafka events keep inventory accurate.</p><button className="text-button" onClick={() => { setShowNotifications(false); toast.success("You’re all caught up"); }}>Mark all as read <Check size={14} /></button></div>}</div>
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

      {searchOpen ? <section className="search-page container">
        <div className="search-page-top"><button className="back-link search-back" onClick={() => setSearchOpen(false)}><ChevronRight size={15} /> Back to home</button><span className="tiny-label">OpenSearch results</span></div>
        <div className="search-page-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> Search, sorted</span><h1>{query.trim() ? <>Results for <em>“{query}”</em></> : <>What are you<br /><em>looking for?</em></>}</h1><p>{query.trim() ? `${filteredProducts.length} products matched across your city-smart catalog.` : "Start typing above and Bazaarly will bring the right picks forward."}</p></div><div className="search-page-signal"><Search size={17} /><strong>Typo-tolerant discovery</strong><small>Try “bluetoth” or “wireless”</small></div></div>
        {query.trim() ? <>{filteredProducts.length > 0 ? <div className="product-grid search-results-grid">{filteredProducts.map(product => { const available = product.stock[city] ?? 0; const saved = wishlistIds.includes(product.id); return <article className="product-card" key={product.id}><div className="product-image" style={{ "--product-bg": product.accent } as React.CSSProperties}><span className="product-badge">{product.badge}</span><button className={`wishlist ${saved ? "saved" : ""}`} aria-label={`${saved ? "Remove" : "Save"} ${product.name}`} onClick={() => toggleWishlist(product)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button><img src={product.image} alt={product.name} /><button className="quick-view" onClick={() => setSelectedProduct(product)}>Quick view <ArrowRight size={13} /></button></div><div className="product-meta"><div className="rating"><Star size={13} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></div><h3>{product.name}</h3><div className="price-row"><strong>{formatPrice(product.price)}</strong><s>{formatPrice(product.mrp)}</s><span>{discount(product)}% off</span></div><div className={`stock-line ${available < 5 ? "low" : ""}`}><span className="stock-dot" /> {available === 0 ? "Out of stock in " + city : available < 5 ? `Only ${available} left in ${city}` : `${available} available in ${city}`}</div><button className="add-button" disabled={available === 0} onClick={() => addToCart(product)}>{available === 0 ? "Notify me" : <><Plus size={17} /> Add to cart</>}</button></div></article>; })}</div> : <div className="empty-state search-empty"><Search size={32} /><h3>No exact match yet</h3><p>Try a broader search, or search for “bluetoth” to see typo-tolerant discovery in action.</p><button className="primary-button" onClick={() => setQuery("")}>Clear search</button></div>}</> : <div className="search-suggestions"><span className="tiny-label">Popular right now</span><div>{["bluetooth earphones", "laptop backpack", "home kitchen", "sneakers", "vitamin c serum"].map(suggestion => <button key={suggestion} onClick={() => setQuery(suggestion)}><Search size={14} />{suggestion}<ArrowRight size={13} /></button>)}</div></div>}
      </section> : <main>
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
          <div className="price-shortcuts">
            <div className="price-shortcuts-heading"><span>Shop by price</span><small>Tap a range to see every pick within it</small></div>
            <div className="price-shortcut-rail">
              {priceShortcuts.map(item => <button key={item.max} className={`price-shortcut ${selectedPriceShortcut === item.max ? "selected" : ""}`} onClick={() => applyPriceShortcut(item.max)}><span className="price-shortcut-icon">₹</span><span><strong>{item.label}</strong><small>{item.note}</small></span><ArrowRight size={14} /></button>)}
            </div>
          </div>
        </section>

        <section className="catalog-section container" id="catalog">
          <aside className="filter-panel">
            <div className="filter-heading"><div><span className="tiny-label">Your edit</span><h2>Find your fit</h2></div><button onClick={() => { setCategory("All picks"); setMaxPrice(15000); setSelectedPriceShortcut(null); setQuery(""); }}>Reset</button></div>
            <div className="filter-block"><span className="filter-label">Categories</span>{categories.map(item => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}><span className="filter-radio" />{item}<small>{item === "All picks" ? products.length : products.filter(product => product.category === item).length}</small></button>)}</div>
            <div className="filter-block"><div className="filter-label-row"><span className="filter-label">Price range</span><strong>{formatPrice(maxPrice)}</strong></div><input className="price-range" type="range" min="100" max="15000" step="100" value={maxPrice} onChange={event => { setMaxPrice(Number(event.target.value)); setSelectedPriceShortcut(null); }} /><div className="range-labels"><span>₹100</span><span>₹15,000+</span></div></div>
            <div className="filter-block"><span className="filter-label">Deliver to</span><label className="city-filter"><MapPin size={15} /><select value={deliveryState} onChange={event => setDeliveryState(event.target.value)} aria-label="Delivery state filter">{states.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label><p className="filter-hint">Showing stock available near {deliveryState}</p></div>
            <div className="filter-pledge"><ShieldCheck size={20} /><span><strong>Our easy promise</strong><small>Fair prices, clear delivery dates, no surprises.</small></span></div>
          </aside>
          <div className="catalog-content">
            <div className="catalog-heading"><div><span className="tiny-label">Fresh from the shelves</span><h2>Picked for <em>{city}</em></h2><p>{filteredProducts.length} products matched your search</p></div><div className="sort-control"><span>Sort by</span><button>Popular <ChevronDown size={14} /></button></div></div>
            {filteredProducts.length > 0 ? <div className="product-grid">{filteredProducts.map(product => { const available = product.stock[city] ?? 0; const saved = wishlistIds.includes(product.id); return <article className="product-card" key={product.id}><div className="product-image" style={{ "--product-bg": product.accent } as React.CSSProperties}><span className="product-badge">{product.badge}</span><button className={`wishlist ${saved ? "saved" : ""}`} aria-label={`${saved ? "Remove" : "Save"} ${product.name}`} onClick={() => toggleWishlist(product)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button><img src={product.image} alt={product.name} /><button className="quick-view" onClick={() => setSelectedProduct(product)}>Quick view <ArrowRight size={13} /></button></div><div className="product-meta"><div className="rating"><Star size={13} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></div><h3>{product.name}</h3><div className="price-row"><strong>{formatPrice(product.price)}</strong><s>{formatPrice(product.mrp)}</s><span>{discount(product)}% off</span></div><div className={`stock-line ${available < 5 ? "low" : ""}`}><span className="stock-dot" /> {available === 0 ? "Out of stock in " + city : available < 5 ? `Only ${available} left in ${city}` : `${available} available in ${city}`}</div><div className="delivery-line"><Truck size={14} /> Delivery by <strong>{product.delivery}</strong></div><button className="add-button" disabled={available === 0} onClick={() => addToCart(product)}>{available === 0 ? "Notify me" : <><Plus size={17} /> Add to cart</>}</button></div></article>; })}</div> : <div className="empty-state"><Search size={32} /><h3>No exact match yet</h3><p>Try a broader search or reset the filters. Our catalog is always getting bigger.</p><button className="primary-button" onClick={() => { setQuery(""); setCategory("All picks"); setMaxPrice(15000); setSelectedPriceShortcut(null); }}>Show all picks</button></div>}
          </div>
        </section>

        <section className="promise-section container"><div className="promise-copy"><span className="tiny-label">The Bazaarly difference</span><h2>Shopping that feels<br /><em>thought through.</em></h2><p>We built the bits we wish every store had: honest stock, useful filters, and a checkout that tells you exactly what is happening behind the scenes.</p><button className="outline-button" onClick={() => setShowPitch(true)}>See how it works <ArrowRight size={16} /></button></div><div className="promise-grid"><div><span className="promise-number">01</span><BadgeCheck size={23} /><h3>Stock, in context</h3><p>City-level inventory helps you choose with confidence.</p></div><div><span className="promise-number">02</span><Zap size={23} /><h3>Events, in motion</h3><p>Every order triggers a clear downstream journey.</p></div><div><span className="promise-number">03</span><ShieldCheck size={23} /><h3>No hidden surprises</h3><p>Price, delivery and availability stay visible.</p></div><div><span className="promise-number">04</span><Heart size={23} /><h3>Made for real life</h3><p>Useful picks for the way India actually shops.</p></div></div></section>

        <section className="newsletter-section container"><div><span className="tiny-label">Good things, occasionally</span><h2>A little note from Bazaarly.</h2><p>New drops, city-specific finds and price drops. No noise.</p></div><form onSubmit={event => { event.preventDefault(); toast.success("You're on the list", { description: "Watch your inbox for the good stuff." }); }}><input type="email" placeholder="Your email address" aria-label="Email address" required /><button className="primary-button" type="submit">Keep me posted <ArrowRight size={16} /></button></form></section>
        <section className="feedback-section container"><div><span className="tiny-label">Your voice matters</span><h2>Help us make Bazaarly better.</h2><p>Share a quick thought about shopping, delivery, or the products you want next.</p></div><button className="outline-button" onClick={() => setShowFeedback(true)}>Send feedback <Send size={16} /></button></section>
      </main>}

      <footer className="site-footer"><div className="container footer-inner"><div><Logo /><p>Everyday India, delivered with a little more care.</p></div><div className="footer-links"><span>About Bazaarly</span><span>Careers</span><span>Privacy</span><span>Terms</span><button onClick={() => setShowHelpDesk(true)}>Help Desk</button><button onClick={() => setShowFeedback(true)}>Feedback</button></div><div className="footer-credit">Aiven-powered demo<br /><span>PostgreSQL · Kafka · OpenSearch</span></div></div></footer>

      {showOrders && <div className="overlay"><div className="drawer orders-drawer"><div className="drawer-header"><div><span className="tiny-label">Your purchases</span><h2>My Orders</h2></div><button className="close-button" onClick={() => setShowOrders(false)}><X size={20} /></button></div>{!order ? <div className="cart-empty"><div className="empty-bag"><PackageCheck size={32} /></div><h3>No orders yet</h3><p>Your confirmed purchases will appear here.</p><button className="primary-button" onClick={() => setShowOrders(false)}>Start shopping</button></div> : <div className="orders-content"><div className="order-card-heading"><div><span className="tiny-label">Order #{order.id}</span><h3>{order.items.length} {order.items.length === 1 ? "product" : "products"}</h3></div><span className="order-status-pill"><Check size={13} /> Confirmed</span></div><p className="order-delivery-copy">Delivering to {order.customer.city}, {order.customer.state}</p><div className="order-items-list">{order.items.map(line => <button className="order-item-row" key={line.product.id} onClick={() => openTracking(line)}><img src={line.product.image} alt="" /><span><strong>{line.product.name}</strong><small>Qty {line.quantity} · {formatPrice(line.quantity * line.product.price)}</small><em>Tap to track delivery</em></span><ChevronRight size={17} /></button>)}</div><div className="orders-total"><span>Total paid</span><strong>{formatPrice(order.total)}</strong></div><div className="order-address"><MapPin size={16} /><span>{order.customer.name}<br />{order.customer.address}, {order.customer.city} · {order.customer.pin}</span></div></div>}</div></div>}

      {showCart && <div className="overlay"><div className="drawer cart-drawer"><div className="drawer-header"><div><span className="tiny-label">Your bag</span><h2>{cartCount} {cartCount === 1 ? "item" : "items"}</h2></div><button className="close-button" onClick={() => setShowCart(false)}><X size={20} /></button></div>{cart.length === 0 ? <div className="cart-empty"><div className="empty-bag"><ShoppingBag size={32} /></div><h3>Your bag is waiting</h3><p>Add something useful, delightful, or both.</p><button className="primary-button" onClick={() => setShowCart(false)}>Keep browsing</button></div> : <><div className="cart-lines">{cart.map(line => <div className="cart-line" key={line.product.id}><img src={line.product.image} alt="" /><div className="cart-line-info"><h3>{line.product.name}</h3><small>Delivering to {city}</small><strong>{formatPrice(line.product.price)}</strong><div className="quantity-control"><button onClick={() => updateQuantity(line.product.id, -1)}><Minus size={13} /></button><span>{line.quantity}</span><button onClick={() => updateQuantity(line.product.id, 1)}><Plus size={13} /></button><button className="remove-link" onClick={() => setCart(current => current.filter(item => item.product.id !== line.product.id))}>Remove</button></div></div></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div><span>Delivery</span><strong className="free-text">{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</strong></div><div className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><button className="primary-button wide" onClick={() => setShowCheckout(true)}>Proceed to checkout <ArrowRight size={16} /></button><p><ShieldCheck size={14} /> Secure checkout · Easy returns</p></div></>}</div></div>}

      {trackingProduct && <div className="overlay tracking-overlay"><div className="modal tracking-modal"><button className="close-button modal-close" onClick={() => setTrackingProduct(null)}><X size={20} /></button><span className="tiny-label">Track your order</span><h2>{trackingProduct.product.name}</h2><div className="tracking-product-head"><img src={trackingProduct.product.image} alt="" /><div><strong>Qty {trackingProduct.quantity}</strong><small>Order #{order?.id}</small><span className="tracking-current"><Check size={14} /> {trackingStatus}</span></div></div><div className="tracking-timeline">{deliveryStatuses.map((status, index) => <div className={`tracking-step ${index <= trackingStep ? "done" : ""}`} key={status}><span>{index <= trackingStep ? <Check size={14} /> : index === 1 ? <PackageCheck size={14} /> : index === 2 ? <Truck size={14} /> : <MapPin size={14} />}</span><div><strong>{status}</strong><small>{index === 0 ? "Your order has been confirmed" : index === 1 ? "Packed carefully at our fulfilment centre" : index === 2 ? `On the way to ${order?.customer.city}` : "Delivered to your doorstep"}</small></div></div>)}</div><div className="tracking-actions">{trackingStep < deliveryStatuses.length - 1 ? <button className="primary-button wide" onClick={advanceTracking}>Update delivery status <ArrowRight size={16} /></button> : <div className="delivered-banner"><Check size={17} /> Delivered successfully</div>}<button className="text-button" onClick={() => setTrackingProduct(null)}>Back to My Orders</button></div></div></div>}

      {showWishlist && <div className="overlay"><div className="drawer wishlist-drawer"><div className="drawer-header"><div><span className="tiny-label">Saved for later</span><h2>Wishlist</h2></div><button className="close-button" onClick={() => setShowWishlist(false)}><X size={20} /></button></div>{wishlistIds.length === 0 ? <div className="cart-empty"><div className="empty-bag"><Heart size={32} /></div><h3>Your wishlist is empty</h3><p>Tap a heart on anything you want to keep close.</p><button className="primary-button" onClick={() => setShowWishlist(false)}>Keep browsing</button></div> : <div className="wishlist-lines">{products.filter(product => wishlistIds.includes(product.id)).map(product => <div className="wishlist-line" key={product.id}><img src={product.image} alt="" /><div><strong>{product.name}</strong><small>{formatPrice(product.price)} · {product.rating} ★</small><button className="text-button" onClick={() => { setSelectedProduct(product); setShowWishlist(false); }}>View details <ArrowRight size={13} /></button></div><button className="wishlist saved" onClick={() => toggleWishlist(product)} aria-label={`Remove ${product.name}`}><Heart size={17} fill="currentColor" /></button></div>)}</div>}</div></div>}

      {selectedProduct && <div className="overlay"><div className="modal product-detail-modal"><button className="close-button modal-close" onClick={() => setSelectedProduct(null)}><X size={20} /></button><div className="detail-image" style={{ "--product-bg": selectedProduct.accent } as React.CSSProperties}><img src={selectedProduct.image} alt={selectedProduct.name} /><span className="product-badge">{selectedProduct.badge}</span></div><div className="detail-copy"><span className="tiny-label">{selectedProduct.category}</span><h2>{selectedProduct.name}</h2><div className="detail-rating"><Star size={15} fill="currentColor" /> {selectedProduct.rating} <span>({selectedProduct.reviews} reviews)</span></div><div className="detail-price"><strong>{formatPrice(selectedProduct.price)}</strong><s>{formatPrice(selectedProduct.mrp)}</s><span>{discount(selectedProduct)}% off</span></div><p>Thoughtfully picked for everyday India, with dependable delivery and city-smart stock visibility.</p><div className="detail-perks"><span><Truck size={16} /> Delivery by <strong>{selectedProduct.delivery}</strong></span><span><ShieldCheck size={16} /> Checked for {deliveryState}</span></div><div className="rate-product"><strong>Rate this product</strong><span>{[1, 2, 3, 4, 5].map(value => <button key={value} className={value <= (productRatings[selectedProduct.id] ?? 0) ? "rated" : ""} onClick={() => rateProduct(selectedProduct, value)} aria-label={`Rate ${value} stars`}><Star size={17} fill="currentColor" /></button>)}</span></div><div className="detail-actions"><button className={`wishlist ${wishlistIds.includes(selectedProduct.id) ? "saved" : ""}`} onClick={() => toggleWishlist(selectedProduct)}><Heart size={17} fill={wishlistIds.includes(selectedProduct.id) ? "currentColor" : "none"} /> {wishlistIds.includes(selectedProduct.id) ? "Saved" : "Save"}</button><button className="primary-button" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>Add to cart <Plus size={17} /></button></div></div></div></div>}

      {showLogin && <div className="overlay"><div className="modal login-modal"><button className="close-button modal-close" onClick={() => setShowLogin(false)}><X size={20} /></button><div className="login-art"><div className="login-orbit" /><div className="login-bag"><ShoppingBag size={42} /></div><span>Shop smart.<br /><strong>Live easy.</strong></span></div><div className="login-form"><Logo /><span className="tiny-label">Your Bazaarly account</span><h2>{loginStep === "phone" ? "Let’s get you in." : "Check your messages."}</h2><p>{loginStep === "phone" ? "Sign in to see your orders, saved picks and faster checkout." : `We sent a one-time code to ${phone}.`}</p>{loginStep === "phone" ? <><label>Mobile number or email<input value={phone} onChange={event => setPhone(event.target.value)} placeholder="e.g. 98765 43210" /></label><button className="primary-button wide" onClick={() => { if (!phone.trim()) return toast.error("Enter your mobile number or email"); setLoginStep("otp"); }}>Continue securely <ArrowRight size={16} /></button><small className="legal-copy">By continuing, you agree to Bazaarly’s Terms and Privacy Policy.</small></> : <><label>One-time password<input autoFocus inputMode="numeric" maxLength={6} placeholder="6-digit code" /></label><button className="primary-button wide" onClick={() => { setShowLogin(false); setLoginStep("phone"); toast.success("You’re signed in", { description: "Your Bazaarly account is ready." }); }}>Verify & continue <Check size={16} /></button><button className="back-link" onClick={() => setLoginStep("phone")}>Use a different number</button></>}</div></div></div>}

      {showCheckout && <div className="overlay"><div className="modal checkout-modal"><div className="drawer-header"><div><span className="tiny-label">Almost there</span><h2>Confirm your order</h2></div><button className="close-button" onClick={() => setShowCheckout(false)}><X size={20} /></button></div><div className="checkout-layout"><div className="checkout-form"><div className="checkout-step active"><span>1</span><div><strong>Delivery details</strong><small>Where should we bring it?</small></div></div><label>Full name<input placeholder="e.g. Aditi Rao" value={customerDetails.name} onChange={event => setCustomerDetails(current => ({ ...current, name: event.target.value }))} /></label><label>Phone number<input placeholder="10-digit mobile number" value={customerDetails.phone} onChange={event => setCustomerDetails(current => ({ ...current, phone: event.target.value }))} /></label><label>Address<input placeholder="Flat, building, street, area" value={customerDetails.address} onChange={event => setCustomerDetails(current => ({ ...current, address: event.target.value }))} /></label><div className="address-row"><label>City<input placeholder="Your city" value={customerDetails.city} onChange={event => setCustomerDetails(current => ({ ...current, city: event.target.value }))} /></label><label>State<select value={customerDetails.state} onChange={event => setCustomerDetails(current => ({ ...current, state: event.target.value }))}>{states.map(item => <option key={item}>{item}</option>)}</select></label></div><label>PIN code<input placeholder="400050" value={customerDetails.pin} onChange={event => setCustomerDetails(current => ({ ...current, pin: event.target.value }))} /></label><div className="checkout-step"><span>2</span><div><strong>Payment</strong><small>Choose how you would like to pay</small></div><WalletCards size={18} /></div><div className="payment-options">{[{ label: "UPI", detail: "Google Pay, PhonePe, Paytm", icon: Send }, { label: "Credit / Debit Card", detail: "Visa, Mastercard, RuPay", icon: CreditCard }, { label: "Wallets", detail: "Paytm Wallet, Amazon Pay", icon: WalletCards }, { label: "Cash on delivery", detail: "Pay when your order arrives", icon: Banknote }].map(option => { const Icon = option.icon; return <label className={`payment-option ${paymentMethod === option.label ? "selected" : ""}`} key={option.label}><input type="radio" name="payment" value={option.label} checked={paymentMethod === option.label} onChange={event => setPaymentMethod(event.target.value)} /><span className="payment-option-icon"><Icon size={17} /></span><span><strong>{option.label}</strong><small>{option.detail}</small></span><span className="payment-radio" /></label>; })}</div></div><div className="checkout-review"><span className="tiny-label">Order summary</span>{cart.map(line => <div className="review-line" key={line.product.id}><span>{line.quantity} × {line.product.name}</span><strong>{formatPrice(line.quantity * line.product.price)}</strong></div>)}<div className="review-divider" /><div className="review-line"><span>Delivery</span><strong className="free-text">FREE</strong></div><div className="review-total"><span>Total payable</span><strong>{formatPrice(total)}</strong></div><button className="primary-button wide" onClick={placeOrder} disabled={placingOrder}>{placingOrder ? <><Clock3 size={16} /> Placing order…</> : <>Place order <ArrowRight size={16} /></>}</button><small><ShieldCheck size={13} /> Your details are encrypted and safe.</small></div></div></div></div>}

      {showOrderConfirmation && order && <div className="overlay"><div className="modal order-confirmed-modal"><button className="close-button modal-close" onClick={() => setShowOrderConfirmation(false)}><X size={20} /></button><div className="success-icon"><Check size={31} /></div><span className="tiny-label">Order confirmed</span><h2>That’s a wrap.</h2><p>Order <strong>#{order.id}</strong> is confirmed and headed your way.</p><div className="confirmed-order-layout"><section className="confirmed-products"><div className="confirmed-section-heading"><div><span className="tiny-label">Ordered products</span><h3>Your Bazaarly picks</h3></div><span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span></div>{order.items.map(line => <div className="confirmed-product-line" key={line.product.id}><img src={line.product.image} alt="" /><div><strong>{line.product.name}</strong><small>Qty {line.quantity} · {formatPrice(line.product.price)} each</small></div><b>{formatPrice(line.quantity * line.product.price)}</b></div>)}<div className="confirmed-total"><span>Total payable</span><strong>{formatPrice(order.total)}</strong></div></section><section className="confirmed-customer"><div className="confirmed-section-heading"><div><span className="tiny-label">Delivering to</span><h3>{order.customer.city}, {order.customer.state}</h3></div><MapPin size={18} /></div><p><strong>{order.customer.name}</strong><br />{order.customer.phone}</p><p>{order.customer.address}<br />{order.customer.city}, {order.customer.state} · {order.customer.pin}</p><div className="delivery-note"><Truck size={16} /><span>Free delivery · arriving as promised</span></div></section></div><div className="success-actions"><button className="primary-button" onClick={() => setShowOrderConfirmation(false)}>Continue shopping <ArrowRight size={16} /></button><button className="text-button" onClick={() => { setShowOrderConfirmation(false); toast.info("Order tracking will be available soon."); }}>Track order</button></div></div></div>}

      {showHelpDesk && <div className="overlay"><div className="modal support-modal"><button className="close-button modal-close" onClick={() => setShowHelpDesk(false)}><X size={20} /></button><span className="eyebrow"><CircleHelp size={15} /> Bazaarly Help Desk</span><h2>How can we help?</h2><p>Quick answers for orders, payments, returns, and delivery.</p><div className="support-topics"><button onClick={() => toast.info("Open My Orders to see live delivery updates.")}><PackageCheck size={18} /><span><strong>Track an order</strong><small>See packing and delivery status</small></span><ChevronRight size={15} /></button><button onClick={() => toast.info("Most returns are accepted within 7 days.")}><ShieldCheck size={18} /><span><strong>Returns & refunds</strong><small>Understand our easy return policy</small></span><ChevronRight size={15} /></button><button onClick={() => toast.info("Payment support is available 9am–9pm.")}><CreditCard size={18} /><span><strong>Payment support</strong><small>UPI, cards, wallets, and COD</small></span><ChevronRight size={15} /></button></div><div className="support-contact"><strong>Still need a hand?</strong><span>Chat with our team or email care@bazaarly.in</span><button className="primary-button" onClick={() => { setShowHelpDesk(false); setShowFeedback(true); }}>Contact support <Send size={16} /></button></div></div></div>}

      {showFeedback && <div className="overlay"><div className="modal feedback-modal"><button className="close-button modal-close" onClick={() => setShowFeedback(false)}><X size={20} /></button><span className="tiny-label">Feedback</span><h2>Tell us what you think.</h2><p>Your feedback helps us make every Bazaarly delivery better.</p><div className="feedback-stars"><strong>How was your experience?</strong><span>{[1, 2, 3, 4, 5].map(value => <button key={value} className={value <= feedbackRating ? "rated" : ""} onClick={() => setFeedbackRating(value)} aria-label={`${value} stars`}><Star size={23} fill="currentColor" /></button>)}</span></div><textarea value={feedbackText} onChange={event => setFeedbackText(event.target.value)} placeholder="Tell us about your shopping experience..." rows={5} /><button className="primary-button wide" onClick={() => { setShowFeedback(false); setFeedbackText(""); toast.success("Feedback received", { description: "Thanks for helping us improve Bazaarly." }); }}><Send size={16} /> Send feedback</button></div></div>}

      {showPitch && <div className="overlay"><div className="modal pitch-modal"><button className="close-button modal-close" onClick={() => setShowPitch(false)}><X size={20} /></button><div className="pitch-hero"><span className="eyebrow"><span className="eyebrow-dot" /> The Bazaarly story</span><h2>Every click has a<br /><em>next chapter.</em></h2><p>From a city-aware browse to a confirmed delivery, here is what happens behind the simple storefront.</p></div><div className="story-flow"><div><b>01</b><strong>Browse</strong><small>Find a useful pick</small></div><ArrowRight size={16} /><div><b>02</b><strong>Buy</strong><small>Stock is checked live</small></div><ArrowRight size={16} /><div><b>03</b><strong>Deliver</strong><small>Every service reacts</small></div></div><div className="pitch-cards"><div><span className="pitch-icon postgres"><Database size={20} /></span><h3>PostgreSQL remembers.</h3><p>Products, customers, carts, orders and city-level stock stay durable and consistent.</p></div><div><span className="pitch-icon kafka"><Zap size={20} /></span><h3>Kafka keeps it moving.</h3><p>Order placed and inventory changed events let the store react without blocking the shopper.</p></div><div><span className="pitch-icon search"><Search size={20} /></span><h3>OpenSearch finds it.</h3><p>Fast, typo-tolerant search makes “bluetoth” a useful query, not a dead end.</p></div></div><div className="pitch-footer"><span><ShieldCheck size={16} /> Credentials stay in environment variables.</span><button className="primary-button" onClick={() => setShowPitch(false)}>Explore the store <ArrowRight size={16} /></button></div></div></div>}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><button className="active" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Store size={19} /><span>Home</span></button><button onClick={() => setShowPitch(true)}><Sparkles size={19} /><span>Play</span></button><button onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}><Gift size={19} /><span>Top Deals</span></button><button onClick={() => setShowLogin(true)}><UserRound size={19} /><span>Account</span></button><button onClick={() => setShowOrders(true)}><PackageCheck size={19} /><span>My Orders{order ? " · 1" : ""}</span></button></nav>
    </div>
  );
}
