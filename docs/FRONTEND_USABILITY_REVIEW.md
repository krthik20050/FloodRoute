# Frontend usability review, 13 October 2026

The homepage now explains the job directly: choose example places near Aluva and test how closing a road changes the journey. Replaced generic slogans and technical labels across navigation, route results, simulation controls and data explanations. Detailed calculations are expandable; unchanged baseline values are not repeated. Mobile introduction uses readable full-width text, and secondary text contrast is stronger.

Open in Google Maps uses the selected latitude/longitude pairs and Google's documented directions URL format. It updates after selection and swaps, hides for identical endpoints, and does not export graph edges or closures. It remains a clearly labelled external coordinate lookup even when the demo has no connected route. Fictional facilities are explicitly identified before the handoff. Actual Google Maps app launch and real-world travel were not device-tested.

Validation: production build passed in a separate output directory; typecheck and lint passed; 39 unit/API tests passed; all 11 Playwright journeys passed using installed Edge against an isolated local production server. Reviewed desktop and 390px mobile screenshots. No publishing or deployment performed. Existing concurrent static-demo changes were preserved.

Google Maps format reference: https://developers.google.com/maps/documentation/urls/get-started

## Android Chrome Maps handoff, 13 October 2026

The user reported a blank Google Maps page in Android Chrome. The existing URL rendered successfully in the inspected desktop browser, so the physical-device rendering failure was not reproduced and its root cause remains unconfirmed. Added an Android Chrome app intent targeting com.google.android.apps.maps with the exact HTTPS directions URL as an encoded fallback, plus an explicit browser link and clipboard recovery action. This is a browser-renderer workaround, not a verified repair to Google Maps itself. No automatic navigation starts and simulation warnings remain visible.

Validation: 40 unit/API tests and 12 browser journeys passed, including an Android user-agent check for app intent, origin/destination preservation, browser fallback, clipboard copy and updated destination. Production build passed. Native Android app launch and the reported phone rendering require physical-device confirmation.

Reference: https://developer.chrome.com/docs/android/intents
