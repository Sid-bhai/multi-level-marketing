import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1]">
          Build Your Network.
          <br className="hidden sm:inline" />
          Grow Your Business.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Join our community of entrepreneurs and build a successful business with our proven network marketing system.
        </p>
        <div className="flex gap-4">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </div>
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
        <Image src="/placeholder.svg" alt="Network Marketing" fill className="object-cover" priority />
      </div>
    </section>
  )
}

