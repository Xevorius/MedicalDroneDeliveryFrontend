"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { 
  User, 
  Stethoscope, 
  ArrowRight, 
  Play,
  Eye,
  Sparkles,
  UserPlus,
  Users
} from "lucide-react"

export function DemoNavigation() {
  const pathname = usePathname()

  const registrationRoutes = [
    {
      title: "Patient Registration",
      description: "Complete the multi-step registration process as a new patient",
      href: "/register",
      icon: UserPlus,
      features: ["Personal Info", "Medical Details", "Doctor Selection", "Preferences"],
      badge: "Interactive",
      isActive: pathname === "/register"
    },
    {
      title: "Doctor Selection",
      description: "Choose a doctor profile to access the healthcare provider demo",
      href: "/doctor-demo", 
      icon: Users,
      features: ["Hospital Filter", "Doctor Profiles", "Specialty Search", "Demo Access"],
      badge: "Demo Setup",
      isActive: pathname === "/doctor-demo"
    }
  ]

  const demoRoutes = [
    {
      title: "Doctor Dashboard",
      description: "Manage patient requests, approve deliveries, and monitor drone operations",
      href: "/demo/doctor",
      icon: Stethoscope,
      features: ["Approval Workflows", "Patient Management", "Analytics Dashboard", "Emergency Monitoring"],
      isActive: pathname === "/demo/doctor"
    },
    {
      title: "Patient Dashboard", 
      description: "Request medications, track deliveries, and manage recurring prescriptions",
      href: "/demo/patient",
      icon: User,
      features: ["Emergency Requests", "Recurring Deliveries", "Request Forms", "Delivery Tracking"],
      isActive: pathname === "/demo/patient"
    }
  ]
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Medifly Interactive Demo</h1>
        <p className="text-muted-foreground text-lg">
          Experience our medical drone delivery system from both doctor and patient perspectives
        </p>
        <Badge variant="warning" className="mt-2">
          <Sparkles className="h-3 w-3 mr-1" />
          Interactive Demo - All features functional
        </Badge>
      </div>

      {/* Registration Flow */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Getting Started</h2>
          <p className="text-muted-foreground">
            Register as a patient or select a doctor profile for the full demo experience
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {registrationRoutes.map((route) => {
            const Icon = route.icon
            return (
              <Card key={route.href} className={`transition-all hover:shadow-lg border-brand-green-light/50 hover:border-brand-green-dark hover:shadow-brand-green-light/20 ${route.isActive ? 'ring-2 ring-brand-green-dark shadow-lg shadow-brand-green-light/30' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {route.title}
                    {route.isActive && <Badge variant="secondary">Current</Badge>}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {route.badge}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {route.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {route.features.map((feature) => (
                        <div key={feature} className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="h-1 w-1 bg-brand-green-dark rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button asChild className="w-full bg-brand-green-dark hover:bg-brand-green-dark/90">
                    <Link href={route.href}>
                      <Play className="h-4 w-4 mr-2" />
                      {route.isActive ? "Continue" : "Get Started"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Demo Dashboards */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Demo Dashboards</h2>
          <p className="text-muted-foreground">
            Access the full dashboard experience with mock data
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {demoRoutes.map((route) => {
            const Icon = route.icon
            return (
              <Card key={route.href} className={`transition-all hover:shadow-lg border-brand-green-light/50 hover:border-brand-green-dark hover:shadow-brand-green-light/20 ${route.isActive ? 'ring-2 ring-brand-green-dark shadow-lg shadow-brand-green-light/30' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {route.title}
                    {route.isActive && <Badge variant="secondary">Current</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {route.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {route.features.map((feature) => (
                        <div key={feature} className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="h-1 w-1 bg-primary rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={route.href}>
                        <Play className="h-4 w-4 mr-2" />
                        {route.isActive ? "Current View" : "Try Demo"}
                      </Link>
                    </Button>
                    {!route.isActive && (
                      <Button variant="outline" asChild>
                        <Link href={route.href}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
                        )
          })}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">About This Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This interactive demo showcases Medifly&apos;s medical drone delivery platform. 
            All data is simulated to demonstrate real-world workflows without using actual patient information.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-foreground mb-1">Doctor Features:</h4>
              <ul className="space-y-1">
                <li>• Review and approve patient requests</li>
                <li>• Monitor delivery status and drone operations</li>
                <li>• Manage patient medication profiles</li>
                <li>• Handle emergency dispatch protocols</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Patient Features:</h4>
              <ul className="space-y-1">
                <li>• Request medication deliveries</li>
                <li>• Set up recurring delivery schedules</li>
                <li>• Emergency delivery requests</li>
                <li>• Track delivery status in real-time</li>
              </ul>
            </div>
          </div>
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Main Site
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
