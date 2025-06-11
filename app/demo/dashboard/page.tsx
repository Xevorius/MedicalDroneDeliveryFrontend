import { Dashboard } from "components/dashboard"
import { getDemoData } from "lib/dashboard-data"

export default async function DemoDashboardPage() {
  const data = await getDemoData("doctor")
  return <Dashboard data={data} isMockData={true} />
}