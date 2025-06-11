"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { User, Heart, MapPin, Upload, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { Textarea } from "components/ui/textarea"
import { 
  type PatientRegistration as PatientRegistrationType,
  MOCK_HOSPITALS, 
  savePatientRegistration,
  getDoctorsByHospital,
  generateHealthId
} from "lib/registration-data"

interface RegistrationStep {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: RegistrationStep[] = [
  {
    id: 1,
    title: "Personal Information",
    description: "Basic details and contact information",
    icon: User
  },
  {
    id: 2,
    title: "Medical Information", 
    description: "Health details and emergency contact",
    icon: Heart
  },
  {
    id: 3,
    title: "Preferences",
    description: "Hospital, doctor, and delivery preferences",
    icon: MapPin
  }
]

export function PatientRegistration() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<Partial<PatientRegistrationType>>({
    personalInfo: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phone: "",
      email: "",
      profilePicture: ""
    },
    medicalInfo: {
      healthId: generateHealthId(),
      bloodType: "",
      allergies: [],
      currentMedications: [],
      emergencyContact: {
        name: "",
        relationship: "",
        phone: ""
      }
    },
    preferences: {
      hospitalId: "",
      doctorId: "",
      preferredLanguage: "english",
      deliveryAddress: "",
      deliveryInstructions: ""
    }
  })

  const availableDoctors = formData.preferences?.hospitalId 
    ? getDoctorsByHospital(formData.preferences.hospitalId)
    : []

  const updatePersonalInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo!,
        [field]: value
      }
    }))
  }
  const updateMedicalInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo!,
        [field]: value
      }
    }))
  }

  const updateEmergencyContact = (contactInfo: Record<string, string>) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo!,
        emergencyContact: {
          ...prev.medicalInfo!.emergencyContact,
          ...contactInfo
        }
      }
    }))
  }

  const updatePreferences = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        [field]: value,
        // Reset doctor selection when hospital changes
        ...(field === "hospitalId" ? { doctorId: "" } : {})
      }
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updatePersonalInfo("profilePicture", e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.personalInfo?.firstName &&
          formData.personalInfo?.lastName &&
          formData.personalInfo?.dateOfBirth &&
          formData.personalInfo?.phone &&
          formData.personalInfo?.email
        )
      case 2:
        return !!(
          formData.medicalInfo?.bloodType &&
          formData.medicalInfo?.emergencyContact?.name &&
          formData.medicalInfo?.emergencyContact?.phone
        )
      case 3:
        return !!(
          formData.preferences?.hospitalId &&
          formData.preferences?.doctorId &&
          formData.preferences?.deliveryAddress
        )
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!isStepValid(3)) return
    
    setIsSubmitting(true)
      // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const registration: PatientRegistrationType = {
      id: `patient-${Date.now()}`,
      personalInfo: formData.personalInfo!,
      medicalInfo: formData.medicalInfo!,
      preferences: formData.preferences!,
      registeredAt: new Date()
    }
    
    savePatientRegistration(registration)
    
    // Redirect to patient dashboard
    router.push("/demo/patient")
  }

  const nextStep = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Patient Registration</h1>
        <p className="text-muted-foreground text-center">
          Join Medifly for fast, secure medical drone deliveries
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all
                ${isCompleted ? 'bg-brand-green-dark border-brand-green-dark text-white' : 
                  isActive ? 'border-brand-green-dark text-brand-green-dark' : 
                  'border-gray-300 text-gray-400'}
              `}>
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium ${isActive ? 'text-brand-green-dark' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-400 max-w-24">
                  {step.description}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`
                  absolute top-6 w-24 h-0.5 ml-12 transition-all
                  ${isCompleted ? 'bg-brand-green-dark' : 'bg-gray-300'}
                `} style={{ left: `calc(${((index + 1) / STEPS.length) * 100}% - 1.5rem)` }} />
              )}
            </div>
          )
        })}
      </div>

      <Card className="border-brand-green-light/30">        <CardHeader>
          <CardTitle className="flex items-center gap-2">            {React.createElement(STEPS[currentStep - 1]?.icon ?? User, { className: "h-5 w-5" })}
            {STEPS[currentStep - 1]?.title ?? 'Step'}
          </CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1]?.description ?? 'Step description'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">                    {formData.personalInfo?.profilePicture ? (
                      <Image 
                        src={formData.personalInfo.profilePicture} 
                        alt="Profile" 
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-sm text-gray-500">Upload profile picture (optional)</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.personalInfo?.firstName ?? ""}
                    onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.personalInfo?.lastName ?? ""}
                    onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.personalInfo?.dateOfBirth ?? ""}
                    onChange={(e) => updatePersonalInfo("dateOfBirth", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.personalInfo?.gender ?? "male"} 
                    onValueChange={(value) => updatePersonalInfo("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.personalInfo?.phone ?? ""}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  placeholder="+86 xxx xxxx xxxx"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.personalInfo?.email ?? ""}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          )}

          {/* Step 2: Medical Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-brand-green-light/30">
                <h4 className="font-medium text-blue-900 mb-1">Auto-Generated Health ID</h4>
                <p className="text-blue-700 font-mono text-lg">{formData.medicalInfo?.healthId}</p>
                <p className="text-blue-600 text-sm mt-1">This will be your unique identifier in the system</p>
              </div>
              
              <div>
                <Label htmlFor="bloodType">Blood Type *</Label>
                <Select 
                  value={formData.medicalInfo?.bloodType ?? ""} 
                  onValueChange={(value) => updateMedicalInfo("bloodType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="allergies">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any known allergies, separated by commas (optional)"
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List current medications, separated by commas (optional)"
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Emergency Contact *</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyName">Contact Name *</Label>
                    <Input
                      id="emergencyName"
                      value={formData.medicalInfo?.emergencyContact?.name ?? ""}
                      onChange={(e) => updateEmergencyContact({ name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      value={formData.medicalInfo?.emergencyContact?.relationship ?? ""}
                      onChange={(e) => updateEmergencyContact({ relationship: e.target.value })}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Contact Phone *</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.medicalInfo?.emergencyContact?.phone ?? ""}
                    onChange={(e) => updateEmergencyContact({ phone: e.target.value })}
                    placeholder="+86 xxx xxxx xxxx"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hospital">Select Hospital/Clinic *</Label>
                <Select 
                  value={formData.preferences?.hospitalId ?? ""} 
                  onValueChange={(value) => updatePreferences("hospitalId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your preferred hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_HOSPITALS.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        <div className="flex flex-col">
                          <span>{hospital.name}</span>
                          <span className="text-xs text-gray-500">{hospital.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.preferences?.hospitalId && (
                <div>
                  <Label htmlFor="doctor">Select Doctor *</Label>
                  <Select 
                    value={formData.preferences?.doctorId ?? ""} 
                    onValueChange={(value) => updatePreferences("doctorId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex flex-col">
                            <span>{doctor.name}</span>
                            <span className="text-xs text-gray-500">
                              {doctor.specialty} • {doctor.experience} years experience
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="language">Preferred Language</Label>
                <Select 
                  value={formData.preferences?.preferredLanguage ?? "english"} 
                  onValueChange={(value) => updatePreferences("preferredLanguage", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="chinese">Chinese (Mandarin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  value={formData.preferences?.deliveryAddress ?? ""}
                  onChange={(e) => updatePreferences("deliveryAddress", e.target.value)}
                  placeholder="Enter your full delivery address"
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="instructions">Delivery Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.preferences?.deliveryInstructions ?? ""}
                  onChange={(e) => updatePreferences("deliveryInstructions", e.target.value)}
                  placeholder="Any special delivery instructions (optional)"
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
          className="border-brand-green-light hover:border-brand-green-dark"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < 3 ? (
            <Button 
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="bg-brand-green-dark hover:bg-brand-green-dark/90"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isStepValid(3) || isSubmitting}
              className="bg-brand-green-dark hover:bg-brand-green-dark/90"
            >
              {isSubmitting ? "Registering..." : "Complete Registration"}
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
