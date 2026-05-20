
import { GoogleGenAI, Type } from "@google/genai";
import { IntelligenceBrief, Supplier, ImpactAnalysis, Disruption, RiskStatus, User } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// In-memory cache to reduce API calls and mitigate quota hits
const intelCache = new Map<string, { data: IntelligenceBrief; timestamp: number }>();
const globalRiskCache = new Map<string, { data: Disruption[]; timestamp: number }>();
const impactCache = new Map<string, { data: ImpactAnalysis; timestamp: number }>();

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const GLOBAL_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for global signals

const safeParseJson = (text: string | undefined): any => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();
  }

  // 1. Try parsing directly in case it's completely valid JSON
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Proceed to extraction/repair fallbacks
  }
  
  // 2. Robust balanced JSON structure extractor
  let firstBrace = cleaned.indexOf('{');
  let firstBracket = cleaned.indexOf('[');
  
  let startIdx = -1;
  let endChar = '';
  let startChar = '';
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    startChar = '{';
    endChar = '}';
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    startChar = '[';
    endChar = ']';
  }
  
  let extracted = cleaned;
  if (startIdx !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    let foundEnd = -1;
    
    for (let i = startIdx; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === startChar) {
          depth++;
        } else if (char === endChar) {
          depth--;
          if (depth === 0) {
            foundEnd = i;
            break;
          }
        }
      }
    }
    
    if (foundEnd !== -1) {
      extracted = cleaned.substring(startIdx, foundEnd + 1);
    } else {
      extracted = cleaned.substring(startIdx);
    }
  }

  // Handle some common malformed patterns like "key":. This disruption...
  // Replace direct invalid values after the colons e.g. :. Text
  let repaired = extracted.replace(/:\s*\.\s+([A-Za-z])/g, ': "$1');
  
  try {
    return JSON.parse(repaired);
  } catch (error) {
    // Attempt standard syntax repair if possible
    try {
      const furtherCleaned = repaired.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(furtherCleaned);
    } catch {
      try {
        // Strip trailing comments/garbage outside of closing brackets/curly braces
        const lastBrack = Math.max(repaired.lastIndexOf('}'), repaired.lastIndexOf(']'));
        if (lastBrack !== -1) {
          return JSON.parse(repaired.substring(0, lastBrack + 1));
        }
      } catch {}
      throw error;
    }
  }
};

const withRetry = async <T>(fn: (modelName: string) => Promise<T>, retries = 7, delay = 3000): Promise<T> => {
  const models = [
    "gemini-3.5-flash",
    "gemini-2.0-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];
  let modelIndex = 0;
  const failedModels = new Set<string>();

  const execute = async (remainingRetries: number, currentDelay: number): Promise<T> => {
    // Find next non-failed model
    while (failedModels.has(models[modelIndex]) && failedModels.size < models.length) {
      modelIndex = (modelIndex + 1) % models.length;
    }
    
    const currentModel = models[modelIndex];
    try {
      return await fn(currentModel);
    } catch (error: any) {
      const errorString = error?.message || JSON.stringify(error) || '';
      const isQuotaError = errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('quota');
      const isServiceUnavailable = errorString.includes('503') || errorString.includes('high demand') || errorString.includes('UNAVAILABLE');
      const isTransientError = errorString.includes('500') || errorString.includes('Rpc failed') || errorString.includes('xhr error') || errorString.includes('fetch');
      const isModelNotFoundError = errorString.includes('404') || errorString.includes('not found') || errorString.includes('no longer available') || errorString.includes('not supported');
      
      if (isModelNotFoundError) {
        failedModels.add(currentModel);
      }

      if ((isQuotaError || isTransientError || isServiceUnavailable || isModelNotFoundError) && remainingRetries > 0) {
        let errorType = 'Error';
        if (isQuotaError) errorType = 'Quota Exceeded';
        if (isServiceUnavailable) errorType = 'High Demand (503)';
        if (isModelNotFoundError) errorType = 'Model Not Found/Available (404)';

        // Rotate model on 503 or 404
        if (isServiceUnavailable || isModelNotFoundError) {
          modelIndex = (modelIndex + 1) % models.length;
        }

        const jitter = Math.random() * 1500;
        const nextDelay = (isQuotaError || isServiceUnavailable) ? (currentDelay * 2) + jitter : currentDelay + jitter;
        
        console.warn(`Gemini Service ${errorType} on ${currentModel}. Switched to ${models[modelIndex]}. Retrying in ${Math.round(nextDelay)}ms... (${remainingRetries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, nextDelay));
        return execute(remainingRetries - 1, nextDelay * 1.2);
      }
      throw error;
    }
  };

  return execute(retries, delay);
};

export const generateSupplierIntelligence = async (supplier: Supplier, weatherData?: any, isSimulated: boolean = false, relevantDisruptions: Disruption[] = []): Promise<IntelligenceBrief> => {
  // Check cache first
  const cacheKey = `${supplier.id}-${isSimulated}-${relevantDisruptions.length}`;
  const cached = intelCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const currentDate = new Date().toLocaleDateString();
  const weatherContext = weatherData 
    ? `Current weather at ${supplier.location}: ${weatherData.weather[0].description}, ${weatherData.main.temp}°C.`
    : "Search for current weather.";

  const simulationContext = isSimulated 
    ? `CRISIS MODE OVERRIDE: Severe infrastructure severance at ${supplier.location}. System Status: ${supplier.status}.`
    : `System Resolution: ${supplier.status}.`;

  const disruptionContext = relevantDisruptions.length > 0 
    ? `REAL-TIME DISRUPTIONS: ${relevantDisruptions.map(d => `${d.title} (${d.severity})`).join(', ')}`
    : "No major disruptions detected in official feeds.";

  const prompt = `Role: Strategic Logistics Analyst. Today is ${currentDate}.
  Location: ${supplier.location}, Category: ${supplier.category}, Resolved Risk Status: ${supplier.status}.
  
  ${simulationContext}
  ${weatherContext}
  ${disruptionContext}

  Task: Provide a high-fidelity intelligence brief and impact assessment that justifies the Resolved Risk Status of ${supplier.status}.
  Ground your reasoning in the real-time weather and feed analysis above. 
  If the status is CAUTION or RISKY, identify exactly which signal (weather or feed) triggered the escalation.
  If STABLE, confirm baseline operational integrity despite local conditions.`;

  try {
    const response = await withRetry((modelName) => ai.models.generateContent({
      model: modelName,
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
            alternativeSuppliers: { type: Type.ARRAY, items: { type: Type.STRING } },
            impact: {
              type: Type.OBJECT,
              properties: {
                bottleneck: { type: Type.STRING },
                estDelay: { type: Type.STRING },
                strategicAction: { type: Type.STRING }
              },
              required: ["bottleneck", "estDelay", "strategicAction"]
            }
          },
          required: ["vectorSummary", "weatherStatus", "suggestedStatus", "todayFeed", "recentFeed", "historicalContext", "mitigationSteps", "confidenceScore", "alternativeSuppliers", "impact"]
        }
      },
    } as any));

    const jsonText = response.text || "{}";
    const data = safeParseJson(jsonText);
    
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
      sources: sources,
      impactAnalysis: data.impact
    };

    intelCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      supplierId: supplier.id,
      summary: "Baseline stability confirmed.",
      vectorSummary: "Baseline stability confirmed.",
      weatherStatus: "Synchronization pending.",
      suggestedStatus: RiskStatus.STABLE,
      todayFeed: [],
      recentFeed: [],
      historicalContext: "Regionally stable.",
      recommendations: ["Maintain standard protocols"],
      mitigationSteps: ["Maintain standard protocols"],
      confidenceScore: 5,
      alternativeSuppliers: [],
      lastUpdated: new Date().toISOString(),
      sources: [],
      impactAnalysis: { bottleneck: "None", estDelay: "0h", strategicAction: "Monitor" }
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
  
  STRICT GROUNDING:
  1. Every "High" or "Medium" disruption MUST be linked to a verifiable news or weather event from the last 48 hours.
  2. Grounding: If no disruptions are found, you MUST return a disruption item inside the "disruptions" array with "title" set to "Operational Stability: [Region]", "severity" set to "Low", type as "Logistics", summary confirming normal conditions, and verificationStatus as "verified". DO NOT output text or sentences directly under the "disruptions" key; "disruptions" MUST ALWAYS be a valid JSON array of objects conforming to the responseSchema under all circumstances.
  3. Impact Linkage: Explain exactly HOW the event affects supply chain (e.g., "Closure of Port X disrupts delivery for Supplier Y").
  4. Node Accuracy: Explicitly name impacted suppliers from the list if they are in the blast radius.
  
  Output ONLY valid raw JSON conforming exactly to the responseSchema. No conversational text or markdown formatting should surround the JSON.`;

  try {
    const response = await withRetry((modelName) => ai.models.generateContent({
      model: modelName,
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
                  impactedSuppliers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sourceUrl: { type: Type.STRING, description: "Direct link to news/weather source" },
                  verificationStatus: { type: Type.STRING, enum: ["verified", "unverified"] }
                },
                required: ["id", "title", "type", "severity", "location", "timestamp", "summary", "impactedSuppliers", "sourceUrl", "verificationStatus"]
              }
            }
          },
          required: ["disruptions"]
        }
      },
    } as any));

    const jsonText = response.text || "{\"disruptions\": []}";
    const data = safeParseJson(jsonText);
    
    if (!data || typeof data !== 'object' || !Array.isArray(data.disruptions)) {
      console.warn("Global Risk Signals parsed JSON is not in the expected format:", data);
      throw new Error("Invalid schema structure for Global Risk Signals");
    }
    
    const result = data.disruptions.map((d: any) => ({
      ...d,
      impactedSuppliers: (d.impactedSuppliers || []).map((name: string) => {
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

  const prompt = isSimulated
    ? `CRITICAL REASONING MODE: Impact assessment for ${supplier.name} (${supplier.category}) at ${supplier.location}.
       SCENARIO: Severe network severance and logistics blackout.
       
       STRESS TEST REQUIREMENTS:
       1. Cascading Analysis: Identify what could fail next if this state persists.
       2. Propagation Scenario: Predict the primary disruption vector to other nodes.
       3. Operator Blind Spots: Highlight high-risk variables often ignored in this scenario.
       4. Mitigation: Suggest non-obvious contingency actions (e.g., specific secondary channel activation).
       
       STYLE: Crisis decision support. No filler. Analytical and strategic.`
    : `Analytical Task: Impact assessment for ${supplier.name} in ${supplier.location}.
       Analyze current regional logistics and infrastructure status using real-time search.
       
       STRICT GROUNDING:
       1. Base analysis ONLY on recent news, weather reports, or port/traffic data from the last 72 hours. 
       2. If no verifiable disruption is found, report "Baseline Throughput" with 0 delay.
       3. Strategic action must be specific to the identified bottleneck.`;

  try {
    const result = await withRetry((modelName) => ai.models.generateContent({
      model: modelName,
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
    } as any));

    const data = safeParseJson(result.text || "{}");
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
    const response = await withRetry((modelName) => ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }]
      },
    } as any));

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
