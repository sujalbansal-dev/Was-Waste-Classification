import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Button,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Headers from "../../components/Headers";
import services from "../../utils/services";
import { useRouter } from "expo-router";
import { client } from "../../utils/KindeConfig";

const Home = () => {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(null);
  const [booting, setBooting] = useState(true);

  const handleLogout = async () => {
    try {
      const loggedOut = await client.logout();
      if (loggedOut) {
        await services.storeData("login", "false");
      }
    } finally {
      router.replace("/login");
    }
  };

  const getPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    setHasCameraPermission(cameraStatus.status === "granted");

    const mediaLibraryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loggedIn = await services.getData("login");
        if (cancelled) return;
        if (loggedIn !== "true") {
          router.replace("/login");
          return;
        }
        await getPermissions();
      } catch (e) {
        console.error("Homepage init error:", e);
        Alert.alert(
          "Startup error",
          e?.message ?? "Failed to initialize the app."
        );
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pickImage = async () => {
    try {
      if (!hasMediaLibraryPermission) {
        Alert.alert(
          "Permission required",
          "Please grant media library permission to pick an image."
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        router.push({ pathname: "/result", params: { uri: imageUri } });
      }
    } catch (error) {
      Alert.alert("Error", error?.message ?? "Error picking image.");
    }
  };

  const openCamera = async () => {
    try {
      if (!hasCameraPermission) {
        Alert.alert(
          "Permission required",
          "Please grant camera permission to take a photo."
        );
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        router.push({ pathname: "/result", params: { uri: imageUri } });
      }
    } catch (error) {
      Alert.alert("Error", error?.message ?? "Error opening camera.");
    }
  };
  if (booting) {
    return (
      <View style={[styles.container, styles.booting]}>
        <ActivityIndicator size="large" />
        <Text style={styles.bootingText}>Preparing…</Text>
      </View>
    );
  }
  return (
    <ImageBackground source={require("../../assets/bg2.jpg")}>
      <View style={styles.container}>
        <Headers />
        <View style={styles.header}>
          <View style={styles.openCamera}>
            <TouchableOpacity style={styles.btn} onPress={openCamera}>
              <Text style={styles.btnText}>OPEN CAMERA</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.openGallery}>
            <TouchableOpacity style={styles.btn} onPress={pickImage}>
              <Text style={styles.btnText}>OPEN GALLERY</Text>
            </TouchableOpacity>
            {image && (
              <Image
                source={{ uri: image }}
                style={{ width: 200, height: 200 }}
              />
            )}
          </View>
          <Button title="Log Out" onPress={handleLogout} />
        </View>
      </View>
    </ImageBackground>
  );
};

export default Home;

const styles = StyleSheet.create({
  btn: {
    borderWidth: 2,
    padding: 15,
    margin: 10,
  },
  btnText: {
    color: "black",
  },
  container: {
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  booting: {
    flex: 1,
    gap: 10,
  },
  bootingText: {
    color: "black",
  },
  header: {},
});
