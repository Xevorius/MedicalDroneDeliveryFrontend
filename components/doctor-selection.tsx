// filepath: components/doctor-selection.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Stethoscope, User, MapPin, Star, ChevronRight, Search } from "lucide-react"
import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { Badge } from "components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar"
import { 
  MOCK_HOSPITALS, 
  MOCK_DOCTORS,
  getDoctorsByHospital,
  saveDoctorSession,
  type Doctor
} from "lib/registration-data"

export function DoctorSelection() {
  const router = useRouter()
  const [selectedHospital, setSelectedHospital] = useState("all")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const availableDoctors = selectedHospital && selectedHospital !== "all"
    ? getDoctorsByHospital(selectedHospital)
    : MOCK_DOCTORS

  const filteredDoctors = availableDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
  }

  const handleContinue = () => {
    if (selectedDoctor) {
      saveDoctorSession(selectedDoctor)
      router.push("/demo/doctor")
    }
  }
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const selectedHospitalData = selectedHospital !== "all" ? MOCK_HOSPITALS.find(h => h.id === selectedHospital) : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Doctor Demo Access</h1>
        <p className="text-muted-foreground">
          Select a doctor profile to experience the healthcare provider dashboard
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card className="border-brand-green-light/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search Doctors</Label>
                <Input
                  id="search"
                  placeholder="Search by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
                <div>
                <Label htmlFor="hospital">Filter by Hospital</Label>
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="All hospitals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    {MOCK_HOSPITALS.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedHospitalData && (
                <div className="bg-green-50 p-3 rounded-lg border border-brand-green-light/50">
                  <h4 className="font-medium text-green-900 mb-1">
                    {selectedHospitalData.name}
                  </h4>
                  <p className="text-green-700 text-sm mb-2">
                    {selectedHospitalData.address}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedHospitalData.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {selectedHospitalData.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedHospitalData.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Doctor List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Available Doctors ({filteredDoctors.length})
              </h2>
              {selectedDoctor && (
                <Button 
                  onClick={handleContinue}
                  className="bg-brand-green-dark hover:bg-brand-green-dark/90"
                >
                  Continue as {selectedDoctor.name}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {filteredDoctors.map((doctor) => {
                const hospital = MOCK_HOSPITALS.find(h => h.id === doctor.hospitalId)
                const isSelected = selectedDoctor?.id === doctor.id
                
                return (
                  <Card 
                    key={doctor.id} 
                    className={`cursor-pointer transition-all border-2 hover:shadow-md ${
                      isSelected 
                        ? 'border-brand-green-dark bg-green-50' 
                        : 'border-brand-green-light/30 hover:border-brand-green-light'
                    }`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={doctor.avatar} alt={doctor.name} />
                          <AvatarFallback className="text-lg">
                            {getInitials(doctor.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                Dr. {doctor.name}
                              </h3>
                              <p className="text-brand-green-dark font-medium mb-2">
                                {doctor.specialty}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Stethoscope className="h-4 w-4" />
                                  {doctor.experience} years
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  {doctor.rating}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {doctor.patients}+ patients
                                </div>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <Badge className="bg-brand-green-dark">
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {hospital?.name}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {doctor.languages.map((language) => (
                              <Badge key={language} variant="outline" className="text-xs">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredDoctors.length === 0 && (
              <Card className="border-brand-green-light/30">
                <CardContent className="p-8 text-center">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No doctors found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search criteria or clear the filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
