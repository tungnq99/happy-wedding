# Book Gallery Mobile Overflow Bugfix Design

## Overview

The book gallery component overflows the screen width on mobile devices (screen width < 640px) because the current width calculation `Math.min(w - 32, 400)` allows the book to exceed the viewport when the screen width is between 432px and 640px. This design document proposes solutions to constrain the book width within the viewport on mobile while maintaining existing tablet/desktop behavior.

## Glossary

- **Bug_Condition (C)**: Screen width < 640px AND calculated width > available viewport width (causing overflow)
- **Property (P)**: Book width shall be constrained to fit within viewport with proper padding (max-width: 100% - padding)
- **Preservation**: Existing tablet (350px) and desktop (450px) dimensions that must remain unchanged
- **BookGallery component**: The React component that renders the interactive book flip gallery
- **dimensions state**: Object containing width and height values for the book component

## Bug Details

### Bug Condition

The bug manifests when the screen width is less than 640px and the calculated width `Math.min(w - 32, 400)` exceeds the available viewport width. For example:
- At screen width 500px: calculated width = Math.min(500 - 32, 400) = 468px, but available width = 500px - 32px (padding) = 468px (borderline)
- At screen width 600px: calculated width = Math.min(600 - 32, 400) = 400px, but available width = 600px - 32px = 568px (seems fine, but max-w-5xl wrapper adds constraints)

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { windowWidth: number, containerPadding: number }
  OUTPUT: boolean
  
  IF input.windowWidth >= 640 THEN
    RETURN false  // Not mobile, no bug
  END IF
  
  availableWidth := input.windowWidth - input.containerPadding
  calculatedWidth := Math.min(input.windowWidth - 32, 400)
  
  RETURN calculatedWidth > availableWidth
END FUNCTION
```

### Examples

- **Example 1 (Bug)**: Screen width 500px, padding 16px (32px total). Available width = 468px. Calculated width = Math.min(468, 400) = 400px. Book fits but uses most of viewport.
- **Example 2 (Bug)**: Screen width 600px, padding 16px. Available width = 568px. Calculated width = Math.min(568, 400) = 400px. Book fits but max-w-5xl wrapper may cause issues.
- **Example 3 (Bug)**: Screen width 400px (small mobile), padding 16px. Available width = 368px. Calculated width = Math.min(368, 400) = 368px. Book overflows by 32px.
- **Edge Case (Should Work)**: Screen width 320px, padding 16px. Available width = 288px. Calculated width = Math.min(288, 400) = 288px. Book fits perfectly.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Tablet devices (640px ≤ screen width < 1024px) shall continue to use 350px width, 480px height
- Desktop devices (screen width ≥ 1024px) shall continue to use 450px width, 600px height
- The max-w-5xl wrapper class shall remain unchanged
- All other responsive behaviors (mobileScrollSupport, usePortrait, etc.) shall remain unchanged

**Scope:**
All inputs where screen width is 640px or greater should be completely unaffected by this fix. This includes:
- Tablet devices (640px to 1023px)
- Desktop devices (1024px and above)
- Any non-width-related properties (height calculation, scroll support, etc.)

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Incorrect Width Constraint**: The current calculation `Math.min(w - 32, 400)` does not account for the container's actual available width
   - The wrapper div has `max-w-5xl mx-auto` which constrains content but doesn't prevent overflow
   - The book component's width is set directly without considering the wrapper's constraints

2. **Missing Width Limitation**: The calculated width can exceed the viewport minus padding
   - No explicit constraint to ensure width ≤ (window.innerWidth - container padding)

3. **Wrapper Ineffectiveness**: The `max-w-5xl` class may not be sufficient to prevent overflow on small screens
   - max-w-5xl is typically 64rem (1024px) which is larger than mobile viewports

4. **Height Calculation Dependency**: The height is calculated as width * 1.35, so fixing width alone may not be sufficient
   - Height must also be constrained to prevent vertical overflow

## Correctness Properties

Property 1: Bug Condition - Mobile Width Constraint

_For any_ screen width less than 640px, the fixed BookGallery component SHALL constrain the book width to fit within the viewport with proper padding, ensuring no horizontal scrolling occurs.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Non-Mobile Behavior

_For any_ screen width 640px or greater, the fixed BookGallery component SHALL produce the same result as the original code, preserving tablet dimensions (350px width, 480px height) and desktop dimensions (450px width, 600px height).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

**File**: `web/app/components/book-gallery.tsx`

**Function**: `BookGallery` component's `useEffect` hook for dimension calculation

**Specific Changes**:

1. **Mobile Width Constraint**: Add explicit constraint to ensure mobile width fits within viewport
   - Change from: `const availableW = Math.min(w - 32, 400);`
   - Change to: `const availableW = Math.min(w - 32, 400, w);` (ensure width ≤ viewport width)
   - Better approach: `const availableW = Math.min(w - 32, 400, w * 0.95);` (reserve 5% margin)

2. **Height Constraint**: Ensure height doesn't exceed viewport height on mobile
   - Add constraint: `const availableH = Math.min(availableW * 1.35, window.innerHeight - 100);`
   - Reserve 100px for UI elements (navigation, footer, etc.)

3. **Wrapper Adjustment**: Consider removing or adjusting max-w-5xl wrapper on mobile
   - Option A: Keep wrapper but add overflow-hidden to parent
   - Option B: Use conditional wrapper based on screen size

### Implementation Options

**Option 1: Simple Width Constraint (Recommended)**
```typescript
// In the useEffect hook
if (w < 640) { // Mobile
  setIsMobile(true);
  // Constrain width to fit within viewport with padding
  const maxWidth = Math.min(w - 32, 400, w * 0.95);
  setDimensions({
    width: maxWidth,
    height: maxWidth * 1.35
  });
}
```

**Option 2: Viewport-Based Constraint**
```typescript
// In the useEffect hook
if (w < 640) { // Mobile
  setIsMobile(true);
  // Use viewport width minus padding, capped at reasonable maximum
  const availableWidth = Math.min(w - 32, 400);
  const constrainedWidth = Math.min(availableWidth, w * 0.95);
  setDimensions({
    width: constrainedWidth,
    height: Math.min(constrainedWidth * 1.35, window.innerHeight - 100)
  });
}
```

**Option 3: CSS-Only Solution (Alternative)**
```typescript
// In the useEffect hook - keep current calculation
if (w < 640) {
  setIsMobile(true);
  const availableW = Math.min(w - 32, 400);
  setDimensions({
    width: availableW,
    height: availableW * 1.35
  });
}

// In the component return - add CSS constraints
<div className="w-full max-w-5xl mx-auto flex justify-center overflow-x-hidden">
  <motion.div
    className="relative w-full"
    style={{ maxWidth: '100%' }}
  >
    {/* ... book component ... */}
  </motion.div>
</div>
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, verify the bug exists on current code, then implement the fix and verify it resolves the issue while preserving existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Confirm the overflow issue exists on mobile devices and understand the exact conditions.

**Test Plan**: 
1. Open the book gallery on various mobile screen sizes (320px, 375px, 414px, 600px)
2. Measure the actual book width vs available viewport width
3. Verify horizontal scrolling occurs when book width exceeds viewport

**Test Cases**:
1. **Small Mobile Test (320px)**: Book should fit within 320px viewport (will fail on unfixed code)
2. **Medium Mobile Test (375px)**: Book should fit within 375px viewport (will fail on unfixed code)
3. **Large Mobile Test (600px)**: Book should fit within 600px viewport (may fail on unfixed code)
4. **Tablet Test (768px)**: Book should use tablet dimensions (350px) - should pass

**Expected Counterexamples**:
- Book width exceeds viewport width on screens 400-600px
- Horizontal scrollbar appears on mobile devices
- Book content is cut off or requires scrolling to view

### Fix Checking

**Goal**: Verify that for all mobile screen widths, the fixed component produces a width that fits within the viewport.

**Pseudocode:**
```
FOR ALL screenWidth WHERE screenWidth < 640 DO
  result := calculateDimensions(screenWidth)
  ASSERT result.width ≤ screenWidth - 32  // Account for padding
  ASSERT result.width ≤ 400  // Respect max width
  ASSERT result.width ≤ screenWidth * 0.95  // Reserve 5% margin
END FOR
```

### Preservation Checking

**Goal**: Verify that for all non-mobile screen widths, the fixed component produces the same dimensions as the original code.

**Pseudocode:**
```
FOR ALL screenWidth WHERE screenWidth >= 640 DO
  result := calculateDimensions(screenWidth)
  IF 640 ≤ screenWidth < 1024 THEN
    ASSERT result.width = 350 AND result.height = 480
  ELSE IF screenWidth >= 1024 THEN
    ASSERT result.width = 450 AND result.height = 600
  END IF
END FOR
```

**Testing Approach**: Manual testing on actual devices and browser devtools is recommended because:
- Mobile viewport behavior is best verified on real devices
- Touch interactions and scroll behavior need physical testing
- Visual appearance should be verified across multiple screen sizes

**Test Plan**: 
1. Test on tablet (768px, 1024px) - verify 350px width is used
2. Test on desktop (1280px, 1920px) - verify 450px width is used
3. Test on mobile (320px, 375px, 414px, 600px) - verify no overflow
4. Test responsive transitions - verify smooth width changes on resize

### Unit Tests

- Test width calculation for mobile screen sizes (320px, 375px, 414px, 600px)
- Test width calculation for tablet screen sizes (768px, 1024px)
- Test width calculation for desktop screen sizes (1280px, 1920px)
- Test height calculation maintains 1.35 aspect ratio on mobile
- Test that dimensions don't exceed viewport on mobile

### Property-Based Tests

- Generate random screen widths < 640px and verify width ≤ (viewport - padding)
- Generate random screen widths ≥ 640px and verify tablet/desktop dimensions are preserved
- Test edge cases: exactly 640px, exactly 1024px, very small screens (200px)

### Integration Tests

- Test full book gallery component on mobile device simulation
- Test responsive behavior when resizing from desktop to mobile
- Test touch interactions on mobile (swiping, page flipping)
- Test that no horizontal scrollbar appears on any screen size
- Test that book content is fully visible without scrolling
