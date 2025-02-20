import { HeroSection } from "@/components/hero-section"
import { PlanSection } from "@/components/plan-section"
import { StatsSection } from "@/components/stats-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <StatsSection />
      <PlanSection />
    </div>
  )
}

