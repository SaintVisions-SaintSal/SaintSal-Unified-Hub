export const runtime = "edge";
export const maxDuration = 30;

/* ── Card Collector API ──────────────────────────────────
   Aggregates pricing & grading data from:
   • eBay Finding API (live sold/listed prices)
   • Pokemon TCG API (card data, images, pricing)
   • PSA Cert Verification (grading lookup)
   • JustTCG API (market pricing)
   ───────────────────────────────────────────────────────── */

const EBAY_APP_ID = process.env.EBAY_APP_ID || "";
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY || "";
const PSA_API_KEY = process.env.PSA_API_KEY || "";
const JUSTTCG_API_KEY = process.env.JUSTTCG_API_KEY || "";

interface CardResult {
  source: string;
  name: string;
  set?: string;
  number?: string;
  rarity?: string;
  image?: string;
  price?: number;
  priceRange?: { low: number; high: number };
  grade?: string;
  gradeCompany?: string;
  url?: string;
  lastSold?: string;
  population?: number;
}

/* ── eBay Finding API ────────────────────────────── */
async function searchEbay(query: string, signal: AbortSignal): Promise<CardResult[]> {
  if (!EBAY_APP_ID) return [];
  try {
    const params = new URLSearchParams({
      "OPERATION-NAME": "findCompletedItems",
      "SERVICE-VERSION": "1.0.0",
      "SECURITY-APPNAME": EBAY_APP_ID,
      "RESPONSE-DATA-FORMAT": "JSON",
      "REST-PAYLOAD": "",
      "keywords": query,
      "categoryId": "183454", // Trading Card Singles
      "sortOrder": "PricePlusShippingHighest",
      "paginationInput.entriesPerPage": "12",
      "itemFilter(0).name": "SoldItemsOnly",
      "itemFilter(0).value": "true",
    });

    const res = await fetch(
      `https://svcs.ebay.com/services/search/FindingService/v1?${params}`,
      { signal, headers: { "Accept": "application/json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    const items = data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];
    return items.slice(0, 12).map((item: Record<string, unknown[]>) => ({
      source: "ebay",
      name: String((item.title as string[])?.[0] || ""),
      image: String((item.galleryURL as string[])?.[0] || ""),
      price: parseFloat(
        String(
          ((item.sellingStatus as Record<string, unknown[]>[])?.[0]?.currentPrice as Record<string, string>[])?.[0]?.["__value__"] || "0"
        )
      ),
      url: String((item.viewItemURL as string[])?.[0] || ""),
      lastSold: String(
        ((item.listingInfo as Record<string, string[]>[])?.[0]?.endTime)?.[0] || ""
      ),
    }));
  } catch {
    return [];
  }
}

/* ── Pokemon TCG API ─────────────────────────────── */
async function searchPokemonTCG(query: string, signal: AbortSignal): Promise<CardResult[]> {
  if (!POKEMON_TCG_API_KEY) return [];
  try {
    const searchQ = encodeURIComponent(`name:"${query}"`);
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${searchQ}&pageSize=12&orderBy=-set.releaseDate`,
      { signal, headers: { "X-Api-Key": POKEMON_TCG_API_KEY } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.data || []).map((card: Record<string, unknown>) => {
      const prices = card.tcgplayer as Record<string, unknown> | undefined;
      const market = (prices?.prices as Record<string, Record<string, number>>)?.holofoil?.market
        || (prices?.prices as Record<string, Record<string, number>>)?.normal?.market
        || (prices?.prices as Record<string, Record<string, number>>)?.reverseHolofoil?.market;
      const low = (prices?.prices as Record<string, Record<string, number>>)?.holofoil?.low
        || (prices?.prices as Record<string, Record<string, number>>)?.normal?.low;
      const high = (prices?.prices as Record<string, Record<string, number>>)?.holofoil?.high
        || (prices?.prices as Record<string, Record<string, number>>)?.normal?.high;
      const images = card.images as Record<string, string> | undefined;
      const set = card.set as Record<string, string> | undefined;

      return {
        source: "pokemontcg",
        name: String(card.name || ""),
        set: String(set?.name || ""),
        number: String(card.number || ""),
        rarity: String(card.rarity || ""),
        image: images?.large || images?.small || "",
        price: market || undefined,
        priceRange: low && high ? { low, high } : undefined,
        url: String((prices as Record<string, string>)?.url || ""),
      };
    });
  } catch {
    return [];
  }
}

/* ── PSA Cert Verification ───────────────────────── */
async function lookupPSA(certNumber: string, signal: AbortSignal): Promise<CardResult | null> {
  if (!PSA_API_KEY || !certNumber) return null;
  try {
    const res = await fetch(
      `https://api.psacard.com/publicapi/cert/GetByCertNumber/${certNumber}`,
      { signal, headers: { "Authorization": `bearer ${PSA_API_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cert = data?.PSACert;
    if (!cert) return null;

    return {
      source: "psa",
      name: String(cert.Subject || cert.CardDescription || ""),
      set: String(cert.Brand || ""),
      number: String(cert.CardNumber || ""),
      grade: String(cert.CardGrade || ""),
      gradeCompany: "PSA",
      population: cert.TotalPopulation ? Number(cert.TotalPopulation) : undefined,
      url: `https://www.psacard.com/cert/${certNumber}`,
    };
  } catch {
    return null;
  }
}

/* ── JustTCG Pricing ─────────────────────────────── */
async function searchJustTCG(query: string, signal: AbortSignal): Promise<CardResult[]> {
  if (!JUSTTCG_API_KEY) return [];
  try {
    const res = await fetch(
      `https://api.justtcg.com/v1/search?q=${encodeURIComponent(query)}&limit=12`,
      { signal, headers: { "Authorization": `Bearer ${JUSTTCG_API_KEY}`, "Accept": "application/json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.results || data.data || []).slice(0, 12).map((item: Record<string, unknown>) => ({
      source: "justtcg",
      name: String(item.name || item.title || ""),
      set: String(item.set || item.setName || ""),
      price: item.price ? Number(item.price) : item.marketPrice ? Number(item.marketPrice) : undefined,
      image: String(item.image || item.imageUrl || ""),
      url: String(item.url || item.link || ""),
    }));
  } catch {
    return [];
  }
}

/* ── POST handler ────────────────────────────────── */
export async function POST(req: Request) {
  try {
    const { query, type = "search", certNumber } = await req.json();

    if (!query?.trim() && !certNumber) {
      return Response.json({ error: "query or certNumber required" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      // PSA cert lookup
      if (type === "psa" && certNumber) {
        const result = await lookupPSA(certNumber, controller.signal);
        clearTimeout(timeout);
        return Response.json({ results: result ? [result] : [], sources: ["psa"] });
      }

      // Aggregate search — hit all APIs in parallel
      const [ebayResults, pokemonResults, justTCGResults] = await Promise.allSettled([
        searchEbay(query, controller.signal),
        searchPokemonTCG(query, controller.signal),
        searchJustTCG(query, controller.signal),
      ]);

      clearTimeout(timeout);

      const results: CardResult[] = [];
      const sources: string[] = [];

      if (ebayResults.status === "fulfilled" && ebayResults.value.length > 0) {
        results.push(...ebayResults.value);
        sources.push("ebay");
      }
      if (pokemonResults.status === "fulfilled" && pokemonResults.value.length > 0) {
        results.push(...pokemonResults.value);
        sources.push("pokemontcg");
      }
      if (justTCGResults.status === "fulfilled" && justTCGResults.value.length > 0) {
        results.push(...justTCGResults.value);
        sources.push("justtcg");
      }

      return Response.json({
        results,
        sources,
        query,
        count: results.length,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Card search error";
    return Response.json({ error: message }, { status: 500 });
  }
}
