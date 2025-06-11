"use client"

import React, { useState } from "react"
import { Plus, Package, AlertCircle, Check } from "lucide-react"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { Textarea } from "components/ui/textarea"
import { Badge } from "components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog"
import { 
  addCustomMedicine, 
  getAllMedicines,
  MEDICINE_CATEGORIES,
  type Medicine 
} from "lib/medicine-data"
import { getDoctorSession } from "lib/registration-data"

interface AddMedicineFormProps {
  onMedicineAdded?: (medicine: Medicine) => void
  children?: React.ReactNode
}

export function AddMedicineForm({ onMedicineAdded, children }: AddMedicineFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState<{
    name: string;
    category: string;
    description: string;
    dosageOptions: string;
    commonQuantities: string;
    requiresPrescription: boolean;
    unitType: Medicine['unitType'];
  }>({
    name: "",
    category: "",
    description: "",
    dosageOptions: "",
    commonQuantities: "",
    requiresPrescription: true,
    unitType: "tablets"
  })

  const doctorSession = getDoctorSession()

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      dosageOptions: "",
      commonQuantities: "",
      requiresPrescription: true,
      unitType: "tablets"
    })
    setErrors([])
    setSuccess(false)
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!formData.name.trim()) {
      errors.push("Medicine name is required")
    }
    
    if (!formData.category.trim()) {
      errors.push("Category is required")
    }
    
    if (!formData.description.trim()) {
      errors.push("Description is required")
    }
    
    if (!formData.dosageOptions.trim()) {
      errors.push("At least one dosage option is required")
    }
    
    if (!formData.commonQuantities.trim()) {
      errors.push("At least one common quantity is required")
    }
    
    // Check if medicine already exists
    const existingMedicines = getAllMedicines()
    const nameExists = existingMedicines.some(med => 
      med.name.toLowerCase() === formData.name.trim().toLowerCase()
    )
    
    if (nameExists) {
      errors.push("A medicine with this name already exists")
    }
    
    // Validate dosage options format
    try {
      const dosages = formData.dosageOptions.split(',').map(d => d.trim()).filter(d => d)
      if (dosages.length === 0) {
        errors.push("At least one dosage option is required")
      }
    } catch {
      errors.push("Invalid dosage options format")
    }
    
    // Validate quantities format
    try {
      const quantities = formData.commonQuantities.split(',').map(q => parseInt(q.trim())).filter(q => !isNaN(q) && q > 0)
      if (quantities.length === 0) {
        errors.push("At least one valid quantity is required")
      }
    } catch {
      errors.push("Invalid quantities format")
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors([])
    
    try {
      // Parse dosage options and quantities
      const dosageOptions = formData.dosageOptions.split(',').map(d => d.trim()).filter(d => d)
      const commonQuantities = formData.commonQuantities.split(',').map(q => parseInt(q.trim())).filter(q => !isNaN(q) && q > 0)
      
      const newMedicine = addCustomMedicine({
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        dosageOptions,
        commonQuantities,
        requiresPrescription: formData.requiresPrescription,
        unitType: formData.unitType,
        addedBy: doctorSession?.id ?? "unknown-doctor"
      })
      
      setSuccess(true)
      onMedicineAdded?.(newMedicine)
      
      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false)
        resetForm()
      }, 2000)
        } catch {
      setErrors(["Failed to add medicine. Please try again."])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="bg-brand-green-dark hover:bg-brand-green-dark/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Medicine
          </DialogTitle>
          <DialogDescription>
            Add a new medicine to the system database for patient ordering.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900 mb-2">
              Medicine Added Successfully!
            </h3>
            <p className="text-green-700">
              {formData.name} has been added to the medicine database.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ibuprofen"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDICINE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the medicine and its uses"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosageOptions">Dosage Options *</Label>
                <Input
                  id="dosageOptions"
                  value={formData.dosageOptions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosageOptions: e.target.value }))}
                  placeholder="e.g., 200mg, 400mg, 600mg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple dosages with commas
                </p>
              </div>
              
              <div>
                <Label htmlFor="unitType">Unit Type *</Label>
                <Select 
                  value={formData.unitType} 
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, unitType: value as Medicine['unitType'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="mg">Milligrams (mg)</SelectItem>
                    <SelectItem value="doses">Doses</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="commonQuantities">Common Quantities *</Label>
              <Input
                id="commonQuantities"
                value={formData.commonQuantities}
                onChange={(e) => setFormData(prev => ({ ...prev, commonQuantities: e.target.value }))}
                placeholder="e.g., 10, 20, 30, 50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate quantities with commas (numbers only)
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requiresPrescription"
                checked={formData.requiresPrescription}
                onChange={(e) => setFormData(prev => ({ ...prev, requiresPrescription: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="requiresPrescription" className="flex items-center gap-2">
                Requires Prescription
                <Badge variant={formData.requiresPrescription ? "secondary" : "outline"} className="text-xs">
                  {formData.requiresPrescription ? "Rx" : "OTC"}
                </Badge>
              </Label>
            </div>
            
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Please fix the following:</span>
                </div>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-brand-green-dark hover:bg-brand-green-dark/90"
              >
                {isSubmitting ? "Adding..." : "Add Medicine"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
