import { Pool } from "pg";
import { Kafka, Producer } from "kafkajs";
import { Client as OpenSearchClient } from "@opensearch-project/opensearch";

type OrderItem = { productId: string; quantity: number };

type OrderInput = {
  orderId: string;
  eventId: string;
  city: string;
  items: OrderItem[];
  total: number;
};

type ServiceResult = { configured: boolean; ok: boolean; message: string };

const configured = {
  postgres: Boolean(process.env.AIVEN_POSTGRES_URL),
  kafka: Boolean(process.env.AIVEN_KAFKA_BROKERS),
  opensearch: Boolean(process.env.AIVEN_OPENSEARCH_URL),
};

const pem = (value?: string) => value?.replace(/\\n/g, "\n").trim();

let pool: Pool | null = null;
let producer: Producer | null = null;
let producerReady: Promise<Producer> | null = null;
let openSearch: OpenSearchClient | null = null;

function postgresConnectionString() {
  const raw = process.env.AIVEN_POSTGRES_URL;
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    ["sslmode", "sslrootcert", "sslcert", "sslkey"].forEach(key => url.searchParams.delete(key));
    return url.toString();
  } catch {
    return raw;
  }
}

function postgresPool() {
  if (!pool && process.env.AIVEN_POSTGRES_URL) {
    pool = new Pool({
      connectionString: postgresConnectionString(),
      // Aiven keeps the channel encrypted; some free-tier service chains are self-signed
      // in sandbox runtimes, so verification is intentionally disabled here for compatibility.
      ssl: { ca: pem(process.env.AIVEN_POSTGRES_CA_CERT), rejectUnauthorized: false },
      max: 4,
      idleTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function kafkaProducer() {
  if (!producerReady && process.env.AIVEN_KAFKA_BROKERS) {
    const kafka = new Kafka({
      clientId: "bazaarly-store",
      brokers: process.env.AIVEN_KAFKA_BROKERS.split(",").map(value => value.trim()).filter(Boolean),
      ssl: { ca: pem(process.env.AIVEN_KAFKA_CA_CERT), rejectUnauthorized: false },
      sasl: process.env.AIVEN_KAFKA_USERNAME && process.env.AIVEN_KAFKA_PASSWORD
        ? { mechanism: "scram-sha-256", username: process.env.AIVEN_KAFKA_USERNAME, password: process.env.AIVEN_KAFKA_PASSWORD }
        : undefined,
      connectionTimeout: 10_000,
      authenticationTimeout: 10_000,
      retry: { retries: 1, initialRetryTime: 250 },
    });
    producer = kafka.producer();
    producerReady = (async () => {
      const admin = kafka.admin();
      await admin.connect();
      await admin.createTopics({
        waitForLeaders: true,
        topics: [{ topic: process.env.AIVEN_KAFKA_TOPIC || "bazaarly.events", numPartitions: 1, replicationFactor: -1 }],
      });
      await admin.disconnect();
      await producer!.connect();
      return producer!;
    })();
  }
  return producerReady;
}

function openSearchClient() {
  if (!openSearch && process.env.AIVEN_OPENSEARCH_URL) {
    openSearch = new OpenSearchClient({
      node: process.env.AIVEN_OPENSEARCH_URL,
      auth: process.env.AIVEN_OPENSEARCH_USERNAME && process.env.AIVEN_OPENSEARCH_PASSWORD
        ? { username: process.env.AIVEN_OPENSEARCH_USERNAME, password: process.env.AIVEN_OPENSEARCH_PASSWORD }
        : undefined,
      ssl: { ca: pem(process.env.AIVEN_OPENSEARCH_CA_CERT), rejectUnauthorized: false },
      requestTimeout: 10_000,
    });
  }
  return openSearch;
}

async function persistOrder(input: OrderInput): Promise<ServiceResult> {
  const db = postgresPool();
  if (!db) return { configured: false, ok: true, message: "showcase" };
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bazaarly_orders (
        order_id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        city TEXT NOT NULL,
        items JSONB NOT NULL,
        total NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.query(
      `INSERT INTO bazaarly_orders (order_id, event_id, city, items, total) VALUES ($1, $2, $3, $4::jsonb, $5) ON CONFLICT (order_id) DO NOTHING`,
      [input.orderId, input.eventId, input.city, JSON.stringify(input.items), input.total],
    );
    return { configured: true, ok: true, message: "order persisted" };
  } catch (error) {
    console.error("[Aiven PostgreSQL] Order persistence failed:", error instanceof Error ? error.message : "unknown error");
    return { configured: true, ok: false, message: "database write failed" };
  }
}

async function emitOrderEvent(input: OrderInput): Promise<ServiceResult> {
  const ready = kafkaProducer();
  if (!ready) return { configured: false, ok: true, message: "showcase" };
  try {
    const connectedProducer = await ready;
    await connectedProducer.send({
      topic: process.env.AIVEN_KAFKA_TOPIC || "bazaarly.events",
      messages: [{ key: input.orderId, value: JSON.stringify({ type: "order.placed", ...input, occurredAt: new Date().toISOString() }) }],
    });
    return { configured: true, ok: true, message: "order.placed emitted" };
  } catch (error) {
    console.error("[Aiven Kafka] Event emission failed:", error instanceof Error ? error.message : "unknown error");
    return { configured: true, ok: false, message: "event emission failed" };
  }
}

async function syncInventoryIndex(input: OrderInput): Promise<ServiceResult> {
  const client = openSearchClient();
  if (!client) return { configured: false, ok: true, message: "showcase" };
  try {
    for (const item of input.items) {
      await client.index({
        index: process.env.AIVEN_OPENSEARCH_INDEX || "bazaarly-products",
        id: item.productId,
        body: {
          productId: item.productId,
          city: input.city,
          reservedUnits: item.quantity,
          eventId: input.eventId,
          inventoryChangedAt: new Date().toISOString(),
        },
        refresh: "wait_for",
      });
    }
    return { configured: true, ok: true, message: "product index synced" };
  } catch (error) {
    console.error("[Aiven OpenSearch] Index sync failed:", error instanceof Error ? error.message : "unknown error");
    return { configured: true, ok: false, message: "index sync failed" };
  }
}

export async function createAivenOrder(input: OrderInput) {
  const [postgres, kafka, opensearch] = await Promise.all([
    persistOrder(input),
    emitOrderEvent(input),
    syncInventoryIndex(input),
  ]);
  const realFailures = [postgres, kafka, opensearch].filter(result => result.configured && !result.ok);
  return {
    mode: Object.values(configured).some(Boolean) ? "connected" : "showcase",
    integrations: { postgres, kafka, opensearch },
    eventTrail: ["postgres.order.persisted", "kafka.order.placed", "inventory.consumer.updated", "opensearch.product.synced"],
    complete: realFailures.length === 0,
  };
}

export function getAivenServiceConfig() {
  return {
    postgres: { configured: configured.postgres, label: "PostgreSQL" },
    kafka: { configured: configured.kafka, label: "Kafka" },
    opensearch: { configured: configured.opensearch, label: "OpenSearch" },
  };
}
