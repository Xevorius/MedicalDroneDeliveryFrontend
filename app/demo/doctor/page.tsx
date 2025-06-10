import { getDemoData } from "lib/dashboard-data"
import { Dashboard } from "components/dashboard"
import { Header } from "components/header"
import { Footer } from "components/footer"

export default async function DoctorDemoPage() {
  // Always use demo data for the demo version - doctor type
  const dashboardData = await getDemoData("doctor")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <Dashboard data={dashboardData} isMockData={true} />
      </main>

      <Footer />
    </div>
  )
}
