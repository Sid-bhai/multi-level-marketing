import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for beginners starting their network marketing journey",
    features: [
      "Basic training materials",
      "Personal referral link",
      "5% commission rate",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    name: "Professional",
    price: "$99",
    description: "Ideal for growing network marketers",
    features: [
      "Advanced training materials",
      "Custom referral links",
      "10% commission rate",
      "Priority email & chat support",
      "Advanced analytics dashboard",
      "Team management tools",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "For serious network marketing professionals",
    features: [
      "Premium training materials",
      "Multiple referral links",
      "15% commission rate",
      "24/7 priority support",
      "Advanced analytics & reporting",
      "Team management tools",
      "Custom branding options",
      "Dedicated account manager",
    ],
  },
]

export function PlanSection() {
  return (
    <section className="container py-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Plan</h2>
        <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
          Select the perfect plan to kickstart your network marketing journey. Upgrade or downgrade at any time.
        </p>
      </div>
      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                Get Started
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

