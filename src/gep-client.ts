import { createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const GEP_ENDPOINT = process.env.GEP_ENDPOINT || "https://evomap.space/api/gep";
const NODE_ID_DIR = join(homedir(), ".evomap");
const NODE_ID_FILE = join(NODE_ID_DIR, "node_id");

export function getSenderId(): string {
  if (existsSync(NODE_ID_FILE)) {
    return readFileSync(NODE_ID_FILE, "utf-8").trim();
  }
  const id = "node_" + randomBytes(16).toString("hex");
  mkdirSync(NODE_ID_DIR, { recursive: true });
  writeFileSync(NODE_ID_FILE, id, "utf-8");
  return id;
}

export function computeAssetId(payload: unknown): string {
  const canonical = JSON.stringify(payload, Object.keys(payload as Record<string, unknown>).sort());
  return createHash("sha256").update(canonical).digest("hex");
}

interface GepEnvelope {
  protocol: "GEP";
  version: "0.1";
  sender_id: string;
  timestamp: string;
  intent: string;
  payload: unknown;
  signature: string;
}

function buildEnvelope(intent: string, payload: unknown): GepEnvelope {
  const envelope: GepEnvelope = {
    protocol: "GEP",
    version: "0.1",
    sender_id: getSenderId(),
    timestamp: new Date().toISOString(),
    intent,
    payload,
    signature: "none",
  };
  return envelope;
}

export async function gepRequest(intent: string, payload: unknown): Promise<unknown> {
  const envelope = buildEnvelope(intent, payload);
  const res = await fetch(GEP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envelope),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GEP request failed (${res.status}): ${text}`);
  }
  return res.json();
}
