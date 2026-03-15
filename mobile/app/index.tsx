import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, StatusBar, Platform, ActivityIndicator, Text } from "react-native";
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from "react-native-webview";
import * as SplashScreen from "expo-splash-screen";
import NetInfo from "@react-native-community/netinfo";

SplashScreen.preventAutoHideAsync();

const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://saintsallabs.com";

// Inject JS for native bridge features
const INJECTED_JS = `
  // Tell the web app it's running inside the native shell
  window.__SAINTSALLABS_NATIVE__ = true;
  window.__SAINTSALLABS_PLATFORM__ = "${Platform.OS}";
  window.__SAINTSALLABS_VERSION__ = "1.0.0";
  
  // Override console for debugging
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(...args);
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'console', data: args }));
  };
  
  // Prevent zoom on iOS
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  document.head.appendChild(meta);
  
  true;
`;

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const handleMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      // Handle native bridge messages here (push notifications, haptics, etc.)
      console.log("[Native Bridge]", msg);
    } catch {}
  };

  const handleLoad = () => {
    setReady(true);
    SplashScreen.hideAsync();
  };

  const handleError = () => {
    setLoadError(true);
    SplashScreen.hideAsync();
  };

  if (!isOnline) {
    return (
      <View style={styles.offline}>
        <Text style={styles.offlineTitle}>No Connection</Text>
        <Text style={styles.offlineText}>Please check your internet and try again.</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.offline}>
        <Text style={styles.offlineTitle}>Unable to Load</Text>
        <Text style={styles.offlineText}>Pull down to refresh or try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0C0F" />
      {!ready && (
        <View style={styles.loading}>
          <ActivityIndicator color="#F59E0B" size="large" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        injectedJavaScript={INJECTED_JS}
        onMessage={handleMessage}
        onLoad={handleLoad}
        onError={handleError}
        onHttpError={handleError}
        onNavigationStateChange={(navState: WebViewNavigation) => {
          // Handle deep links or auth redirects if needed
        }}
        // Performance & feature flags
        domStorageEnabled={true}
        javaScriptEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        pullToRefreshEnabled={true}
        bounces={false}
        overScrollMode="never"
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        setBuiltInZoomControls={false}
        displayZoomControls={false}
        mixedContentMode="compatibility"
        // iOS specific
        allowsBackForwardNavigationGestures={true}
        automaticallyAdjustContentInsets={false}
        // Show loading indicator while navigating
        startInLoadingState={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0C0C0F" },
  webview: { flex: 1, backgroundColor: "#0C0C0F" },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0C0C0F",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  offline: {
    flex: 1,
    backgroundColor: "#0C0C0F",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  offlineTitle: { color: "#F59E0B", fontSize: 18, fontWeight: "800", marginBottom: 8 },
  offlineText: { color: "#666", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
