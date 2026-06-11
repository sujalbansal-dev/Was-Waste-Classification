import { KindeSDK } from "@kinde-oss/react-native-sdk-0-7x";
import * as Linking from "expo-linking";

const redirectUri = Linking.createURL("/");

export const client = new KindeSDK(
  "https://wasifyp.kinde.com",
  redirectUri,
  "aa17e95f847c436c83a6c1a54c6d629f",
  redirectUri
);
