// Complete Workflow Test - Tests the full end-to-end delivery progression system
console.log("🎯 Testing Complete Dashboard Progression Workflow");

// Test function to verify the complete automatic progression workflow
async function testCompleteWorkflow() {
  try {
    // Import required functions
    const { 
      updateDeliveryApprovalStatus,
      savePatientDelivery,
      saveDoctorDelivery
    } = await import('/lib/delivery-management.js');
    
    const { 
      getDeliveryProgression,
      clearAllProgressions,
      resumeDeliveryProgressions 
    } = await import('/lib/delivery-progression.js');
    
    // Clear any existing progressions and initialize system
    clearAllProgressions();
    resumeDeliveryProgressions();
    
    console.log("🧹 Cleared existing progressions and initialized system");
    
    // Create a realistic test scenario
    const testPatientId = "P-COMPLETE-TEST-" + Date.now();
    const testDoctorId = "DOC-COMPLETE-TEST-" + Date.now();
    
    const testDelivery = {
      id: "COMPLETE-TEST-" + Date.now(),
      medicationName: "Insulin Humalog 100IU/mL",
      patientId: testPatientId,
      patientName: "John Doe",
      status: "pending",
      priority: "urgent", // This will give 2 minutes preparation time
      requestedAt: new Date(),
      deliveredAt: null,
      estimatedTime: 12, // 12 minutes total estimated time
      actualTime: null,
      droneId: null,
      distance: "2.8 km",
      cost: 34.99,
      requestedBy: "patient",
      approvalStatus: "pending",
      quantity: "1 vial",
      dosage: "100IU/mL",
      notes: "Urgent delivery for diabetic patient",
      doctorId: testDoctorId
    };
    
    console.log("📝 Created test delivery scenario:");
    console.log(`   📋 Delivery ID: ${testDelivery.id}`);
    console.log(`   💊 Medication: ${testDelivery.medicationName}`);
    console.log(`   ⚡ Priority: ${testDelivery.priority} (2 min preparation expected)`);
    console.log(`   ⏱️ Estimated time: ${testDelivery.estimatedTime} minutes`);
    console.log(`   🏥 Patient: ${testDelivery.patientName}`);
    console.log(`   💰 Cost: $${testDelivery.cost}`);
    
    // Save the delivery for both patient and doctor
    savePatientDelivery(testDelivery, testPatientId);
    saveDoctorDelivery(testDelivery, testDoctorId);
    
    console.log("💾 Saved delivery to both patient and doctor storage");
    
    // Simulate doctor approval (this should trigger automatic progression)
    console.log("\n🩺 Simulating doctor approval...");
    const success = updateDeliveryApprovalStatus(
      testDelivery.id,
      "approved",
      testDoctorId
    );
    
    if (success) {
      console.log("✅ Delivery approved successfully!");
      console.log("🚁 Automatic progression should now be starting...");
      
      // Expected timeline:
      console.log("\n📅 Expected Timeline (Total ~12 minutes):");
      console.log("   - Now: Approved (preparation phase begins)");
      console.log("   - +2 min: In-Transit (urgent priority = 2 min prep)");
      console.log("   - +12 min: Delivered (10 min actual delivery time)");
      console.log("   - Total: ~12 minutes (2 prep + 10 delivery)");
      
      console.log("\n🔍 Real-time Monitoring:");
      console.log("   📊 Check the doctor dashboard for progression badges");
      console.log("   🎯 Look for spinning loaders and countdown timers");
      console.log("   🚁 Track button should show live drone tracking");
      
      // Monitor progression every 15 seconds for first few minutes
      let checkCount = 0;
      const maxChecks = 8; // Monitor for up to 2 minutes
      
      const monitor = setInterval(() => {
        checkCount++;
        const progression = getDeliveryProgression(testDelivery.id);
        
        if (progression) {
          const now = new Date();
          const elapsedMinutes = (now.getTime() - progression.approvedAt.getTime()) / (1000 * 60);
          const totalTime = progression.preparationTime + progression.estimatedTime;
          const remainingTime = Math.max(0, totalTime - elapsedMinutes);
          
          console.log(`📊 Monitor ${checkCount}: ${elapsedMinutes.toFixed(1)}/${totalTime} min elapsed, ${remainingTime.toFixed(1)} min remaining`);
          
          if (elapsedMinutes >= progression.preparationTime && elapsedMinutes < totalTime) {
            console.log("   🚁 Status: In-Transit - Check dashboard for blue progression badge!");
          } else if (elapsedMinutes < progression.preparationTime) {
            console.log("   📦 Status: Preparation - Check dashboard for yellow progression badge!");
          }
        } else {
          console.log(`📊 Monitor ${checkCount}: ✅ Progression completed - delivery should be delivered!`);
          console.log("   🎉 Check dashboard - progression badge should be gone, status should be 'Delivered'");
          clearInterval(monitor);
          return;
        }
        
        if (checkCount >= maxChecks) {
          console.log("⏰ Short monitoring completed. Progression will continue automatically.");
          console.log("💡 Check the dashboard periodically to see the progression badges update!");
          clearInterval(monitor);
        }
      }, 15000); // Check every 15 seconds
      
      console.log("\n🎮 What to do now:");
      console.log("1. 🖥️  Open http://localhost:3000/demo/doctor in another tab");
      console.log("2. 👀 Look for your test delivery in the 'Recent Deliveries' table");
      console.log("3. 🏷️  Observe the progression badges in the Status column:");
      console.log("   - 🟡 Yellow 'Preparing' badge with countdown timer");
      console.log("   - 🔵 Blue 'In Transit' badge with countdown timer");
      console.log("   - ✅ No badge when delivered (just green 'Delivered' status)");
      console.log("4. 🔄 The badges update automatically every few seconds!");
      console.log("5. 🎯 Click 'Track' button to see live drone tracking");
      
      console.log("\n🔍 Monitoring started - check console every 15 seconds");
      console.log("🚀 Dashboard should show live progression updates!");
      
    } else {
      console.log("❌ Failed to approve delivery");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Instructions
console.log(`
🎯 COMPLETE DASHBOARD PROGRESSION WORKFLOW TEST

This test demonstrates the full automatic delivery progression system:

🎨 Visual Features:
- Real-time progression badges in dashboard table
- Yellow "Preparing" badges with countdown timers
- Blue "In Transit" badges with countdown timers  
- Spinning loader icons during active progression
- Automatic badge removal when delivered

🔄 Real-time Updates:
- Dashboard listens for storage events
- Progression badges update every few seconds
- No page refresh needed
- Cross-tab synchronization

⏱️ Realistic Timing:
- Emergency: 1 min preparation
- Urgent: 2 min preparation (this test)
- Routine: 3 min preparation
- Live countdown timers show remaining time

🧪 To run the test:
1. testCompleteWorkflow()
2. Open dashboard in another tab: http://localhost:3000/demo/doctor
3. Watch for progression badges in the Status column
4. Monitor console for real-time updates

Ready to test? Run: testCompleteWorkflow()
`);

// Make function available globally
if (typeof window !== 'undefined') {
  // @ts-ignore - Adding function to global window object for testing
  window['testCompleteWorkflow'] = testCompleteWorkflow;
}
