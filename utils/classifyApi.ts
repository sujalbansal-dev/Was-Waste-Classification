export type ClassificationResult = {
  label: string;
  confidence: number | null;
  raw?: unknown;
};

// Replace this with your LAN IP + backend port
const DEFAULT_BASE_URL = "http://10.168.7.25:5001";

function normalizeConfidence(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pickLabel(json: any): string {
  return (
    json?.label ??
    json?.class ??
    json?.predicted_class ??
    json?.prediction ??
    json?.result ??
    "Unknown"
  );
}

function pickConfidence(json: any): number | null {
  return normalizeConfidence(
    json?.confidence ?? json?.score ?? json?.probability ?? json?.prob
  );
}

export async function classifyImageViaBackend(opts: {
  imageUri: string;
  baseUrl?: string;
  timeoutMs?: number;
  retries?: number;
}): Promise<ClassificationResult> {
  const { imageUri } = opts;

  console.log("Original URI:", imageUri);
  
  const normalizedUri = imageUri.startsWith("file://")
    ? imageUri
    : `file://${imageUri}`;

  console.log("Normalized URI:", normalizedUri);
  console.log("Sending request to backend");

  const formData = new FormData();

  formData.append("file", {
    uri: normalizedUri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any);

  try {
    const res = await fetch("http://10.168.7.25:5001/predict/", {
      method: "POST",
      body: formData
    });

    console.log("Response Status:", res.status);

    const rawResponse = await res.text();
    console.log("Raw response:", rawResponse);

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${rawResponse}`);
    }

    let json;
    try {
      json = JSON.parse(rawResponse);
    } catch (e) {
      return { label: rawResponse.trim() || "Unknown", confidence: null, raw: rawResponse };
    }

    return {
      label: String(pickLabel(json)),
      confidence: pickConfidence(json),
      raw: json,
    };
  } catch (error) {
    console.error("Network request failed or parsing error:", error);
    throw error;
  }
}

