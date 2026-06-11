import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { classifyImageViaBackend } from "../utils/classifyApi";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri?: string }>();
  const imageUri = useMemo(() => {
    const uri = params?.uri;
    return typeof uri === "string" ? uri : null;
  }, [params]);

  const [loading, setLoading] = useState(false);
   const [label, setLabel] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!imageUri) return;
    setLoading(true);
    setError(null);
    setLabel(null);
    setConfidence(null);
    try {
      const res = await classifyImageViaBackend({ imageUri, retries: 2 });
      setLabel(res.label);
      setConfidence(res.confidence);
    } catch (e: any) {
      console.error("Classification error:", e);
      const msg =
        e?.message === "Network request failed"
          ? "Network request failed. Make sure your phone and laptop are on the same Wi‑Fi and the backend API URL is reachable."
          : e?.message ?? "Classification failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!imageUri) {
      Alert.alert("Missing image", "Please capture or pick an image first.");
      router.replace("/homepage");
      return;
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Result</Text>

      <View style={styles.previewCard}>
        <Image source={{ uri: imageUri ?? undefined }} style={styles.image} />
      </View>

      {loading ? (
        <View style={styles.section}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Classifying…</Text>
        </View>
      ) : error ? (
        <View style={styles.section}>
          <Text style={styles.errorTitle}>Classification failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.primaryBtn} onPress={run}>
            <Text style={styles.primaryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.label}>{label ?? "Unknown"}</Text>
          <Text style={styles.muted}>
            Confidence:{" "}
            {confidence == null ? "N/A" : `${(confidence * 100).toFixed(1)}%`}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Pressable
          style={[styles.secondaryBtn, styles.footerBtn]}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryBtnText}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryBtn, styles.footerBtn]}
          onPress={() => router.replace("/homepage")}
        >
          <Text style={styles.primaryBtnText}>New scan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  previewCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  image: {
    width: "100%",
    height: 320,
  },
  section: {
    marginTop: 18,
    gap: 8,
  },
  label: {
    fontSize: 22,
    fontWeight: "700",
  },
  muted: {
    color: "#6B7280",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B91C1C",
  },
  errorText: {
    color: "#7F1D1D",
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtn: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#111827",
    fontWeight: "700",
  },
});

