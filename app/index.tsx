import { Host, Text as ExpoUIText } from '@expo/ui';
import { type ReactNode, useEffect, useState, useSyncExternalStore } from 'react';
import { Appearance, Button, StyleSheet, Text, View, useColorScheme } from 'react-native';

// Every value the override takes: React Native's ColorSchemeOverride, plus the
// null that React Native accepted before 'auto'.
type ColorSchemeSetting = 'light' | 'dark' | 'auto' | 'unspecified' | null;
const SETTINGS: ColorSchemeSetting[] = ['light', 'dark', 'auto', 'unspecified', null];

// ColorSchemeOverride has no null, so the type is widened for that one value.
const setColorScheme = Appearance.setColorScheme as (setting: ColorSchemeSetting) => void;

// React Native's own useColorScheme is useSyncExternalStore over these two.
function subscribe(onChange: () => void) {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}

export default function Home() {
  const colorScheme = useColorScheme();
  const [events, setEvents] = useState<string[]>([]);
  const [areReadersMounted, setAreReadersMounted] = useState(false);

  useEffect(() => {
    const subscription = Appearance.addChangeListener((preferences) => {
      setEvents((previous) => [...previous, String(preferences.colorScheme)]);
    });
    return () => subscription.remove();
  }, []);

  const isDark = colorScheme === 'dark';
  return (
    <View style={[styles.screen, isDark && styles.darkScreen]}>
      <Text testID="use-color-scheme" style={isDark && styles.darkText}>
        useColorScheme(): {String(colorScheme)}
      </Text>
      <Text testID="change-events" style={isDark && styles.darkText}>
        Change events: {events.join(', ') || 'none'}
      </Text>
      <Host matchContents>
        <ExpoUIText testID="expo-ui-text">@expo/ui Text</ExpoUIText>
      </Host>
      {SETTINGS.map((setting) => (
        <Button
          key={String(setting)}
          title={`setColorScheme(${JSON.stringify(setting)})`}
          onPress={() => setColorScheme(setting)}
        />
      ))}
      {areReadersMounted ? (
        <>
          <UseColorSchemeReader>
            <SetColorSchemeOnMount colorScheme="dark" />
          </UseColorSchemeReader>
          <SyncExternalStoreReader>
            <SetColorSchemeOnMount colorScheme="dark" />
          </SyncExternalStoreReader>
        </>
      ) : (
        <Button
          title="Mount two readers, each around a child that calls setColorScheme('dark') on mount"
          onPress={() => setAreReadersMounted(true)}
        />
      )}
    </View>
  );
}

function SetColorSchemeOnMount({ colorScheme }: { colorScheme: 'light' | 'dark' }) {
  useEffect(() => {
    Appearance.setColorScheme(colorScheme);
  }, [colorScheme]);
  return null;
}

// A parent's effects run after its children's, so this reader subscribes after
// its child has already changed the scheme.
function UseColorSchemeReader({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  return (
    <View>
      <Text testID="use-color-scheme-reader" style={colorScheme === 'dark' && styles.darkText}>
        Reader using useColorScheme(): {String(colorScheme)}
      </Text>
      {children}
    </View>
  );
}

function SyncExternalStoreReader({ children }: { children: ReactNode }) {
  const colorScheme = useSyncExternalStore(subscribe, Appearance.getColorScheme, Appearance.getColorScheme);
  return (
    <View>
      <Text testID="sync-external-store-reader" style={colorScheme === 'dark' && styles.darkText}>
        Reader using useSyncExternalStore: {String(colorScheme)}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#ffffff' },
  darkScreen: { backgroundColor: '#000000' },
  darkText: { color: '#ffffff' },
});
