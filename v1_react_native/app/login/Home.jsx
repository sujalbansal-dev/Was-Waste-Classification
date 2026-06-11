import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Colors from "../../utils/Colors";
import { client } from "../../utils/KindeConfig";
import services from "../../utils/services";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = await client.login();
      if (!token) {
        Alert.alert("Login cancelled", "Please try again.");
        return;
      }
      await services.storeData("login", "true");
      router.replace("/homepage");
    } catch (e) {
      console.error("Kinde login error:", e);
      Alert.alert(
        "Login failed",
        e?.message ?? "Something went wrong during login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ display: "flex", alignItems: "center" }}>
      <Image source={require("../../assets/bg3.png")} style={styles.Bg} />
      <View style={styles.content}>
        <Text style={styles.contentText}>Wasification</Text>
        <Text style={styles.subContentText}>Get To know your waste</Text>
        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : null]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}> Login/SignUp</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.condition}>
          * By Login/SignUp you will agree to our terms and conditions *{" "}
        </Text>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  Bg: {
    width: 350,
    height: 450,
    marginTop: 30,
    borderWidth: 5,
    borderRadius: 20,
    alignItems: "center",
    borderColor: Colors.BLACK,
  },
  button: {
    backgroundColor: Colors.WHITE,
    padding: 12,
    paddingHorizontal: 5,
    borderRadius: 105,
    marginTop: 20,
    minWidth: 200,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    textAlign: "center",
    color: Colors.PRIMARY,
    fontSize: 20,
  },
  condition: {
    fontSize: 13,
    color: Colors.WHITE,
    textAlign: "center",
  },
  content: {
    backgroundColor: Colors.PRIMARY,
    width: "100%",
    height: "100%",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentText: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.WHITE,
  },
  subContentText: {
    fontSize: 20,
    textAlign: "center",
    color: Colors.PINK,
    marginTop: 30,
  },
});
