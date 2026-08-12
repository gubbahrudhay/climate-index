import Hero from "@/components/Hero";
import IndiaMapAssembling from "@/components/IndiaMapAssembling";
export default function Home() {
  return (
    <main className="relative">
      {/* Section 1: Hero — explains the ICI */}
      <Hero />

      {/* Section 2-4: Map assembly + state/district interaction */}
      <IndiaMapAssembling />
    </main>
  );
}
