import { Dashboard } from "components/dashboard"
import { getDemoData } from "lib/dashboard-data"

export default async function DashboardPage() {
  const data = await getDemoData("doctor")
  return <Dashboard data={data} isMockData={true} />
}