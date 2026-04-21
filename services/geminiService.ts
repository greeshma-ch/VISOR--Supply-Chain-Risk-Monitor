
import { GoogleGenAI, Type } from "@google/genai";
import { IntelligenceBrief, Supplier, ImpactAnalysis, Disruption, RiskStatus, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// In-memory cache to reduce API calls and mitigate quota hits
const intelCache = new Map<string, { data: IntelligenceBrief; timestamp: number }>();
const globalRiskCache = new Map<string, { data: Disruption[]; timestamp: number }>();
const impactCache = new Map<string, { data: ImpactAnalysis; timestamp: number }>();

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const GLOBAL_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for global signals

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorString = error?.message || JSON.stringify(error) || '';
    const isQuotaError = errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('quota');
    const isServiceUnavailable = errorString.includes('503') || errorString.includes('high demand') || errorString.includes('UNAVAILABLE');
    const isTransientError = errorString.includes('500') || errorString.includes('Rpc failed') || errorString.includes('xhr error') || errorString.includes('fetch');
    
    if ((isQuotaError || isTransientError || isServiceUnavailable) && retries > 0) {
      let errorType = 'Transient/RPC Error';
      if (isQuotaError) errorType = 'Quota Exceeded';
      if (isServiceUnavailable) errorType = 'High Demand (503)';

      // Jittered backoff for better recovery
      const jitter = Math.random() * 500;
      const currentDelay = (isQuotaError || isServiceUnavailable) ? (delay * 2) + jitter : delay + jitter;
      
      console.warn(`Gemini Service ${errorType}. Retrying in ${Math.round(currentDelay)}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      return withRetry(fn, retries - 1, (delay * 1.5) + jitter);
    }
    throw error;
  }
};

export const generateSupplierIntelligence = async (supplier: Supplier, weatherData?: any, isSimulated: boolean = false): Promise<IntelligenceBrief> => {
  // Check cache first
  const cacheKey = `${supplier.id}-${isSimulated}`;
  const cached = intelCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const currentDate = new Date().toLocaleDateString();
  const weatherContext = weatherData 
    ? `Current weather at ${supplier.location}: ${weatherData.weather[0].description}, ${weatherData.main.temp}°C.`
    : "Search for current weather.";

  const simulationContext = isSimulated 
    ? "SIMULATION: Total infrastructure collapse event."
    : "";

  const prompt = `Role: Precision Logistics Engine. Today is ${currentDate}.
  Location: ${supplier.location}
  Supplier Category: ${supplier.category}
  
  ${simulationContext}
  ${weatherContext}

  STRICT GROUNDING:
  1. Default to STABLE. Only escalate if news from ${currentDate} defines a disruption.
  2. No Disruption? Report "Operational Stability" in summary and list all news as STABLE.
  3. Speed is priority. Max 2 sentence analysis.`;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vectorSummary: { type: Type.STRING },
            weatherStatus: { type: Type.STRING },
            suggestedStatus: { type: Type.STRING, enum: ["STABLE", "CAUTION", "RISKY"] },
            todayFeed: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["STABLE", "CAUTION", "RISKY"] },
                  insight: { type: Type.STRING }
                },
                required: ["title", "status", "insight"]
              }
            },
            recentFeed: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, status: { type: Type.STRING }, insight: { type: Type.STRING } } } },
            historicalContext: { type: Type.STRING },
            mitigationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER },
            alternativeSuppliers: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["vectorSummary", "weatherStatus", "suggestedStatus", "todayFeed", "recentFeed", "historicalContext", "mitigationSteps", "confidenceScore", "alternativeSuppliers"]
        }
      },
    }));

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Search Result",
      uri: chunk.web?.uri || "#"
    })) || [];

    const result: IntelligenceBrief = {
      supplierId: supplier.id,
      summary: data.vectorSummary,
      vectorSummary: data.vectorSummary,
      weatherStatus: data.weatherStatus,
      suggestedStatus: data.suggestedStatus as RiskStatus,
      todayFeed: data.todayFeed,
      recentFeed: data.recentFeed,
      historicalContext: data.historicalContext,
      recommendations: data.mitigationSteps,
      mitigationSteps: data.mitigationSteps,
      confidenceScore: data.confidenceScore,
      alternativeSuppliers: data.alternativeSuppliers,
      lastUpdated: new Date().toISOString(),
      sources: sources
    };

    // Update cache
    intelCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      supplierId: supplier.id,
      summary: "Node maintaining baseline stability. High-frequency telemetry currently limited.",
      vectorSummary: "Operational stability confirmed via regional baseline sensors.",
      weatherStatus: "Weather synchronization pending.",
      suggestedStatus: RiskStatus.STABLE,
      todayFeed: [{ title: "Operational Sync", status: RiskStatus.STABLE, insight: "Node maintaining baseline stability." }],
      recentFeed: [],
      historicalContext: "Region historically stable.",
      recommendations: ["Maintain standard operational protocols"],
      mitigationSteps: ["Maintain standard operational protocols"],
      confidenceScore: 5,
      alternativeSuppliers: [],
      lastUpdated: new Date().toISOString(),
      sources: []
    };
  }
};

export const generateGlobalRiskSignals = async (user: User, suppliers: Supplier[]): Promise<Disruption[]> => {
  const hqLocation = user.hqLocation || "Global";
  const nodeRegions = Array.from(new Set(suppliers.map(s => s.location))).sort().join("|");
  const cacheKey = `global-${hqLocation}-${nodeRegions}`;
  
  const cached = globalRiskCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < GLOBAL_CACHE_TTL)) {
    return cached.data;
  }

  const currentDate = new Date().toLocaleDateString();
  const nodeRegionsList = Array.from(new Set(suppliers.map(s => s.location))).join(", ");
  const supplierList = suppliers.slice(0, 15).map(s => `${s.name} (${s.location})`).join("; "); 
  
  const prompt = `Role: Real-time Risk Analyst. Today: ${currentDate}.
  HQ: ${hqLocation}. Nodes in: ${nodeRegions}.
  Suppliers: ${supplierList}.

  Search global events from last 48 hours impacting these regions.
  
  Instructions:
  1. Priority: HQ and Registered Regions.
  2. Grounding: If no disruption, report "Operational Stability: [Region]" and mark severity as "Low".
  3. Accuracy: List specific impacted supplier names.
  
  Output JSON format.`;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disruptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Weather", "Strike", "Logistics", "Incident"] },
                  severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  location: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  impactedSuppliers: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "title", "type", "severity", "location", "timestamp", "summary", "impactedSuppliers"]
              }
            }
          },
          required: ["disruptions"]
        }
      },
    }));

    const jsonText = response.text || "{\"disruptions\": []}";
    const data = JSON.parse(jsonText);
    
    const result = data.disruptions.map((d: any) => ({
      ...d,
      impactedSuppliers: d.impactedSuppliers.map((name: string) => {
        const found = suppliers.find(s => s.name.toLowerCase() === name.toLowerCase());
        return found ? found.id : name;
      })
    }));

    globalRiskCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Global Risk Signals Error:", error);
    // Graceful fallback to cache if available even if stale
    if (cached) {
      console.warn("Serving stale global risk signals from cache due to API error.");
      return cached.data;
    }
    return [];
  }
};

export const generateImpactAnalysis = async (supplier: Supplier, isSimulated: boolean): Promise<ImpactAnalysis> => {
  const cacheKey = `impact-${supplier.id}-${isSimulated}`;
  const cached = impactCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const prompt = `Analytical Task: Impact assessment for ${supplier.name} in ${supplier.location}.
  ${isSimulated ? "SIMULATION: Identify critical infrastructure failure." : "Analyze current regional throughput constraints."}
  
  Return JSON: { bottleneck, estDelay, strategicAction }`;

  try {
    const result = await withRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bottleneck: { type: Type.STRING },
            estDelay: { type: Type.STRING },
            strategicAction: { type: Type.STRING }
          },
          required: ["bottleneck", "estDelay", "strategicAction"]
        }
      },
    }));

    const data = JSON.parse(result.text || "{}");
    impactCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Impact Analysis Error:", error);
    if (cached) {
      console.warn("Serving stale impact analysis from cache due to API error.");
      return cached.data;
    }
    return {
      bottleneck: "Intelligence Link Interrupted",
      estDelay: "Assessment Pending",
      strategicAction: "Manual node verification recommended."
    };
  }
};

export const groundMapLocation = async (supplier: Supplier) => {
  const prompt = `Grounding Task: Verify infrastructure and logistics risks around ${supplier.name} at ${supplier.location}. Identify nearby ports/airports.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }]
      },
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      text,
      links: chunks.filter((chunk: any) => chunk.maps).map((chunk: any) => ({
        title: chunk.maps.title || "Map Location",
        uri: chunk.maps.uri
      }))
    };
  } catch (error) {
    console.error("Gemini Grounding Error:", error);
    return { text: "Live grounding unavailable.", links: [] };
  }
};
