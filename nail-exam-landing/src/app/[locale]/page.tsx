import FeaturesZigZag from "@/components/FeaturesZigZag";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Roadmap from "@/components/Roadmap";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <FeaturesZigZag />
      <Roadmap />
      <Footer />
    </main>
  );
}
