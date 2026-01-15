// app/locations/data.ts
export type CareMode = "Express" | "Primary" | "Specialty" | "Labs" | "Imaging";

export type LocationItem = {
  slug: string;
  name: string;
  city: string;
  region:
    | "London"
    | "South East"
    | "South West"
    | "Midlands"
    | "North West"
    | "Yorkshire"
    | "Scotland"
    | "Wales";
  addressLines: string[];
  postcode: string;
  phone: string;
  hoursLabel: string;
  modes: CareMode[];
  badges: string[];
  heroImg: string;
  gallery: string[];
  blurb: string;
  transportNote: string;
  accessibilityNote: string;
};

export const LOCATIONS: LocationItem[] = [
  {
    slug: "london-city-express",
    name: "Evermore Express • London City",
    city: "London",
    region: "London",
    addressLines: ["10 Evermore Way", "London"],
    postcode: "EC2A 1AA",
    phone: "+44 20 0000 0001",
    hoursLabel: "Open daily • 7:00 – 19:00",
    modes: ["Express", "Labs"],
    badges: ["Same-day care", "Walk-in + video"],
    heroImg: "/Pictures/locations-2.jpg",
    gallery: ["/Pictures/locations-1.png", "/Pictures/portal-1.jpg", "/Pictures/facility-2.jpg"],
    blurb:
      "Fast triage for everyday urgent concerns with simple next steps. Lab add-ons available where clinically appropriate.",
    transportNote: "Close to major tube lines. Short-stay drop-off available.",
    accessibilityNote: "Step-free entrance, lift access, wheelchair assistance on request.",
  },
  {
    slug: "manchester-primary-central",
    name: "Evermore Primary • Manchester Central",
    city: "Manchester",
    region: "North West",
    addressLines: ["22 Evermore Square", "Manchester"],
    postcode: "M1 1AE",
    phone: "+44 16 1000 0002",
    hoursLabel: "Mon–Sat • 8:00 – 18:00",
    modes: ["Primary", "Labs"],
    badges: ["Checkups", "Prevention"],
    heroImg: "/Pictures/locations-3.png",
    gallery: ["/Pictures/locations-2.jpg", "/Pictures/facility-1.jpg", "/Pictures/portal-2.jpg"],
    blurb:
      "Your ongoing care home: checkups, chronic care programs, referrals, and follow-ups—built around continuity.",
    transportNote: "City centre access with nearby parking and rail connections.",
    accessibilityNote: "Wide corridors and accessible consultation rooms.",
  },
  {
    slug: "birmingham-specialty-new-street",
    name: "Evermore Specialty • Birmingham",
    city: "Birmingham",
    region: "Midlands",
    addressLines: ["5 Evermore Plaza", "Birmingham"],
    postcode: "B2 4QA",
    phone: "+44 12 1000 0003",
    hoursLabel: "Mon–Fri • 9:00 – 17:30",
    modes: ["Specialty", "Imaging", "Labs"],
    badges: ["Specialist clinics", "Imaging"],
    heroImg: "/Pictures/locations-2.jpg",
    gallery: ["/Pictures/locations-2.jpg", "/Pictures/facility-3.jpg", "/Pictures/portal-3.jpg"],
    blurb:
      "Specialist consultations with coordinated pathways across diagnostics—so your next steps are always clear.",
    transportNote: "Near New Street connections. Check-in desk on ground floor.",
    accessibilityNote: "Accessible toilets, lift access, assistance available.",
  },
  {
    slug: "leeds-diagnostics-dock",
    name: "Evermore Diagnostics • Leeds",
    city: "Leeds",
    region: "Yorkshire",
    addressLines: ["1 Evermore Quay", "Leeds"],
    postcode: "LS10 1EF",
    phone: "+44 11 3000 0004",
    hoursLabel: "Mon–Sat • 8:00 – 16:00",
    modes: ["Labs", "Imaging"],
    badges: ["Lab results in portal", "Trend tracking"],
    heroImg: "/Pictures/portal-1.jpg",
    gallery: ["/Pictures/locations-2.jpg", "/Pictures/portal-1.jpg", "/Pictures/Wheelchair.jpg"],
    blurb:
      "Diagnostics-first site with clear digital results inside your portal—plus clinician notes and follow-up guidance.",
    transportNote: "Easy access by bus routes; limited on-site parking.",
    accessibilityNote: "Step-free access and wheelchair-friendly bays.",
  },
  {
    slug: "glasgow-city-express",
    name: "Evermore Express • Glasgow City",
    city: "Glasgow",
    region: "Scotland",
    addressLines: ["14 Evermore Street", "Glasgow"],
    postcode: "G1 3SL",
    phone: "+44 14 1000 0005",
    hoursLabel: "Open daily • 7:30 – 19:30",
    modes: ["Express"],
    badges: ["Rapid intake", "Same-day slots"],
    heroImg: "/Pictures/locations-1.png",
    gallery: ["/Pictures/locations-1.png", "/Pictures/facility-2.jpg", "/Pictures/portal-1.jpg"],
    blurb:
      "Quick access for urgent concerns with structured follow-up and clear documentation after every visit.",
    transportNote: "Central access with taxi drop-off zone.",
    accessibilityNote: "Step-free entrance with assistance available.",
  },
  {
    slug: "bristol-primary-harbourside",
    name: "Evermore Primary • Bristol Harbourside",
    city: "Bristol",
    region: "South West",
    addressLines: ["8 Evermore Harbour", "Bristol"],
    postcode: "BS1 5TY",
    phone: "+44 11 7000 0006",
    hoursLabel: "Mon–Sat • 8:30 – 18:00",
    modes: ["Primary"],
    badges: ["Family care", "Follow-ups"],
    heroImg: "/Pictures/locations-3.png",
    gallery: ["/Pictures/locations-3.png", "/Pictures/portal-2.jpg", "/Pictures/facility-1.jpg"],
    blurb:
      "Primary care for individuals and families—prevention, screenings, routine reviews, and continuity.",
    transportNote: "Harbourside access; nearby multi-storey parking.",
    accessibilityNote: "Accessible rooms and step-free access.",
  },
];

export function findLocation(slug: string) {
  return LOCATIONS.find((x) => x.slug === slug);
}
