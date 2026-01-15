// app/page.tsx (Server Component)
import ScrollProgress from "./components/landing/ScrollProgress.client";
import StickyHeader from "./components/landing/StickyHeader.client";
import Hero from "./components/landing/Hero.client";
import CareFinder from "./components/landing/CareFinder.client";
import PortalDemo from "./components/landing/PortalDemo.client";
import FAQ from "./components/landing/FAQ.client";
import FloatingCTA from "./components/landing/FloatingCTA.client";

import TrustStrip from "./components/landing/TrustStrip";
import GradientDivider from "./components/landing/GradientDivider";
import InfoBand from "./components/landing/InfoBand";
import CareCard from "./components/landing/CareCard";
import Specialties from "./components/landing/Specialties";
import Locations from "./components/landing/Locations";
import Doctors from "./components/landing/Doctors";
import Testimonials from "./components/landing/Testimonials";
import Footer from "./components/landing/Footer";

import { Heartbeat, SectionLabel } from "./components/landing/ui";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#F6FAFF] via-white to-white text-slate-900">
      {/* Client islands */}
      <ScrollProgress />
      <StickyHeader />
      <Hero />

      {/* Server sections */}
      <TrustStrip />
      <GradientDivider />
      <InfoBand />
      <GradientDivider />

      <section id="care" className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel icon={<Heartbeat />} text="Get care" />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Choose the right care level
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              For emergencies, call local emergency services or go to the Emergency Department. For everything else,
              Evermore helps guide you to the right option.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2 lg:items-start">
          {/* Client island */}
          <CareFinder />

          <div className="grid gap-4">
            <CareCard
              title="Express Care"
              desc="Fast help for coughs, sprains, infections, and urgent issues that can’t wait."
              meta={["Open daily", "Same-day slots", "Video visits available", "Typical wait: 12–18 min"]}
              href="/login"
              img="/Pictures/facility-2.jpg"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <CareCard
                title="Primary Care"
                desc="Preventive care, annual checkups, referrals, screenings, and immunizations."
                meta={["Mon–Fri", "Annual checkups", "Referrals", "Long-term follow-up"]}
                href="/login"
                img="/Pictures/facility-3.jpg"
              />
              <CareCard
                title="Specialty Clinics"
                desc="Consultations and treatment for specific conditions with coordinated follow-up."
                meta={["Appointments", "Cardio, Ortho, Derm", "Imaging & labs", "Specialist consults"]}
                href="/login"
                img="/Pictures/facility-4.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      <GradientDivider />
      <Specialties />
      <GradientDivider />

      {/* Client island */}
      <PortalDemo />

      <GradientDivider />
      <Locations />
      <GradientDivider />
      <Doctors />
      <GradientDivider />
      <Testimonials />
      <GradientDivider />

      {/* Client island */}
      <FAQ />

      <Footer />

      {/* Client island */}
      <FloatingCTA />
    </main>
  );
}
