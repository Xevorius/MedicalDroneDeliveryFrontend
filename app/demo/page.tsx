import { DemoNavigation } from "components/demo-navigation"
import { Header } from "components/header"
import { Footer } from "components/footer"

export default function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <DemoNavigation />
      </main>

      <Footer />
    </div>
  )
}
