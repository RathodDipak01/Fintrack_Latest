/** Broker integrations planned for live API sync (Zerodha Kite, Angel SmartAPI, Groww, Upstox). */
export type BrokerId = "zerodha" | "angel_one" | "groww" | "upstox";

export type BrokerInfo = {
  id: BrokerId;
  name: string;
  short: string;
  apiNote: string;
};

export const BROKERS: BrokerInfo[] = [
  {
    id: "zerodha",
    name: "Zerodha",
    short: "Kite Connect — OAuth + holdings & positions APIs.",
    apiNote: "Requires Kite Connect app registration and per-user login consent."
  },
  {
    id: "angel_one",
    name: "Angel One",
    short: "SmartAPI (Angel Broking) for portfolio and order endpoints.",
    apiNote: "Uses API key + TOTP flow per Angel One documentation."
  },
  {
    id: "groww",
    name: "Groww",
    short: "Connect when official partner APIs are available for your account type.",
    apiNote: "Integration depends on Groww’s published access; may use statement export as fallback."
  },
  {
    id: "upstox",
    name: "Upstox",
    short: "Developer API with OAuth for holdings and funds.",
    apiNote: "Requires Upstox developer app and user authorization."
  }
];

export type ParsedHolding = {
  symbol: string;
  name?: string;
  qty: number;
  avgCost: number;
  productType?: string;
  currentPrice?: number;
};

function splitCsvLine(line: string): string[] {
  const parts: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && (c === "," || c === "\t" || c === ";")) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  parts.push(cur.trim());
  return parts.map((p) => p.replace(/^"|"$/g, ""));
}

function looksLikeHeader(cells: string[]): boolean {
  const joined = cells.join(" ").toLowerCase();
  return /symbol|instrument|ticker|product|qty|quantity|avg|average|cost|ltp|name|company/.test(joined);
}

/**
 * Best-effort CSV / TSV parse for holdings export (symbol, qty, average cost, optional LTP & name).
 */
export function parseHoldingsCsv(raw: string): { holdings: ParsedHolding[]; errors: string[] } {
  const errors: string[] = [];
  const lines = raw
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { holdings: [], errors: ["No rows found"] };
  }

  const first = splitCsvLine(lines[0]);
  const hasHeader = looksLikeHeader(first);
  const headerRow = hasHeader ? first.map((h) => h.toLowerCase()) : null;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const idx = (pred: (h: string) => boolean): number => {
    if (!headerRow) return -1;
    return headerRow.findIndex(pred);
  };

  let colSymbol = idx((h) => h.includes("symbol") || h.includes("instrument") || h.includes("ticker") || h.includes("scrip"));
  let colProduct = idx((h) => h.includes("product") || h.includes("type"));
  let colQty = idx((h) => h.includes("qty") || h.includes("quantity") || h.includes("units"));
  let colAvg = idx((h) =>
    /avg|average\s*cost|buy\s*price|purchase|cost\s*price|avg\./i.test(h)
  );
  let colLtp = idx((h) =>
    /\bltp\b|last|current|close|cmp|market\s*price/i.test(h)
  );
  let colName = idx((h) => /^(name|company|stock\s*name)$/i.test(h) || (h.includes("name") && !h.includes("user")));

  if (!hasHeader) {
    colSymbol = 0;
    colQty = 1;
    colAvg = 2;
    colLtp = 3;
    colName = -1;
  }

  if (colSymbol < 0) {
    errors.push("Could not detect a Symbol/Instrument column. Use a header row.");
    return { holdings: [], errors };
  }

  const holdings: ParsedHolding[] = [];
  dataLines.forEach((line, i) => {
    const cells = splitCsvLine(line);
    if (cells.length < 2) {
      errors.push(`Row ${i + 1 + (hasHeader ? 1 : 0)}: not enough columns`);
      return;
    }
    const sym = (cells[colSymbol] ?? "").toUpperCase().replace(/\s+/g, "");
    if (!sym || !/^[A-Z0-9.&-]+$/.test(sym)) {
      errors.push(`Row ${i + 1 + (hasHeader ? 1 : 0)}: invalid symbol/instrument "${cells[colSymbol]}"`);
      return;
    }

    const productType = colProduct >= 0 ? cells[colProduct] : undefined;
    const qtyRaw = colQty >= 0 ? cells[colQty] : cells[1];
    const avgRaw = colAvg >= 0 ? cells[colAvg] : cells[2];

    const qty = Number(String(qtyRaw).replace(/,/g, ""));
    const avgCost = Number(String(avgRaw).replace(/[₹,]/g, ""));

    if (!Number.isFinite(qty)) {
      errors.push(`Row ${i + 1 + (hasHeader ? 1 : 0)}: invalid quantity`);
      return;
    }
    if (!Number.isFinite(avgCost) || avgCost < 0) {
      errors.push(`Row ${i + 1 + (hasHeader ? 1 : 0)}: invalid average cost`);
      return;
    }

    const ltpRaw = colLtp >= 0 ? cells[colLtp] : undefined;
    const currentPrice =
      ltpRaw !== undefined && ltpRaw !== ""
        ? Number(String(ltpRaw).replace(/[₹,]/g, ""))
        : undefined;

    const name =
      colName >= 0 && cells[colName]
        ? cells[colName]
        : undefined;

    holdings.push({
      symbol: sym,
      name,
      qty,
      avgCost,
      productType,
      currentPrice: Number.isFinite(currentPrice) ? currentPrice : undefined
    });
  });

  if (holdings.length === 0 && errors.length === 0) {
    errors.push("No valid holdings parsed");
  }

  return { holdings, errors };
}

export const SAMPLE_CSV = `Product,Instrument,Qty.,Avg.,LTP,P&L,Chg.
CNC,ADANIENT,2,2040.85,2043.8,5.9,0.14
CNC,CDSL,3,1284,1287.4,10.2,0.26
MIS,EIEL,0,0,171.08,54.0,0.0
`;
