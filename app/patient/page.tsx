import { PatientDashboard } from "components/patient-dashboard"
import { getDemoData } from "lib/dashboard-data"

export default async function PatientPage() {
  const data = await getDemoData("patient")
  return <PatientDashboard data={data} isMockData={true} />
}