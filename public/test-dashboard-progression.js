// Test script for dashboard automatic progression
console.log("🏥 Testing Dashboard Automatic Progression");

// Test function to verify dashboard progression works with realistic timing
async function testDashboardProgression() {
  try {
    // Import required functions
    const { 
      updateDeliveryApprovalStatus,
      createDeliveryFromPatientRequest,
      savePatientDelivery,
      saveDoctorDelivery
    } = await import('lib/delivery-management.js');
    
    const { 
      getDeliveryProgression,
      isDeliveryInProgression,
      clearAllProgressions
    } = await import('lib/delivery-progression.js');
    
    // Clear any existing progressions
    clearAllProgressions();
    
    // Create a realistic test delivery
    const testPatientId = "P-DASHBOARD-TEST";
    const testDoctorId = "DOC-DASHBOARD-TEST";
    
    const testDelivery = {
      id: "DASH-TEST-" + Date.now(),
      medicationName: "Metformin 500mg",
      patientId: testPatientId,
      status: "pending",
      priority: "routine", // This will give 3 minutes preparation time
      requestedAt: new Date(),
      deliveredAt: null,
      estimatedTime: 18, // 18 minutes total estimated time
      actualTime: null,
      droneId: null,
      distance: "3.2 km",
      cost: 28.99,
      requestedBy: "patient",
      approvalStatus: "pending",
      doctorId: testDoctorId
    };
    
    console.log("📝 Created test delivery:", testDelivery.id);
    console.log("⚡ Priority:", testDelivery.priority, "(3 min preparation expected)");
    console.log("⏱️ Estimated time:", testDelivery.estimatedTime, "minutes");
    
    // Save the delivery for both patient and doctor
    savePatientDelivery(testDelivery, testPatientId);
    saveDoctorDelivery(testDelivery, testDoctorId);
    
    console.log("💾 Saved delivery to storage");
    
    // Simulate doctor approval (this should trigger automatic progression)
    console.log("🩺 Simulating doctor approval...");
    const success = updateDeliveryApprovalStatus(
      testDelivery.id,
      "approved",
      testDoctorId
    );
    
    if (success) {
      console.log("✅ Delivery approved successfully!");
      console.log("🚁 Automatic progression should now be starting...");
      
      // Expected timeline:
      console.log("\n📅 Expected Timeline:");
      console.log("   - Now: Approved (preparation phase)");
      console.log("   - +3 min: In-Transit (routine priority = 3 min prep)");
      console.log("   - +18 min: Delivered (15 min actual delivery time)");
      console.log("   - Total: ~18 minutes (3 prep + 15 delivery)");
      
      // Monitor progression every 30 seconds
      let checkCount = 0;
      const maxChecks = 20; // Monitor for up to 10 minutes
      
      const monitor = setInterval(() => {
        checkCount++;
        const progression = getDeliveryProgression(testDelivery.id);
        
        if (progression) {
          const now = new Date();
          const elapsedMinutes = (now.getTime() - progression.approvedAt.getTime()) / (1000 * 60);
          const totalTime = progression.preparationTime + progression.estimatedTime;
          const remainingTime = Math.max(0, totalTime - elapsedMinutes);
          
          console.log(`📊 Check ${checkCount}: ${elapsedMinutes.toFixed(1)}/${totalTime} min elapsed, ${remainingTime.toFixed(1)} min remaining`);
          
          if (elapsedMinutes >= progression.preparationTime && elapsedMinutes < totalTime) {
            console.log("   🚁 Status: In-Transit");
          } else if (elapsedMinutes < progression.preparationTime) {
            console.log("   📦 Status: Preparation");
          }
        } else {
          console.log(`📊 Check ${checkCount}: ✅ Progression completed - delivery should be delivered!`);
          clearInterval(monitor);
          return;
        }
        
        if (checkCount >= maxChecks) {
          console.log("⏰ Monitoring timeout reached");
          clearInterval(monitor);
        }
      }, 30000); // Check every 30 seconds
      
      console.log("🔍 Monitoring started - check console every 30 seconds");
      console.log("💡 You can also check the doctor dashboard to see status changes");
      
    } else {
      console.log("❌ Failed to approve delivery");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Instructions
console.log(`
🏥 DASHBOARD AUTOMATIC PROGRESSION TEST

This test simulates a realistic doctor approval workflow with appropriate timing:

🕐 Realistic Timing:
- Emergency deliveries: 1 min preparation
- Urgent deliveries: 2 min preparation  
- Routine deliveries: 3 min preparation
- Delivery time: Total estimated time minus preparation time

🧪 To run the test:
1. testDashboardProgression()
2. Watch console logs for ~18 minutes
3. Check /demo/doctor dashboard for visual updates
4. Verify progression completes successfully

Expected for this test:
- 3 minute preparation (routine priority)
- 15 minute delivery (18 total - 3 prep)
- Automatic status transitions

Ready to test? Run: testDashboardProgression()
`);

// Make function available globally
if (typeof window !== 'undefined') {
  // @ts-ignore - Adding function to global window object for testing
  window['testDashboardProgression'] = testDashboardProgression;
}
