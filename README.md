# react-native-web: `Appearance.setColorScheme` (necolas/react-native-web#2857)

A test app for [necolas/react-native-web#2857](https://github.com/necolas/react-native-web/pull/2857),
which adds `Appearance.setColorScheme` on web
([necolas/react-native-web#2703](https://github.com/necolas/react-native-web/issues/2703)).
It is a blank Expo SDK 58 app with expo-router, `@expo/ui`, `react-dom` and
`react-native-web` added by `npx expo install`, `main` set to
`expo-router/entry`, and `web.output` set to `"static"`.

## Setup

`npm install` gives react-native-web 0.21.4, which has no
`Appearance.setColorScheme`. Copy the pull request's built `Appearance` module
over it:

```sh
npm install
mkdir /tmp/rnw-2857 && cd /tmp/rnw-2857
curl -L -o pr.tgz https://pkg.csb.dev/necolas/react-native-web/commit/951bc72d/react-native-web
tar -xzf pr.tgz
cd -
for file in dist/exports/Appearance/index.js dist/exports/Appearance/index.js.flow dist/cjs/exports/Appearance/index.js; do
  cp "/tmp/rnw-2857/package/$file" "node_modules/react-native-web/$file"
done
```

Only these three files are copied because the CodeSandbox build is of the pull
request's head commit, which is based on 0.21.2. Copying the `Appearance`
module alone onto 0.21.4 tests what a merge into `master` would release. The
copied module differs from 0.21.4's by exactly the pull request's diff. A
later `npm install` restores the stock files.

## Run

- Development: `npx expo start --web`.
- Production: `npx expo export --platform web`, then `npx expo serve`.

Switch the browser's color scheme with Chrome DevTools → Rendering →
"Emulate CSS media feature prefers-color-scheme".

## What to check

With the browser in light mode:

1. On load, `useColorScheme()` reads `light`, there are no change events, and
   the `@expo/ui` `Text` is black.
2. Press `setColorScheme("dark")`: `useColorScheme()` reads `dark`, one `dark`
   event is logged, and the `@expo/ui` `Text` turns white.
3. Switch the browser to dark and back to light: nothing changes and no event
   is logged, since an override is set.
4. Press `setColorScheme("auto")`, `setColorScheme("unspecified")` or
   `setColorScheme(null)` after an override: the value returns to the
   browser's scheme, with one event when it differs, and later browser
   switches are followed again.
5. Press the button for the scheme already in effect: no event is logged.
6. With no override and the browser in light mode, press "Mount two readers…".
   Each reader is the parent of a child whose mount effect calls
   `Appearance.setColorScheme('dark')`. The reader using react-native-web's
   `useColorScheme()` keeps `light`, because a parent's effects run after its
   children's, so it subscribes after the change. The reader using
   `useSyncExternalStore`, the hook React Native's own `useColorScheme` is
   built on, reads `dark`. Both follow every later change.
