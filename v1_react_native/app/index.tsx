import { ActivityIndicator, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import services from "../utils/services";
import { useRouter } from "expo-router";

const index = () => {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await services.getData("login");
        if (cancelled) return;
        if (result === "true") {
          router.replace("/homepage");
        } else {
          router.replace("/login");
        }
      } catch (e) {
        console.error("Startup routing error in index.tsx:", e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      {checking ? <ActivityIndicator size="large" /> : null}
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
