# Implementation Plan

- [ ] 1. Write bug condition exploration property test
  - **Property 1: Bug Condition** - Mobile Width Overflow
  - **IMPORTANT**: Write this property-based test BEFORE implementing the fix
  - **GOAL**: Surface counterexamples that demonstrate the overflow bug exists
  - **Scoped PBT Approach**: Test concrete failing cases: screen widths 400px, 500px, 600px
  - Test that current width calculation `Math.min(w - 32, 400)` causes overflow for mobile widths
  - For width=400px: current calc = Math.min(368, 400) = 368px, but available = 368px (overflows by 32px due to padding)
  - For width=500px: current calc = Math.min(468, 400) = 400px, but available = 468px (uses most of viewport)
  - Run test on UNFIXED code - expect FAILURE (this confirms the bug exists)
  - Document counterexamples found to understand root cause
  - _Requirements: 1.1, 1.2_

- [ ] 2. Implement the width constraint fix in useEffect
  - Change from: `const availableW = Math.min(w - 32, 400);`
  - Change to: `const availableW = Math.min(w - 32, 400, w * 0.95);`
  - Add comment explaining the 5% margin reservation
  - _Bug_Condition: isBugCondition(input) where input.windowWidth < 640 and calculated width > available viewport_
  - _Expected_Behavior: width ≤ (windowWidth - 32) AND width ≤ 400 AND width ≤ windowWidth * 0.95_
  - _Preservation: Tablet (640-1023px) and Desktop (≥1024px) dimensions unchanged_
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Add height constraint for mobile
  - Add constraint: `const availableH = Math.min(availableW * 1.35, window.innerHeight - 100);`
  - Reserve 100px for UI elements (navigation, footer, etc.)
  - Apply availableH to dimensions.height for mobile only
  - _Bug_Condition: Height must not exceed viewport on mobile devices_
  - _Expected_Behavior: height ≤ (width * 1.35) AND height ≤ (window.innerHeight - 100)_
  - _Preservation: Tablet and Desktop height calculations unchanged_
  - _Requirements: 2.1, 3.1, 3.2_

- [ ] 4. Add CSS overflow handling to wrapper
  - Add `overflow-x-hidden` to the book wrapper div
  - Ensure the max-w-5xl wrapper doesn't cause horizontal scrolling
  - Consider adding `box-sizing: border-box` to prevent padding from adding to width
  - _Bug_Condition: Horizontal scrolling occurs when book width exceeds viewport_
  - _Expected_Behavior: No horizontal scrollbar on any mobile screen size_
  - _Preservation: Tablet and Desktop layout unchanged_
  - _Requirements: 2.1, 3.1, 3.2_

- [ ] 5. Write preservation tests for tablet/desktop
  - **Property 2: Preservation** - Non-Mobile Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Screen width 768px (tablet) produces width=350, height=480 on unfixed code
  - Observe: Screen width 1280px (desktop) produces width=450, height=600 on unfixed code
  - Write property-based tests asserting these dimensions are preserved
  - Property: For all widths 640-1023px, width=350 and height=480
  - Property: For all widths ≥1024px, width=450 and height=600
  - Run tests on UNFIXED code - expect PASS (confirms baseline behavior)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Manual testing on various screen sizes
  - Test on mobile (320px, 375px, 414px, 600px) - verify no horizontal overflow
  - Test on tablet (768px, 1024px) - verify 350px width is used
  - Test on desktop (1280px, 1920px) - verify 450px width is used
  - Test responsive transitions - verify smooth width changes on resize
  - Verify touch interactions work correctly on mobile (swiping, page flipping)
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all property tests pass
  - Ensure manual testing confirms no overflow on mobile
  - Ensure tablet/desktop dimensions are preserved
  - Ask the user if questions arise.
