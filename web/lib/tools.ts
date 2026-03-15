/* ═══════════════════════════════════════════════════════════════
   SAL Tool-Use Orchestration Engine
   SaintSal™ Labs · US Patent #10,290,222 HACP Protocol

   Per-vertical tool definitions + execution handlers.
   Each tool maps to a real external API call.
   ═══════════════════════════════════════════════════════════════ */

// ── Tool type matching Anthropic SDK ─────────────────────────

export interface ToolDef {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// ── Tool execution result ────────────────────────────────────

export interface ToolResult {
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

// ══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS PER VERTICAL
// ══════════════════════════════════════════════════════════════

const SEARCH_TOOLS: ToolDef[] = [
  {
    name: "exa_search",
    description: "Search the web using Exa AI for high-quality, semantically relevant results. Use for research, finding articles, documentation, company info, news.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        num_results: { type: "number", description: "Number of results (1-10, default 5)" },
        type: { type: "string", description: "Search type: 'neural' (semantic) or 'keyword' (exact match)", enum: ["neural", "keyword"] },
      },
      required: ["query"],
    },
  },
  {
    name: "tavily_search",
    description: "Search the web using Tavily for real-time news, current events, and factual data. Best for recent events and time-sensitive queries.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        search_depth: { type: "string", description: "'basic' for quick results, 'advanced' for comprehensive", enum: ["basic", "advanced"] },
        include_domains: { type: "array", items: { type: "string" }, description: "Only search these domains" },
      },
      required: ["query"],
    },
  },
];

const FINANCE_TOOLS: ToolDef[] = [
  {
    name: "get_stock_quote",
    description: "Get real-time stock quote data from Alpaca Markets. Returns latest price, change, volume for any US stock ticker.",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol (e.g. AAPL, TSLA, MSFT)" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_stock_bars",
    description: "Get historical price bars (OHLCV) for a stock. Use for trend analysis, charting data, price history.",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
        timeframe: { type: "string", description: "Bar timeframe: 1Day, 1Hour, 15Min, 1Week", enum: ["1Day", "1Hour", "15Min", "1Week"] },
        limit: { type: "number", description: "Number of bars (1-100, default 30)" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_crypto_price",
    description: "Get real-time cryptocurrency price from Coinbase. Supports BTC, ETH, SOL, and all major cryptos.",
    input_schema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Crypto symbol (e.g. BTC, ETH, SOL, DOGE)" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_market_snapshot",
    description: "Get a snapshot of major market indices and indicators: S&P 500, NASDAQ, DOW, VIX, 10Y Treasury, Oil, BTC.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  ...SEARCH_TOOLS,
];

const REALESTATE_TOOLS: ToolDef[] = [
  {
    name: "rentcast_property_value",
    description: "Get property valuation and rental estimate from RentCast. Provide an address to get estimated value, rent, and comps.",
    input_schema: {
      type: "object",
      properties: {
        address: { type: "string", description: "Full property address (e.g. '123 Main St, Irvine, CA 92618')" },
      },
      required: ["address"],
    },
  },
  {
    name: "rentcast_market_stats",
    description: "Get rental market statistics for a zip code or city. Returns median rent, vacancy rate, appreciation.",
    input_schema: {
      type: "object",
      properties: {
        zipCode: { type: "string", description: "5-digit ZIP code" },
        propertyType: { type: "string", description: "Property type filter", enum: ["Single Family", "Condo", "Townhouse", "Multi-Family", "Apartment"] },
      },
      required: ["zipCode"],
    },
  },
  ...SEARCH_TOOLS,
];

const CARDS_TOOLS: ToolDef[] = [
  {
    name: "search_cards",
    description: "Search for trading cards across eBay sold listings, Pokemon TCG database, and JustTCG. Returns prices, images, set info.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Card search query (e.g. 'Base Set Charizard', 'PSA 10 Pikachu')" },
      },
      required: ["query"],
    },
  },
  {
    name: "psa_cert_lookup",
    description: "Look up a PSA graded card by certification number. Returns grade, population, card details.",
    input_schema: {
      type: "object",
      properties: {
        cert_number: { type: "string", description: "PSA certification number" },
      },
      required: ["cert_number"],
    },
  },
  {
    name: "pokemon_tcg_search",
    description: "Search the Pokemon TCG database for card data, images, set info, and TCGplayer pricing. Best for Pokemon-specific queries.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Pokemon card name or search query" },
        set: { type: "string", description: "Optional: filter by set name (e.g. 'Base Set', 'Scarlet & Violet')" },
      },
      required: ["query"],
    },
  },
  ...SEARCH_TOOLS,
];

const NEWS_TOOLS: ToolDef[] = [...SEARCH_TOOLS];

const SPORTS_TOOLS: ToolDef[] = [...SEARCH_TOOLS];

const TECH_TOOLS: ToolDef[] = [...SEARCH_TOOLS];

const MEDICAL_TOOLS: ToolDef[] = [...SEARCH_TOOLS];

const CAREER_TOOLS: ToolDef[] = [...SEARCH_TOOLS];

const BIZPLAN_TOOLS: ToolDef[] = [...SEARCH_TOOLS];

const BIZCENTER_TOOLS: ToolDef[] = [...SEARCH_TOOLS];

const DOMAINS_TOOLS: ToolDef[] = [
  {
    name: "check_domain_availability",
    description: "Check if a domain name is available for registration using GoDaddy API. Returns availability and price.",
    input_schema: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Full domain name to check (e.g. 'example.com')" },
      },
      required: ["domain"],
    },
  },
  ...SEARCH_TOOLS,
];

// ── Vertical → Tools mapping ─────────────────────────────────

export function getToolsForVertical(vertical: string): ToolDef[] {
  switch (vertical) {
    case "search": return SEARCH_TOOLS;
    case "finance": return FINANCE_TOOLS;
    case "realestate": return REALESTATE_TOOLS;
    case "cards": return CARDS_TOOLS;
    case "news": return NEWS_TOOLS;
    case "sports": return SPORTS_TOOLS;
    case "tech": return TECH_TOOLS;
    case "medical": return MEDICAL_TOOLS;
    case "career": return CAREER_TOOLS;
    case "bizplan": return BIZPLAN_TOOLS;
    case "bizcenter": return BIZCENTER_TOOLS;
    case "domains": return DOMAINS_TOOLS;
    default: return SEARCH_TOOLS; // every vertical gets at least search
  }
}

// ══════════════════════════════════════════════════════════════
// TOOL EXECUTION HANDLERS
// ══════════════════════════════════════════════════════════════

/* ── Exa Search ─────────────────────────────────────────── */
async function executeExaSearch(input: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return JSON.stringify({ error: "Exa API key not configured" });

  try {
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        query: input.query,
        num_results: input.num_results || 5,
        type: input.type || "neural",
        use_autoprompt: true,
        contents: { text: { max_characters: 1500 }, highlights: true },
      }),
    });
    if (!res.ok) return JSON.stringify({ error: `Exa API error: ${res.status}` });
    const data = await res.json();
    const results = (data.results || []).map((r: Record<string, unknown>) => ({
      title: r.title,
      url: r.url,
      text: typeof r.text === "string" ? r.text.slice(0, 800) : "",
      highlights: r.highlights,
      published_date: r.published_date,
    }));
    return JSON.stringify({ results, autoprompt_string: data.autoprompt_string });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Exa search failed" });
  }
}

/* ── Tavily Search ──────────────────────────────────────── */
async function executeTavilySearch(input: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return JSON.stringify({ error: "Tavily API key not configured" });

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: input.query,
        search_depth: input.search_depth || "basic",
        include_domains: input.include_domains || [],
        max_results: 5,
        include_answer: true,
      }),
    });
    if (!res.ok) return JSON.stringify({ error: `Tavily API error: ${res.status}` });
    const data = await res.json();
    return JSON.stringify({
      answer: data.answer,
      results: (data.results || []).map((r: Record<string, unknown>) => ({
        title: r.title,
        url: r.url,
        content: typeof r.content === "string" ? r.content.slice(0, 800) : "",
        score: r.score,
      })),
    });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Tavily search failed" });
  }
}

/* ── Alpaca Stock Quote ─────────────────────────────────── */
async function executeStockQuote(input: Record<string, unknown>): Promise<string> {
  const keyId = process.env.ALPACA_API_KEY;
  const secret = process.env.ALPACA_SECRET_KEY;
  if (!keyId || !secret) return JSON.stringify({ error: "Alpaca API keys not configured" });

  const symbol = String(input.symbol).toUpperCase();
  try {
    // Get latest trade + snapshot
    const [tradeRes, snapshotRes] = await Promise.all([
      fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/trades/latest`, {
        headers: { "APCA-API-KEY-ID": keyId, "APCA-API-SECRET-KEY": secret },
      }),
      fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/snapshot`, {
        headers: { "APCA-API-KEY-ID": keyId, "APCA-API-SECRET-KEY": secret },
      }),
    ]);

    const trade = tradeRes.ok ? await tradeRes.json() : null;
    const snapshot = snapshotRes.ok ? await snapshotRes.json() : null;

    const price = trade?.trade?.p || snapshot?.latestTrade?.p;
    const prevClose = snapshot?.prevDailyBar?.c;
    const change = price && prevClose ? ((price - prevClose) / prevClose * 100).toFixed(2) : null;
    const volume = snapshot?.dailyBar?.v;
    const high = snapshot?.dailyBar?.h;
    const low = snapshot?.dailyBar?.l;
    const open = snapshot?.dailyBar?.o;

    return JSON.stringify({
      symbol,
      price: price ? `$${price.toFixed(2)}` : "unavailable",
      change: change ? `${Number(change) > 0 ? "+" : ""}${change}%` : null,
      open: open ? `$${open.toFixed(2)}` : null,
      high: high ? `$${high.toFixed(2)}` : null,
      low: low ? `$${low.toFixed(2)}` : null,
      volume: volume ? volume.toLocaleString() : null,
      prev_close: prevClose ? `$${prevClose.toFixed(2)}` : null,
      timestamp: trade?.trade?.t || new Date().toISOString(),
    });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Stock quote failed" });
  }
}

/* ── Alpaca Stock Bars ──────────────────────────────────── */
async function executeStockBars(input: Record<string, unknown>): Promise<string> {
  const keyId = process.env.ALPACA_API_KEY;
  const secret = process.env.ALPACA_SECRET_KEY;
  if (!keyId || !secret) return JSON.stringify({ error: "Alpaca API keys not configured" });

  const symbol = String(input.symbol).toUpperCase();
  const timeframe = String(input.timeframe || "1Day");
  const limit = Math.min(Number(input.limit) || 30, 100);

  try {
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}&limit=${limit}&sort=desc`,
      { headers: { "APCA-API-KEY-ID": keyId, "APCA-API-SECRET-KEY": secret } }
    );
    if (!res.ok) return JSON.stringify({ error: `Alpaca bars API error: ${res.status}` });
    const data = await res.json();

    const bars = (data.bars || []).map((b: Record<string, unknown>) => ({
      time: b.t,
      open: b.o,
      high: b.h,
      low: b.l,
      close: b.c,
      volume: b.v,
    }));

    return JSON.stringify({ symbol, timeframe, bars });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Stock bars failed" });
  }
}

/* ── Crypto Price (Coinbase) ────────────────────────────── */
async function executeCryptoPrice(input: Record<string, unknown>): Promise<string> {
  const symbol = String(input.symbol).toUpperCase();
  try {
    const [spotRes, buyRes] = await Promise.all([
      fetch(`https://api.coinbase.com/v2/prices/${symbol}-USD/spot`),
      fetch(`https://api.coinbase.com/v2/prices/${symbol}-USD/buy`),
    ]);
    const spot = spotRes.ok ? await spotRes.json() : null;
    const buy = buyRes.ok ? await buyRes.json() : null;

    return JSON.stringify({
      symbol,
      price: spot?.data?.amount ? `$${parseFloat(spot.data.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "unavailable",
      buy_price: buy?.data?.amount ? `$${parseFloat(buy.data.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : null,
      currency: "USD",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Crypto price failed" });
  }
}

/* ── Market Snapshot (Alpaca + Coinbase) ────────────────── */
async function executeMarketSnapshot(): Promise<string> {
  const keyId = process.env.ALPACA_API_KEY;
  const secret = process.env.ALPACA_SECRET_KEY;

  const results: Record<string, unknown> = {};

  try {
    // Fetch BTC from Coinbase
    const btcRes = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
    if (btcRes.ok) {
      const btcData = await btcRes.json();
      results.BTC = `$${parseFloat(btcData?.data?.amount || "0").toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }

    // Fetch ETH
    const ethRes = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot");
    if (ethRes.ok) {
      const ethData = await ethRes.json();
      results.ETH = `$${parseFloat(ethData?.data?.amount || "0").toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }

    // Fetch stock tickers via Alpaca
    if (keyId && secret) {
      const tickers = ["SPY", "QQQ", "DIA", "VIX"];
      const snapshots = await Promise.allSettled(
        tickers.map((t) =>
          fetch(`https://data.alpaca.markets/v2/stocks/${t}/snapshot`, {
            headers: { "APCA-API-KEY-ID": keyId, "APCA-API-SECRET-KEY": secret },
          }).then((r) => r.ok ? r.json() : null)
        )
      );

      const labels = ["SPY (S&P 500)", "QQQ (NASDAQ)", "DIA (DOW)", "VIX"];
      snapshots.forEach((s, i) => {
        if (s.status === "fulfilled" && s.value) {
          const price = s.value.latestTrade?.p || s.value.dailyBar?.c;
          const prevClose = s.value.prevDailyBar?.c;
          const change = price && prevClose ? ((price - prevClose) / prevClose * 100).toFixed(2) : null;
          results[labels[i]] = {
            price: price ? `$${price.toFixed(2)}` : "unavailable",
            change: change ? `${Number(change) > 0 ? "+" : ""}${change}%` : null,
          };
        }
      });
    }

    results.timestamp = new Date().toISOString();
    return JSON.stringify(results);
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Market snapshot failed" });
  }
}

/* ── RentCast Property Value ────────────────────────────── */
async function executeRentcastPropertyValue(input: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) return JSON.stringify({ error: "RentCast API key not configured" });

  try {
    const address = encodeURIComponent(String(input.address));
    const res = await fetch(
      `https://api.rentcast.io/v1/avm/value?address=${address}`,
      { headers: { "X-Api-Key": apiKey, "Accept": "application/json" } }
    );
    if (!res.ok) return JSON.stringify({ error: `RentCast API error: ${res.status}` });
    const data = await res.json();

    return JSON.stringify({
      address: data.formattedAddress || input.address,
      estimated_value: data.price ? `$${data.price.toLocaleString()}` : null,
      value_range: data.priceRangeLow && data.priceRangeHigh
        ? `$${data.priceRangeLow.toLocaleString()} - $${data.priceRangeHigh.toLocaleString()}`
        : null,
      rent_estimate: data.rent ? `$${data.rent.toLocaleString()}/mo` : null,
      rent_range: data.rentRangeLow && data.rentRangeHigh
        ? `$${data.rentRangeLow.toLocaleString()} - $${data.rentRangeHigh.toLocaleString()}/mo`
        : null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sqft: data.squareFootage,
      lot_size: data.lotSize,
      year_built: data.yearBuilt,
      property_type: data.propertyType,
      county: data.county,
      last_sold_date: data.lastSaleDate,
      last_sold_price: data.lastSalePrice ? `$${data.lastSalePrice.toLocaleString()}` : null,
    });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "RentCast lookup failed" });
  }
}

/* ── RentCast Market Stats ──────────────────────────────── */
async function executeRentcastMarketStats(input: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) return JSON.stringify({ error: "RentCast API key not configured" });

  try {
    const zipCode = String(input.zipCode);
    const propertyType = input.propertyType ? `&propertyType=${encodeURIComponent(String(input.propertyType))}` : "";
    const res = await fetch(
      `https://api.rentcast.io/v1/markets?zipCode=${zipCode}${propertyType}`,
      { headers: { "X-Api-Key": apiKey, "Accept": "application/json" } }
    );
    if (!res.ok) return JSON.stringify({ error: `RentCast market API error: ${res.status}` });
    const data = await res.json();

    return JSON.stringify({
      zip_code: zipCode,
      median_rent: data.medianRent ? `$${data.medianRent.toLocaleString()}/mo` : null,
      average_rent: data.averageRent ? `$${data.averageRent.toLocaleString()}/mo` : null,
      median_value: data.medianPrice ? `$${data.medianPrice.toLocaleString()}` : null,
      rent_to_value: data.rentToValueRatio ? `${(data.rentToValueRatio * 100).toFixed(2)}%` : null,
      vacancy_rate: data.vacancyRate ? `${(data.vacancyRate * 100).toFixed(1)}%` : null,
      total_listings: data.totalListings,
      property_type: input.propertyType || "All",
    });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "RentCast market stats failed" });
  }
}

/* ── Card Search (eBay + PokemonTCG + JustTCG) ─────────── */
async function executeCardSearch(input: Record<string, unknown>): Promise<string> {
  const query = String(input.query);

  try {
    const res = await fetch(`${getBaseUrl()}/api/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, type: "search" }),
    });
    if (!res.ok) return JSON.stringify({ error: `Card search error: ${res.status}` });
    const data = await res.json();
    // Truncate to avoid huge tool results
    const results = (data.results || []).slice(0, 8).map((r: Record<string, unknown>) => ({
      name: r.name,
      source: r.source,
      set: r.set,
      price: r.price,
      priceRange: r.priceRange,
      grade: r.grade,
      rarity: r.rarity,
      url: r.url,
    }));
    return JSON.stringify({ results, sources: data.sources, count: data.count });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Card search failed" });
  }
}

/* ── PSA Cert Lookup ────────────────────────────────────── */
async function executePSACertLookup(input: Record<string, unknown>): Promise<string> {
  const certNumber = String(input.cert_number);
  try {
    const res = await fetch(`${getBaseUrl()}/api/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certNumber, type: "psa" }),
    });
    if (!res.ok) return JSON.stringify({ error: `PSA lookup error: ${res.status}` });
    const data = await res.json();
    return JSON.stringify(data);
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "PSA lookup failed" });
  }
}

/* ── Pokemon TCG Search ─────────────────────────────────── */
async function executePokemonTCGSearch(input: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.POKEMON_TCG_API_KEY;
  if (!apiKey) return JSON.stringify({ error: "Pokemon TCG API key not configured" });

  const query = String(input.query);
  const setFilter = input.set ? ` set.name:"${input.set}"` : "";

  try {
    const searchQ = encodeURIComponent(`name:"${query}"${setFilter}`);
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${searchQ}&pageSize=8&orderBy=-set.releaseDate`,
      { headers: { "X-Api-Key": apiKey } }
    );
    if (!res.ok) return JSON.stringify({ error: `Pokemon TCG API error: ${res.status}` });
    const data = await res.json();

    const cards = (data.data || []).map((card: Record<string, unknown>) => {
      const prices = card.tcgplayer as Record<string, unknown> | undefined;
      const priceData = prices?.prices as Record<string, Record<string, number>> | undefined;
      const market = priceData?.holofoil?.market || priceData?.normal?.market || priceData?.reverseHolofoil?.market;
      const set = card.set as Record<string, string> | undefined;

      return {
        name: card.name,
        set: set?.name,
        number: card.number,
        rarity: card.rarity,
        market_price: market ? `$${market.toFixed(2)}` : null,
        tcgplayer_url: (prices as Record<string, string>)?.url,
      };
    });

    return JSON.stringify({ cards, total_count: data.totalCount });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Pokemon TCG search failed" });
  }
}

/* ── GoDaddy Domain Check ───────────────────────────────── */
async function executeDomainCheck(input: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  if (!apiKey || !apiSecret) return JSON.stringify({ error: "GoDaddy API keys not configured" });

  const domain = String(input.domain);
  try {
    const res = await fetch(
      `https://api.godaddy.com/v1/domains/available?domain=${encodeURIComponent(domain)}`,
      { headers: { "Authorization": `sso-key ${apiKey}:${apiSecret}` } }
    );
    if (!res.ok) return JSON.stringify({ error: `GoDaddy API error: ${res.status}` });
    const data = await res.json();

    return JSON.stringify({
      domain: data.domain,
      available: data.available,
      price: data.price ? `$${(data.price / 1000000).toFixed(2)}` : null,
      currency: data.currency,
      definitive: data.definitive,
    });
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Domain check failed" });
  }
}

// ── Helper: get base URL for internal API calls ──────────

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// ══════════════════════════════════════════════════════════════
// TOOL EXECUTOR — routes tool_name → handler
// ══════════════════════════════════════════════════════════════

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    // Search
    case "exa_search": return executeExaSearch(toolInput);
    case "tavily_search": return executeTavilySearch(toolInput);

    // Finance
    case "get_stock_quote": return executeStockQuote(toolInput);
    case "get_stock_bars": return executeStockBars(toolInput);
    case "get_crypto_price": return executeCryptoPrice(toolInput);
    case "get_market_snapshot": return executeMarketSnapshot();

    // Real Estate
    case "rentcast_property_value": return executeRentcastPropertyValue(toolInput);
    case "rentcast_market_stats": return executeRentcastMarketStats(toolInput);

    // Cards
    case "search_cards": return executeCardSearch(toolInput);
    case "psa_cert_lookup": return executePSACertLookup(toolInput);
    case "pokemon_tcg_search": return executePokemonTCGSearch(toolInput);

    // Domains
    case "check_domain_availability": return executeDomainCheck(toolInput);

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
