import { getDemoData } from "lib/dashboard-data"
import { PatientDashboard } from "components/patient-dashboard"
import { Header } from "components/header"
import { Footer } from "components/footer"

export default async function PatientDemoPage() {
  // Always use demo data for the demo version - patient type
  const dashboardData = await getDemoData("patient")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <PatientDashboard data={dashboardData} isMockData={true} />
      </main>

      <Footer />
    </div>
  )
}
