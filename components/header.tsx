"use client"

import Link from "next/link"
import { Plane, Menu } from "lucide-react"
import { Button } from "components/ui/button"
import { ThemeToggle } from "components/theme-toggle"
import { NotificationCenter } from "components/notification-center"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <Plane className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">Medifly</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="#how-it-works"
            >
              How it Works
            </Link>
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/demo"
            >
              Demo
            </Link>
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="#contact"
            >
              Contact
            </Link>
          </nav>
        </div>
        <button className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link className="mr-6 flex items-center space-x-2 md:hidden" href="/">
              <Plane className="h-6 w-6 text-primary" />
              <span className="font-bold">Medifly</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
            <NotificationCenter />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
