import Hero from "@/components/Hero";
import IndiaMapAssembling from "@/components/IndiaMapAssembling";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      {/* Section 1: Hero — explains the ICI */}
      <Hero />

      {/* Section 2-4: Map assembly + state/district interaction */}
      <IndiaMapAssembling />

      {/* Section 5: Footer */}
      <Footer />
    </main>
  );
}
