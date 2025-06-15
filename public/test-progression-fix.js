// Test script to verify the delivery progression fix
console.log("🚁 Testing Delivery Progression Fix");

// Test the complete progression cycle
async function testProgressionFix() {
  try {
    // Import the required functions from the module
    const { 
      startDeliveryProgression, 
      getDeliveryProgression, 
      clearDeliveryProgression,
      clearAllProgressions 
    } = await import('lib/delivery-progression.js');
    
    const testDeliveryId = "FIX-TEST-" + Date.now();
    const testPatientId = "P-12847";
    const testDoctorId = "DOC-123";
    
    console.log("🧪 Starting progression fix test for delivery:", testDeliveryId);
    
    // Clear any existing progressions first
    clearAllProgressions();
    
    // Start a quick 30-second test (15s prep + 15s delivery)
    startDeliveryProgression(
      testDeliveryId,
      testPatientId,
      testDoctorId,
      0.25, // 15 seconds (0.25 minutes) estimated delivery time
      0.25  // 15 seconds (0.25 minutes) preparation time
    );
    
    console.log("✅ Test progression started");
    console.log("⏱️  Timeline (30 seconds total):");
    console.log("   - Now: Approved/Pending");
    console.log("   - +15s: In Transit");
    console.log("   - +30s: Delivered");
    
    // Check progression status every 5 seconds
    let checkCount = 0;
    const statusChecker = setInterval(() => {
      checkCount++;
      const progression = getDeliveryProgression(testDeliveryId);
      
      if (progression) {
        const now = new Date();
        const elapsedSeconds = (now.getTime() - progression.approvedAt.getTime()) / 1000;
        console.log(`📊 Check ${checkCount}: Elapsed ${elapsedSeconds.toFixed(1)}s, Progression active`);
      } else {
        console.log(`📊 Check ${checkCount}: No progression found - should be completed`);
        clearInterval(statusChecker);
      }
      
      // Stop checking after 45 seconds
      if (checkCount >= 9) {
        clearInterval(statusChecker);
        console.log("🏁 Test monitoring completed");
      }
    }, 5000);
    
    console.log("🔍 Monitor the console for progression updates...");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Instructions
console.log(`
🧪 DELIVERY PROGRESSION FIX TEST

This test verifies that the delivery progression correctly transitions
through all phases: Approved → In-Transit → Delivered

Run the test:
1. testProgressionFix()
2. Watch console logs for 30 seconds
3. Check /demo/tracking page for visual updates

Expected timeline:
- 0s: Approved (preparation phase)
- 15s: In-Transit (delivery phase) 
- 30s: Delivered (completion)

Ready to test? Run: testProgressionFix()
`);

if (typeof window !== 'undefined') {
  // @ts-ignore - Adding function to global window object for testing
  window['testProgressionFix'] = testProgressionFix;
}

