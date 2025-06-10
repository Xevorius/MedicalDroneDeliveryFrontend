import Link from "next/link"
import { 
  Clock, 
  Shield, 
  Zap, 
  Heart, 
  ArrowRight,
  Play
} from "lucide-react"
import { Button } from "components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Header } from "components/header"
import { Footer } from "components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Medical Supplies Delivered by
                    <span className="text-primary"> Drone</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Emergency medical supplies delivered in minutes, not hours. Our autonomous drone network 
                    ensures critical medications reach patients when every second counts.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/demo">
                      <Play className="mr-2 h-4 w-4" />
                      Try Interactive Demo
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/demo/doctor">
                      Doctor View
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 blur-3xl"></div>
                  <div className="relative bg-gradient-to-br from-primary/10 to-primary/30 rounded-3xl p-8 backdrop-blur-sm border">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                        <Heart className="h-12 w-12 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">15 Minutes</h3>
                        <p className="text-muted-foreground">Average delivery time</p>
                      </div>
                      <div className="flex justify-center space-x-8 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-lg">99.8%</div>
                          <div className="text-muted-foreground">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">24/7</div>
                          <div className="text-muted-foreground">Available</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Choose Medifly?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our cutting-edge drone delivery system is designed specifically for medical emergencies and routine supply needs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="border-brand-green-light hover:border-brand-green-dark hover:shadow-lg hover:shadow-brand-green-light/20 transition-all">
                <CardHeader>
                  <Clock className="h-10 w-10 text-primary" />
                  <CardTitle>Ultra-Fast Delivery</CardTitle>
                  <CardDescription>
                    Get critical medical supplies delivered in under 15 minutes with our autonomous drone fleet.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-brand-green-light hover:border-brand-green-dark hover:shadow-lg hover:shadow-brand-green-light/20 transition-all">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary" />
                  <CardTitle>HIPAA Compliant</CardTitle>
                  <CardDescription>
                    Full compliance with healthcare regulations and secure handling of sensitive medical data.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-brand-green-light hover:border-brand-green-dark hover:shadow-lg hover:shadow-brand-green-light/20 transition-all">
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary" />
                  <CardTitle>AI-Powered Routing</CardTitle>
                  <CardDescription>
                    Smart route optimization considers weather, air traffic, and emergency priority levels.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Simple, fast, and reliable medical supply delivery in three easy steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Place Order</h3>
                <p className="text-muted-foreground">
                  Healthcare providers submit requests through our secure platform with patient and medication details.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Drone Dispatch</h3>
                <p className="text-muted-foreground">
                  Our AI system automatically selects the optimal drone and route for fastest, safest delivery.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Secure Delivery</h3>
                <p className="text-muted-foreground">
                  Temperature-controlled, secure delivery with real-time tracking and confirmation upon receipt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-4 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <h3 className="text-4xl font-bold text-primary">10K+</h3>
                <p className="text-muted-foreground">Successful Deliveries</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <h3 className="text-4xl font-bold text-primary">15min</h3>
                <p className="text-muted-foreground">Average Delivery Time</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <h3 className="text-4xl font-bold text-primary">99.8%</h3>
                <p className="text-muted-foreground">Success Rate</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <h3 className="text-4xl font-bold text-primary">50+</h3>
                <p className="text-muted-foreground">Partner Hospitals</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Experience Medifly Demo
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore our interactive demo and see how drone delivery transforms healthcare logistics.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/demo">
                    Try Interactive Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/demo/patient">Patient Experience</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
