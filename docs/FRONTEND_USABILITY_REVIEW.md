# Frontend usability review, 13 October 2026

The homepage now explains the job directly: choose example places near Aluva and test how closing a road changes the journey. Replaced generic slogans and technical labels across navigation, route results, simulation controls and data explanations. Detailed calculations are expandable; unchanged baseline values are not repeated. Mobile introduction uses readable full-width text, and secondary text contrast is stronger.

Open in Google Maps uses the selected latitude/longitude pairs and Google's documented directions URL format. It updates after selection and swaps, hides for identical endpoints, and does not export graph edges or closures. It remains a clearly labelled external coordinate lookup even when the demo has no connected route. Fictional facilities are explicitly identified before the handoff. Actual Google Maps app launch and real-world travel were not device-tested.

Validation: production build passed in a separate output directory; typecheck and lint passed; 39 unit/API tests passed; all 11 Playwright journeys passed using installed Edge against an isolated local production server. Reviewed desktop and 390px mobile screenshots. No publishing or deployment performed. Existing concurrent static-demo changes were preserved.

Google Maps format reference: https://developers.google.com/maps/documentation/urls/get-started
