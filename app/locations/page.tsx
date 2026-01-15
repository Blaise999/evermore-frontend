// app/locations/page.tsx
import React from "react";
import LocationsClient from "./Locations.client";

// If your app layout already renders a header, don’t add another one here.
// If you want a header on internal pages, you can import your SiteHeader and render it above.
export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      <LocationsClient />
    </main>
  );
}
