import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const Hero = () => {
  return (
    <section
      id="hero"
      style={{ background: "hsl(var(--color-primary) / 0.06)" }}
      className="relative min-h-screen flex items-center justify-center pt-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Plan your future with <span className="text-primary">confidence</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                Create and manage budgets effortlessly with our comprehensive financial tools.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="text-lg px-8 py-6 enhanced-badge" asChild>
                <Link href="/pages/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 enhanced-badge" asChild>
                <Link href="#services">Learn More</Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/images/hero-img.png"
                alt="Financial planning dashboard"
                width={600}
                height={450}
                className="w-full h-auto rounded-2xl"
                priority
              />
            </div>
            {/* Background decoration */}
            <div className="absolute -top-4 -right-4 w-full h-full bg-primary/30 rounded-2xl -z-10" />
            <div className="absolute -top-8 -right-8 w-full h-full bg-primary/10 rounded-2xl -z-20" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
