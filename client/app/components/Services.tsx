import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, PiggyBank, Target } from "lucide-react"
import Image from "next/image"

const Services = () => {
  const services = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Budgeting and Expense Tracking",
      description:
        "Create and manage household budgets, categorize expenses, and track spending patterns over time with intelligent insights.",
      image: "/images/services1.png",
      features: ["Smart categorization", "Real-time tracking", "Spending insights"],
    },
    {
      icon: <PiggyBank className="h-8 w-8 text-primary" />,
      title: "Income and Savings Management",
      description:
        "Track and record all sources of income including salaries, investments, and other revenue streams with automated reporting.",
      image: "/images/services2.png",
      features: ["Multiple income sources", "Automated tracking", "Savings goals"],
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Financial Goal Setting",
      description:
        "Set meaningful financial goals and monitor progress with personalized recommendations to stay on track.",
      image: "/images/services3.png",
      features: ["Goal tracking", "Progress monitoring", "Smart recommendations"],
    },
  ]

  return (
    <section id="services" className="py-24 bg-muted/30" style={{ background: "hsl(var(--color-primary) / 0.06)" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-md uppercase bg-transparent">
            -- Our Services
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Comprehensive Financial Tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take control of your finances and build a secure future
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-16">
          {services.map((service, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-lg enhanced-card">
              <div
                className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                {/* Content */}
                <div className={`p-8 lg:p-12 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <CardHeader className="p-0 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      {service.icon}
                      <CardTitle className="text-2xl font-display font-bold">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">{service.description}</p>
                    <div className="flex flex-wrap gap-2 text-lg">
                      {service.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} className="text-xl text-primary border-primary border-2" variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>

                {/* Image */}
                <div className={`relative p-8 ${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                  <div className="relative">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      width={400}
                      height={300}
                      className="w-full h-auto rounded-xl shadow-lg"
                    />
                    <div className="absolute -bottom-4 -right-4 w-full h-full bg-primary/10 rounded-xl -z-10" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
