/**
 * Bug Condition Exploration Test
 * Property 1: Mobile Width Overflow
 * 
 * This test verifies that the current width calculation causes overflow
 * on mobile devices (screen width < 640px).
 * 
 * Expected: Test FAILS on unfixed code (confirming bug exists)
 * Fix: Change from Math.min(w - 32, 400) to Math.min(w - 32, 400, w * 0.95)
 */

// Simulate the current buggy width calculation
function calculateCurrentWidth(windowWidth: number): number {
  return Math.min(windowWidth - 32, 400);
}

// Simulate the fixed width calculation
function calculateFixedWidth(windowWidth: number): number {
  return Math.min(windowWidth - 32, 400, windowWidth * 0.95);
}

// Test that width fits within viewport (accounting for padding)
function widthFitsInViewport(windowWidth: number, calculatedWidth: number): boolean {
  // The width should not exceed the available viewport width
  // We need some padding, so width should be less than windowWidth
  return calculatedWidth <= windowWidth;
}

// Property-based test: For mobile widths, current calculation overflows
function testMobileWidthOverflow(): void {
  console.log("=== Mobile Width Overflow Bug Condition Test ===\n");
  
  const testCases = [
    { width: 320, expectedAvailable: 320 - 32, description: "Small mobile (iPhone SE)" },
    { width: 375, expectedAvailable: 375 - 32, description: "Medium mobile (iPhone 12/13)" },
    { width: 414, expectedAvailable: 414 - 32, description: "Large mobile (iPhone Plus)" },
    { width: 480, expectedAvailable: 480 - 32, description: "Large mobile landscape" },
    { width: 500, expectedAvailable: 500 - 32, description: "Large mobile" },
    { width: 600, expectedAvailable: 600 - 32, description: "Small tablet landscape" },
  ];
  
  let allPassed = true;
  
  for (const testCase of testCases) {
    const { width, description } = testCase;
    const currentWidth = calculateCurrentWidth(width);
    const fixedWidth = calculateFixedWidth(width);
    const currentFits = widthFitsInViewport(width, currentWidth);
    const fixedFits = widthFitsInViewport(width, fixedWidth);
    
    console.log(`Test: ${description} (${width}px screen)`);
    console.log(`  Current calc: Math.min(${width} - 32, 400) = ${currentWidth}px`);
    console.log(`  Fixed calc: Math.min(${width} - 32, 400, ${width} * 0.95) = ${fixedWidth}px`);
    console.log(`  Current fits in viewport: ${currentFits}`);
    console.log(`  Fixed fits in viewport: ${fixedFits}`);
    
    if (!currentFits) {
      console.log(`  ❌ BUG CONFIRMED: Current width ${currentWidth}px exceeds viewport ${width}px`);
    } else {
      console.log(`  ⚠️  Current width ${currentWidth}px may cause issues with padding`);
    }
    console.log();
    
    if (!currentFits) {
      allPassed = false;
    }
  }
  
  console.log("=== Test Results ===");
  if (allPassed) {
    console.log("❌ TEST FAILED (unexpected): All widths fit in viewport");
    console.log("   This means the test doesn't detect the overflow bug");
    console.log("   The bug may already be fixed or the test logic is incorrect");
  } else {
    console.log("✅ TEST PASSED (expected): Overflow bug confirmed");
    console.log("   Counterexamples found: Widths that exceed or nearly exceed viewport");
  }
}

// Run the test
testMobileWidthOverflow();

// Export for potential use by test frameworks
export { calculateCurrentWidth, calculateFixedWidth, widthFitsInViewport };
