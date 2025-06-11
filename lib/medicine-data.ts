export interface Medicine {
  id: string
  name: string
  category: string
  description: string
  dosageOptions: string[]
  commonQuantities: number[]
  requiresPrescription: boolean
  unitType: "tablets" | "ml" | "mg" | "doses" | "units"
  addedBy?: string // "system" or doctor ID
  addedAt: Date
}

export interface MedicineOrder {
  medicineId: string
  medicineName: string
  dosage: string
  quantity: number
  unitType: string
  instructions?: string
}

// Mock medicine database
export const MOCK_MEDICINES: Medicine[] = [
  // Pain & Inflammation
  {
    id: "med-001",
    name: "Ibuprofen",
    category: "Pain Relief",
    description: "Anti-inflammatory pain reliever",
    dosageOptions: ["200mg", "400mg", "600mg"],
    commonQuantities: [10, 20, 30, 50],
    requiresPrescription: false,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  {
    id: "med-002", 
    name: "Acetaminophen",
    category: "Pain Relief",
    description: "Fever reducer and pain reliever",
    dosageOptions: ["325mg", "500mg", "650mg"],
    commonQuantities: [10, 20, 30, 50],
    requiresPrescription: false,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  {
    id: "med-003",
    name: "Aspirin",
    category: "Pain Relief",
    description: "Blood thinner and pain reliever",
    dosageOptions: ["81mg", "325mg"],
    commonQuantities: [30, 60, 90],
    requiresPrescription: false,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  // Antibiotics
  {
    id: "med-004",
    name: "Amoxicillin",
    category: "Antibiotics",
    description: "Broad-spectrum antibiotic",
    dosageOptions: ["250mg", "500mg"],
    commonQuantities: [14, 21, 28],
    requiresPrescription: true,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  {
    id: "med-005",
    name: "Azithromycin",
    category: "Antibiotics", 
    description: "Antibiotic for respiratory infections",
    dosageOptions: ["250mg", "500mg"],
    commonQuantities: [5, 6, 10],
    requiresPrescription: true,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  // Cardiovascular
  {
    id: "med-006",
    name: "Lisinopril",
    category: "Cardiovascular",
    description: "ACE inhibitor for blood pressure",
    dosageOptions: ["5mg", "10mg", "20mg"],
    commonQuantities: [30, 90],
    requiresPrescription: true,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  {
    id: "med-007",
    name: "Metoprolol",
    category: "Cardiovascular",
    description: "Beta-blocker for heart conditions",
    dosageOptions: ["25mg", "50mg", "100mg"],
    commonQuantities: [30, 60, 90],
    requiresPrescription: true,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  // Diabetes
  {
    id: "med-008",
    name: "Metformin",
    category: "Diabetes",
    description: "Blood sugar control medication",
    dosageOptions: ["500mg", "850mg", "1000mg"],
    commonQuantities: [30, 60, 90],
    requiresPrescription: true,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  {
    id: "med-009",
    name: "Insulin (Rapid-Acting)",
    category: "Diabetes",
    description: "Fast-acting insulin for meal coverage",
    dosageOptions: ["100 units/ml"],
    commonQuantities: [1, 2, 3, 5],
    requiresPrescription: true,
    unitType: "units",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  // Respiratory
  {
    id: "med-010",
    name: "Albuterol Inhaler",
    category: "Respiratory",
    description: "Bronchodilator for asthma",
    dosageOptions: ["90mcg/dose"],
    commonQuantities: [1, 2, 3],
    requiresPrescription: true,
    unitType: "doses",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  // Allergy
  {
    id: "med-011",
    name: "Cetirizine",
    category: "Allergy",
    description: "Antihistamine for allergies",
    dosageOptions: ["5mg", "10mg"],
    commonQuantities: [10, 30, 90],
    requiresPrescription: false,
    unitType: "tablets",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  },
  {
    id: "med-012",
    name: "EpiPen",
    category: "Emergency",
    description: "Emergency epinephrine auto-injector",
    dosageOptions: ["0.3mg", "0.15mg"],
    commonQuantities: [1, 2],
    requiresPrescription: true,
    unitType: "units",
    addedBy: "system",
    addedAt: new Date("2024-01-01")
  }
]

// Medicine categories for filtering
export const MEDICINE_CATEGORIES = [
  "Pain Relief",
  "Antibiotics", 
  "Cardiovascular",
  "Diabetes",
  "Respiratory",
  "Allergy",
  "Emergency",
  "Other"
]

// Local storage keys
const CUSTOM_MEDICINES_KEY = "medifly_custom_medicines"

// Medicine management functions
export function getAllMedicines(): Medicine[] {
  const customMedicines = getCustomMedicines()
  return [...MOCK_MEDICINES, ...customMedicines]
}

export function getMedicineById(id: string): Medicine | undefined {
  return getAllMedicines().find(med => med.id === id)
}

export function getMedicinesByCategory(category: string): Medicine[] {
  return getAllMedicines().filter(med => med.category === category)
}

export function searchMedicines(query: string): Medicine[] {
  const lowercaseQuery = query.toLowerCase()
  return getAllMedicines().filter(med => 
    med.name.toLowerCase().includes(lowercaseQuery) ||
    med.description.toLowerCase().includes(lowercaseQuery) ||
    med.category.toLowerCase().includes(lowercaseQuery)
  )
}

export function getCustomMedicines(): Medicine[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(CUSTOM_MEDICINES_KEY)
  if (!stored) return []
    try {
    const parsed = JSON.parse(stored) as Record<string, unknown>[]
    return parsed.map((med: Record<string, unknown>) => ({
      ...med,
      addedAt: new Date(med.addedAt as string)
    })) as Medicine[]
  } catch {
    return []
  }
}

export function addCustomMedicine(medicine: Omit<Medicine, "id" | "addedAt">): Medicine {
  const newMedicine: Medicine = {
    ...medicine,
    id: `custom-${Date.now()}`,
    addedAt: new Date()
  }
  
  const customMedicines = getCustomMedicines()
  const updatedMedicines = [...customMedicines, newMedicine]
  
  localStorage.setItem(CUSTOM_MEDICINES_KEY, JSON.stringify(updatedMedicines))
  
  return newMedicine
}

export function removeCustomMedicine(id: string): boolean {
  const customMedicines = getCustomMedicines()
  const filteredMedicines = customMedicines.filter(med => med.id !== id)
  
  if (filteredMedicines.length === customMedicines.length) {
    return false // Medicine not found
  }
  
  localStorage.setItem(CUSTOM_MEDICINES_KEY, JSON.stringify(filteredMedicines))
  return true
}

// Validation functions
export function validateMedicineOrder(order: MedicineOrder): string[] {
  const errors: string[] = []
  const medicine = getMedicineById(order.medicineId)
  
  if (!medicine) {
    errors.push("Medicine not found")
    return errors
  }
  
  if (!order.dosage || !medicine.dosageOptions.includes(order.dosage)) {
    errors.push("Invalid dosage selected")
  }
  
  if (!order.quantity || order.quantity <= 0) {
    errors.push("Quantity must be greater than 0")
  }
  
  if (order.quantity > 1000) {
    errors.push("Quantity cannot exceed 1000 units")
  }
  
  return errors
}

// Helper function to format medicine display
export function formatMedicineDisplay(medicine: Medicine, dosage?: string, quantity?: number): string {
  let display = medicine.name
  
  if (dosage) {
    display += ` ${dosage}`
  }
  
  if (quantity) {
    display += ` × ${quantity} ${medicine.unitType}`
  }
  
  return display
}
