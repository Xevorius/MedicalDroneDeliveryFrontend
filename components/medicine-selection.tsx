"use client"

import React, { useState } from "react"
import { Search, Plus, Package, AlertCircle } from "lucide-react"
import { Button } from "components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select"
import { Badge } from "components/ui/badge"
import { 
  getAllMedicines, 
  getMedicinesByCategory, 
  searchMedicines,
  validateMedicineOrder,
  formatMedicineDisplay,
  MEDICINE_CATEGORIES,
  type Medicine, 
  type MedicineOrder 
} from "lib/medicine-data"

interface MedicineSelectionProps {
  onMedicineAdd: (order: MedicineOrder) => void
  selectedMedicines?: MedicineOrder[]
  maxSelections?: number
  requiresPrescriptionOnly?: boolean
  emergencyOnly?: boolean
}

export function MedicineSelection({ 
  onMedicineAdd, 
  selectedMedicines = [], 
  maxSelections,
  requiresPrescriptionOnly = false,
  emergencyOnly = false 
}: MedicineSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [selectedDosage, setSelectedDosage] = useState("")
  const [quantity, setQuantity] = useState("")
  const [instructions, setInstructions] = useState("")
  const [errors, setErrors] = useState<string[]>([])

  const allMedicines = getAllMedicines()
  
  // Filter medicines based on props
  let availableMedicines = allMedicines
  
  if (requiresPrescriptionOnly) {
    availableMedicines = availableMedicines.filter(med => med.requiresPrescription)
  }
  
  if (emergencyOnly) {
    availableMedicines = availableMedicines.filter(med => med.category === "Emergency")
  }
  
  // Apply search and category filters
  let filteredMedicines = availableMedicines
  
  if (searchTerm) {
    filteredMedicines = searchMedicines(searchTerm).filter(med => 
      availableMedicines.some(available => available.id === med.id)
    )
  } else if (selectedCategory !== "all") {
    filteredMedicines = getMedicinesByCategory(selectedCategory).filter(med => 
      availableMedicines.some(available => available.id === med.id)
    )
  }

  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setSelectedDosage("")
    setQuantity("")
    setInstructions("")
    setErrors([])
  }

  const handleAddMedicine = () => {
    if (!selectedMedicine || !selectedDosage || !quantity) {
      setErrors(["Please select medicine, dosage, and quantity"])
      return
    }

    const order: MedicineOrder = {
      medicineId: selectedMedicine.id,
      medicineName: selectedMedicine.name,
      dosage: selectedDosage,
      quantity: parseInt(quantity),
      unitType: selectedMedicine.unitType,
      instructions: instructions || undefined
    }

    const validationErrors = validateMedicineOrder(order)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    // Check if already selected
    const alreadySelected = selectedMedicines.some(med => 
      med.medicineId === order.medicineId && med.dosage === order.dosage
    )
    
    if (alreadySelected) {
      setErrors(["This medicine with the same dosage is already selected"])
      return
    }

    // Check max selections
    if (maxSelections && selectedMedicines.length >= maxSelections) {
      setErrors([`Maximum ${maxSelections} medicines allowed`])
      return
    }

    onMedicineAdd(order)
    
    // Reset form
    setSelectedMedicine(null)
    setSelectedDosage("")
    setQuantity("")
    setInstructions("")
    setErrors([])
  }

  const getQuantityOptions = (medicine: Medicine) => {
    return medicine.commonQuantities.map(qty => ({
      value: qty.toString(),
      label: `${qty} ${medicine.unitType}`
    }))
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Medicines</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-48">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MEDICINE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(requiresPrescriptionOnly || emergencyOnly) && (
          <div className="flex gap-2">
            {requiresPrescriptionOnly && (
              <Badge variant="secondary">Prescription Only</Badge>
            )}
            {emergencyOnly && (
              <Badge variant="destructive">Emergency Medicines</Badge>
            )}
          </div>
        )}
      </div>

      {/* Medicine List */}
      <div className="grid gap-3 max-h-64 overflow-y-auto">
        {filteredMedicines.map((medicine) => (
          <Card 
            key={medicine.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMedicine?.id === medicine.id 
                ? 'ring-2 ring-brand-green-dark bg-green-50' 
                : 'hover:border-brand-green-light'
            }`}
            onClick={() => handleMedicineSelect(medicine)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{medicine.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {medicine.category}
                    </Badge>
                    {medicine.requiresPrescription && (
                      <Badge variant="secondary" className="text-xs">
                        Rx
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {medicine.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Dosages: {medicine.dosageOptions.join(", ")}</span>
                    <span>Unit: {medicine.unitType}</span>
                  </div>
                </div>
                
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredMedicines.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No medicines found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse different categories.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Medicine Configuration */}
      {selectedMedicine && (
        <Card className="border-brand-green-light/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Configure {selectedMedicine.name}
            </CardTitle>
            <CardDescription>
              {selectedMedicine.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage">Dosage *</Label>
                <Select value={selectedDosage} onValueChange={setSelectedDosage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dosage" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedMedicine.dosageOptions.map(dosage => (
                      <SelectItem key={dosage} value={dosage}>
                        {dosage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {getQuantityOptions(selectedMedicine).map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Amount</SelectItem>
                  </SelectContent>
                </Select>
                
                {quantity === "custom" && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      placeholder={`Enter quantity in ${selectedMedicine.unitType}`}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      max="1000"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="instructions">Special Instructions (Optional)</Label>
              <Input
                id="instructions"
                placeholder="e.g., Take with food, Morning only, etc."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
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
            
            <Button 
              onClick={handleAddMedicine}
              disabled={!selectedDosage || !quantity}
              className="w-full bg-brand-green-dark hover:bg-brand-green-dark/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Order
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Selected Medicines Summary */}
      {selectedMedicines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selected Medicines ({selectedMedicines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedMedicines.map((med, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <span className="font-medium">
                      {formatMedicineDisplay({ name: med.medicineName, unitType: med.unitType } as Medicine, med.dosage, med.quantity)}
                    </span>
                    {med.instructions && (
                      <div className="text-sm text-muted-foreground">
                        Instructions: {med.instructions}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
