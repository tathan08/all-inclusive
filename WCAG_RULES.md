# WCAG 2.2 Rules Validation

This document lists all WCAG 2.2 accessibility rules currently validated by the All-Inclusive extension.

## Current Coverage

**Total Rules Implemented:** 12  
**WCAG Version:** 2.2  
**Principles Covered:** 4 of 4 (Perceivable, Operable, Understandable, Robust)

---

## 1. Perceivable
*Information and user interface components must be presentable to users in ways they can perceive.*

### 1.1.1 Non-text Content (Level A)
**Rule ID:** `image-alt-text`  
**What it checks:** All `<img>` elements must have meaningful alt text  
**Severity:** Critical (missing alt), Serious (empty alt on meaningful images), Moderate (filename/generic text)  

**Enhanced Detection:**
1. **Missing alt attribute** (Critical) - Images without any alt attribute
2. **Empty alt on meaningful images** (Serious) - Non-decorative images with alt=""
3. **Filename-like alt text** (Moderate) - Alt text that looks like a filename (e.g., "image_final_v2.jpg")
4. **Generic alt text** (Moderate) - Unhelpful text like "image", "photo", "picture", "graphic"

**Decorative Image Detection:**
The rule considers images decorative if they:
- Are small (< 10x10 pixels)
- Have `role="presentation"` or `role="none"`
- Are inside links/buttons that already have text
- Are CSS background images

**Common violations:**
```html
<!-- Critical - No alt attribute -->
<img src="logo.png">

<!-- Serious - Empty alt on meaningful image -->
<img src="product.png" alt="">

<!-- Moderate - Filename as alt text -->
<img src="header.png" alt="header_final_v2.jpg">

<!-- Moderate - Generic alt text -->
<img src="team.png" alt="image">
```

**Fix:**
```html
<!-- Good - Descriptive alt text -->
<img src="logo.png" alt="Company Logo">
<img src="product.png" alt="Blue wireless headphones with noise cancellation">

<!-- Good - Decorative image -->
<img src="decorative.png" alt="" role="presentation">

<!-- Good - Image in link with text -->
<a href="/home">
  <img src="logo.png" alt="">
  <span>Home</span>
</a>
```

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html

**Note:** This rule skips elements that:
- Have `aria-hidden="true"`
- Use `role="presentation"` or `role="none"`
- Are visually hidden (display: none, visibility: hidden, opacity: 0)
- Already have accessible names via `aria-label` or `aria-labelledby`

---

### 1.3.1 Info and Relationships (Level A)
**Rule ID:** `heading-structure`  
**What it checks:** Pages must have proper heading structure and hierarchy  
**Severity:** Serious (missing H1, empty headings) / Moderate (skipped levels, multiple H1s)  

**Requirements:**
- Page must have at least one H1 heading (page title)
- Heading levels should not be skipped (e.g., H2 → H4)
- Headings must contain text content
- Best practice: Use only one H1 per page

**Why it matters:**
Screen reader users navigate by jumping between headings. A logical heading structure helps users understand page organization and find content quickly. Proper heading hierarchy creates a meaningful document outline.

**Common violations:**
- Pages without an H1 heading
- Skipping heading levels (H2 directly to H4, H5, or H6)
- Empty headings with no text content
- Multiple H1 headings on a single page
- Using heading tags for styling instead of semantic structure

**Fix:**
```html
<!-- Bad - Missing H1 -->
<h2>Section Title</h2>
<h3>Subsection</h3>

<!-- Bad - Skipped levels -->
<h1>Page Title</h1>
<h4>Subsection</h4>

<!-- Bad - Empty heading -->
<h2></h2>

<!-- Bad - Multiple H1s -->
<h1>Main Title</h1>
<h1>Another Title</h1>

<!-- Good - Proper hierarchy -->
<h1>Page Title</h1>
<h2>Main Section</h2>
<h3>Subsection</h3>
<h3>Another Subsection</h3>
<h2>Another Main Section</h2>
<h3>Its Subsection</h3>
```

**Best practices:**
- Reserve H1 for the main page title
- Use H2 for major sections
- Use H3 for subsections within H2s
- Don't use heading tags just for larger text (use CSS instead)
- Headings should describe the content that follows

**Learn more:** 
- https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html
- https://webaim.org/techniques/semanticstructure/
- https://accessibility.psu.edu/headingshtml/

---

### 1.4.3 Contrast (Minimum) (Level AA)
**Rule ID:** `color-contrast`  
**What it checks:** Text elements must have sufficient color contrast with their background  
**Severity:** Serious  
**Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio

**Advanced Features:**
- **Overlay Detection**: Uses `document.elementFromPoint()` to detect elements overlaying text
- **Effective Background**: Traverses DOM tree to find actual background color
- **Opacity Handling**: Considers transparent/semi-transparent backgrounds (checks alpha channel)
- **Smart Filtering**: Skips hidden elements, very small elements, and elements without text content

**Common violations:**
- Gray text on white backgrounds
- Colored text without sufficient contrast
- Similar foreground and background colors
- Text obscured by overlaying elements with different background colors

**Fix:**
```css
/* Bad - insufficient contrast */
.text { color: #aaa; background: #fff; } /* 2.3:1 */

/* Good - meets AA standard */
.text { color: #767676; background: #fff; } /* 4.54:1 */

/* Better - meets AAA standard */
.text { color: #595959; background: #fff; } /* 7.0:1 */
```

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

---

## 2. Operable
*User interface components and navigation must be operable.*

### 2.1.1 Keyboard (Level A)
**Rule ID:** `keyboard-accessible`  
**What it checks:** All interactive elements must be keyboard accessible  
**Severity:** Serious  

**Enhanced Detection:**
1. **Elements with onclick/ng-click/v-on:click attributes** - Traditional event handlers
2. **React components with cursor: pointer** - Detects React onClick handlers by inspecting computed styles

**Why this matters:**
React's `onClick` doesn't create HTML `onclick` attributes, making traditional detection insufficient. This rule uses `cursor: pointer` as a heuristic to identify clickable React components.

**Common violations:**
```html
<!-- Bad - onclick attribute -->
<div onclick="handleClick()">Click me</div>

<!-- Bad - React onClick (renders with cursor: pointer) -->
<div onClick={handleClick} style={{ cursor: 'pointer' }}>Click me</div>

<!-- Bad - Span with click handler -->
<span style="cursor: pointer" onclick="alert('clicked')">Click</span>
```

**Fix:**
```html
<!-- Good - Native button -->
<button onclick="handleClick()">Click me</button>

<!-- Good - React button -->
<button onClick={handleClick}>Click me</button>

<!-- Good - Custom element with full accessibility -->
<div 
  role="button" 
  tabindex="0" 
  onclick="handleClick()"
  onkeydown="handleKeyPress(event)">
  Click me
</div>

<!-- Good - React custom element -->
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyPress}
  style={{ cursor: 'pointer' }}>
  Click me
</div>
```

**Keyboard event handler example:**
```javascript
function handleKeyPress(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
}
```

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html

---

### 2.4.1 Bypass Blocks (Level A)
**Rule ID:** `bypass-blocks`  
**What it checks:** Pages with navigation should have a mechanism to skip repetitive content  
**Severity:** Moderate  

**Smart Detection:**
Only checks pages that have significant navigation:
- Pages with a `<nav>` element containing 3+ links, OR
- Pages with a `<header>` containing 3+ navigation items

This avoids false positives on simple test pages or single-page apps without repetitive navigation.

**Common violations:**
- Missing "Skip to main content" links on pages with navigation
- No bypass mechanism for repeated navigation

**Fix:**
```html
<!-- Good -->
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  
  <nav><!-- Navigation --></nav>
  
  <main id="main-content">
    <!-- Main content -->
  </main>
</body>
```

```css
/* Visually hide skip link until focused */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html

---

### 2.4.4 Link Purpose (In Context) (Level A)
**Rule ID:** `link-purpose`  
**What it checks:** Link text must clearly describe the link's destination  
**Severity:** Serious (empty links), Moderate (vague links)  
**Common violations:**
- Empty links with no text
- Vague link text: "click here", "read more", "here", "link"
- Links without accessible names

**Fix:**
```html
<!-- Bad -->
<a href="/article">Read more</a>
<a href="/page">Click here</a>
<a href="/doc"></a>

<!-- Good -->
<a href="/article">Read more about accessibility testing</a>
<a href="/page">Learn about WCAG 2.2 guidelines</a>
<a href="/doc" aria-label="Download accessibility report">
  <svg><!-- Download icon --></svg>
</a>
```

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html

---

### 2.4.3 Focus Order (Level A)
**Rule ID:** `focus-order`  
**What it checks:** Proper tabindex usage and focusable element visibility  
**Severity:** Serious (positive tabindex), Moderate (hidden focusable), Minor (negative on native)  

**Requirements:**
- No positive tabindex values (tabindex > 0)
- Focusable elements should not be hidden
- Native interactive elements should remain in tab order

**Common violations:**
- Elements with tabindex="1", tabindex="2", etc.
- Hidden elements (display: none, visibility: hidden) with tabindex >= 0
- Buttons or links with tabindex="-1" removed from keyboard access
- Disrupted natural tab order

**Fix:**
```html
<!-- Bad - Positive tabindex -->
<div tabindex="1">First</div>
<div tabindex="2">Second</div>

<!-- Bad - Hidden but focusable -->
<button tabindex="0" style="display: none;">Hidden Button</button>

<!-- Bad - Native element removed from tab order -->
<button tabindex="-1">Click me</button>

<!-- Good - Natural tab order -->
<button>First Button</button>
<a href="/page">Link</a>
<button>Second Button</button>

<!-- Good - Custom element in natural order -->
<div role="button" tabindex="0">Custom Button</div>

<!-- Good - Programmatic focus only (valid use of -1) -->
<div tabindex="-1" id="error-message">Error: Please fix...</div>
```

**Valid uses of tabindex:**
- `tabindex="0"` - Adds element to natural tab order
- `tabindex="-1"` - Allows programmatic focus but not keyboard navigation (use sparingly, valid for modals/error messages)
- No tabindex - Use native interactive elements when possible

**Learn more:** 
- https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
- https://webaim.org/techniques/keyboard/tabindex

---

## 3. Understandable
*Information and the operation of user interface must be understandable.*

### 3.3.2 Labels or Instructions (Level A)
**Rule ID:** `form-labels`  
**What it checks:** All form inputs must have associated labels or instructions  
**Severity:** Critical (no label), Moderate (aria-label only, no visible label)  

**Requirements:**
- All form fields must have labels that describe their purpose
- Labels must be programmatically associated with their controls
- **Visible labels are strongly preferred** for inclusivity
- Instructions must be clear and available to all users

**Enhanced Detection:**
1. **Missing labels** (Critical) - No label, aria-label, or aria-labelledby
2. **aria-label only, no visible label** (Moderate) - Has aria-label but no visible `<label>` element

**Why visible labels matter:**
- Larger click targets for users with motor impairments
- Visual cues for users with cognitive disabilities
- Benefits users who don't use screen readers
- Complies with WCAG 2.5.3 (Label in Name)

**Common violations:**
```html
<!-- Critical - No label at all -->
<input type="text" name="email">

<!-- Moderate - aria-label only -->
<input type="text" name="email" aria-label="Email Address">
```

**Fix:**
```html
<!-- Best - Visible label with for attribute -->
<label for="email">Email Address:</label>
<input type="text" id="email" name="email">

<!-- Good - Wrapped label -->
<label>
  Email Address:
  <input type="text" name="email">
</label>

<!-- Acceptable - aria-label as supplement -->
<label for="email">Email:</label>
<input type="text" id="email" name="email" aria-label="Email Address (required)">
```

**Learn more:** 
- https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html
- https://webaim.org/techniques/forms/
- https://www.w3.org/WAI/tutorials/forms/labels/

---

### 1.3.1 Info and Relationships (Level A) - Fieldsets
**Rule ID:** `fieldset-legend`  
**What it checks:** Related form controls must be grouped with fieldset and legend  
**Severity:** Serious (radio buttons), Moderate (checkbox groups)  
**Requirements:**
- Radio button groups must be wrapped in `<fieldset>` with `<legend>`
- Groups of 3+ related checkboxes should use `<fieldset>` with `<legend>`
- Legend must have descriptive text content

**Common violations:**
- Radio buttons not in fieldset
- Fieldset without legend
- Empty or missing legend text
- Checkboxes that appear related but aren't grouped

**Fix:**
```html
<!-- Bad -->
<label><input type="radio" name="shipping" value="standard"> Standard</label>
<label><input type="radio" name="shipping" value="express"> Express</label>

<!-- Good -->
<fieldset>
  <legend>Shipping Method</legend>
  <label><input type="radio" name="shipping" value="standard"> Standard Shipping</label>
  <label><input type="radio" name="shipping" value="express"> Express Shipping</label>
  <label><input type="radio" name="shipping" value="overnight"> Overnight</label>
</fieldset>

<!-- Good - Checkbox group -->
<fieldset>
  <legend>Select your interests</legend>
  <label><input type="checkbox" name="interests" value="tech"> Technology</label>
  <label><input type="checkbox" name="interests" value="design"> Design</label>
  <label><input type="checkbox" name="interests" value="business"> Business</label>
</fieldset>
```

**Learn more:** 
- https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html
- https://webaim.org/techniques/forms/controls#checkbox
- https://www.w3.org/WAI/tutorials/forms/grouping/

---

### 3.3.2 Labels or Instructions (Level A) - Required Fields
**Rule ID:** `required-fields`  
**What it checks:** Required fields must be programmatically indicated  
**Severity:** Serious  
**Requirements:**
- Required fields must have `required` attribute or `aria-required="true"`
- Don't rely solely on visual indicators (asterisks, color, text)
- Screen readers must be able to identify required fields

**Common violations:**
- Visual asterisk (*) or "required" text without programmatic indication
- Color-only indicators for required fields
- Required attribute missing on visually-marked required fields

**Fix:**
```html
<!-- Bad - Visual indicator only -->
<label>Email Address *</label>
<input type="text" name="email">

<!-- Good - Programmatic indication -->
<label>Email Address *</label>
<input type="text" name="email" required>

<!-- Good - ARIA required -->
<label>Email Address *</label>
<input type="text" name="email" aria-required="true">

<!-- Best - Both visual and programmatic -->
<label>
  Email Address 
  <span aria-label="required">*</span>
</label>
<input type="text" name="email" required>
```

**Learn more:** 
- https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html
- https://webaim.org/techniques/forms/controls#required
- https://www.w3.org/WAI/tutorials/forms/instructions/#required

---

## 4. Robust
*Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.*

### 4.1.1 Parsing (Level A)
**Rule ID:** `valid-html`  
**What it checks:** HTML must be well-formed with unique IDs  
**Severity:** Serious  
**Common violations:**
- Duplicate ID attributes on the same page
- Invalid HTML structure

**Fix:**
```html
<!-- Bad - duplicate IDs -->
<div id="content">First section</div>
<div id="content">Second section</div>

<!-- Good - unique IDs -->
<div id="content-1">First section</div>
<div id="content-2">Second section</div>

<!-- Better - use classes for styling -->
<div class="content">First section</div>
<div class="content">Second section</div>
```

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/parsing.html

---

### 4.1.2 Name, Role, Value (Level A)
**Rule ID:** `aria-usage`  
**What it checks:** All UI components must have accessible names  
**Severity:** Critical  

**Enhanced Detection:**
1. **Buttons without accessible names** - Including buttons with only `aria-hidden` content
2. **Visible text extraction** - Excludes text inside elements with `aria-hidden="true"`

**Why aria-hidden matters:**
Content with `aria-hidden="true"` is hidden from screen readers, so it doesn't provide an accessible name even if visually present.

**Common violations:**
```html
<!-- Bad - Empty button -->
<button></button>

<!-- Bad - Only aria-hidden content -->
<button>
  <span aria-hidden="true">×</span>
</button>

<!-- Bad - Icon without accessible name -->
<button>
  <svg><!-- Close icon --></svg>
</button>
```

**Fix:**
```html
<!-- Good - Visible text -->
<button>Close</button>

<!-- Good - aria-label for icon buttons -->
<button aria-label="Close dialog">
  <span aria-hidden="true">×</span>
</button>

<!-- Good - Image with alt text -->
<button>
  <img src="close.svg" alt="Close">
</button>

<!-- Good - Visually hidden text -->
<button>
  <span aria-hidden="true">×</span>
  <span class="sr-only">Close dialog</span>
</button>
```

**Note:** Form input label checking has been moved to the `form-labels` rule (understandable principle) to avoid duplication.

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html

---

## Implementation Summary by WCAG Level

| Level | Rules | Principle Breakdown |
|-------|-------|---------------------|
| **A** | 11 rules | **Perceivable:** 2 (image-alt-text, heading-structure)<br>**Operable:** 4 (keyboard-accessible, bypass-blocks, link-purpose, focus-order)<br>**Understandable:** 3 (form-labels, fieldset-legend, required-fields)<br>**Robust:** 2 (valid-html, aria-usage) |
| **AA** | 1 rule | **Perceivable:** 1 (color-contrast) |
| **AAA** | 0 rules | Future enhancement |
| **Total** | **12 rules** | Covers all 4 WCAG principles (POUR) |

### Coverage Analysis
- ✅ **Perceivable:** 3/13 common rules (~23%)
- ✅ **Operable:** 4/17 common rules (~24%)
- ✅ **Understandable:** 3/15 common rules (~20%)
- ✅ **Robust:** 2/4 common rules (~50%)

**Focus:** Critical Level A and AA rules that catch the most common accessibility issues, including form accessibility, keyboard navigation, semantic structure, and color contrast.

---

## Roadmap: Additional Rules to Implement

### High Priority (Level A & AA)

#### Perceivable
- [ ] **1.3.1** Info and Relationships (Level A) - Semantic structure
- [ ] **1.3.2** Meaningful Sequence (Level A) - Reading order
- [ ] **1.4.1** Use of Color (Level A) - Color not sole indicator
- [ ] **1.4.11** Non-text Contrast (Level AA) - UI component contrast
- [ ] **1.4.12** Text Spacing (Level AA) - Adjustable text spacing

#### Operable
- [ ] **2.1.2** No Keyboard Trap (Level A) - Keyboard focus can move away
- [ ] **2.4.2** Page Titled (Level A) - Descriptive page titles
- [ ] **2.4.3** Focus Order (Level A) - Logical focus sequence
- [ ] **2.4.6** Headings and Labels (Level AA) - Descriptive headings
- [ ] **2.4.7** Focus Visible (Level AA) - Visible keyboard focus
- [ ] **2.5.3** Label in Name (Level A) - Visible label matches accessible name

#### Understandable
- [ ] **3.1.1** Language of Page (Level A) - Page language declared
- [ ] **3.1.2** Language of Parts (Level AA) - Language changes identified
- [ ] **3.2.1** On Focus (Level A) - No context change on focus
- [ ] **3.2.2** On Input (Level A) - No context change on input
- [ ] **3.3.1** Error Identification (Level A) - Errors clearly identified
- [ ] **3.3.2** Labels or Instructions (Level A) - Clear form labels

#### Robust
- [ ] **4.1.3** Status Messages (Level AA) - Accessible status updates

### WCAG 2.2 Specific Rules (New in 2.2)
- [ ] **2.4.11** Focus Not Obscured (Minimum) (Level AA)
- [ ] **2.4.12** Focus Not Obscured (Enhanced) (Level AAA)
- [ ] **2.5.7** Dragging Movements (Level AA)
- [ ] **2.5.8** Target Size (Minimum) (Level AA)
- [ ] **3.2.6** Consistent Help (Level A)
- [ ] **3.3.7** Redundant Entry (Level A)
- [ ] **3.3.8** Accessible Authentication (Minimum) (Level AA)
- [ ] **3.3.9** Accessible Authentication (Enhanced) (Level AAA)

---

## Additional Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WCAG 2.2 Understanding Docs](https://www.w3.org/WAI/WCAG22/Understanding/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [W3C ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)