# WCAG 2.2 Rules Validation

This document lists all WCAG 2.2 accessibility rules currently validated by the All-Inclusive extension.

## Current Coverage

**Total Rules Implemented:** 11  
**WCAG Version:** 2.2  
**Principles Covered:** 4 of 4 (Perceivable, Operable, Understandable, Robust)

---

## 1. Perceivable
*Information and user interface components must be presentable to users in ways they can perceive.*

### 1.1.1 Non-text Content (Level A)
**Rule ID:** `image-alt-text`  
**What it checks:** All `<img>` elements must have an `alt` attribute  
**Severity:** Critical  
**Common violations:**
- Images without alt attributes
- Missing alt text on informative images

**Fix:**
```html
<!-- Bad -->
<img src="logo.png">

<!-- Good -->
<img src="logo.png" alt="Company Logo">

<!-- Decorative -->
<img src="decorative.png" alt="">
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
**Common violations:**
- `<div>` or `<span>` with click handlers but no keyboard support
- Custom controls without `tabindex` or keyboard event handlers
- Elements with `onclick` but missing keyboard equivalents

**Fix:**
```html
<!-- Bad -->
<div onclick="handleClick()">Click me</div>

<!-- Good -->
<button onclick="handleClick()">Click me</button>

<!-- Also Good -->
<div 
  role="button" 
  tabindex="0" 
  onclick="handleClick()"
  onkeydown="handleKeyPress(event)">
  Click me
</div>
```

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html

---

### 2.4.1 Bypass Blocks (Level A)
**Rule ID:** `bypass-blocks`  
**What it checks:** Pages should have a mechanism to skip repetitive content  
**Severity:** Moderate  
**Common violations:**
- Missing "Skip to main content" links
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

## 3. Understandable
*Information and the operation of user interface must be understandable.*

### 3.3.2 Labels or Instructions (Level A)
**Rule ID:** `form-labels`  
**What it checks:** All form inputs must have associated labels or instructions  
**Severity:** Critical  
**Requirements:**
- All form fields must have labels that describe their purpose
- Labels must be programmatically associated with their controls
- Instructions must be clear and available to all users

**Common violations:**
- Input fields without `<label>` elements
- Labels not associated via `for` attribute
- No aria-label or aria-labelledby on unlabeled inputs
- Missing instructions for complex inputs

**Fix:**
```html
<!-- Bad -->
<input type="text" name="email">

<!-- Good - Label with for attribute -->
<label for="email">Email Address:</label>
<input type="text" id="email" name="email">

<!-- Good - Wrapped label -->
<label>
  Email Address:
  <input type="text" name="email">
</label>

<!-- Good - ARIA label -->
<input type="text" name="email" aria-label="Email Address">
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
**What it checks:** All UI components must have accessible names and proper ARIA usage  
**Severity:** Critical  
**Common violations:**
- Buttons without accessible names
- Form inputs without labels
- Missing `aria-label` or `aria-labelledby` on icon buttons
- Form fields without associated `<label>` elements

**Fix:**
```html
<!-- Bad - button with no accessible name -->
<button>
  <svg><!-- Icon --></svg>
</button>

<!-- Good - button with aria-label -->
<button aria-label="Close dialog">
  <svg><!-- Close icon --></svg>
</button>

<!-- Bad - input without label -->
<input type="text" placeholder="Enter name">

<!-- Good - input with label -->
<label for="name">Name:</label>
<input id="name" type="text">

<!-- Also Good - wrapped in label -->
<label>
  Name:
  <input type="text">
</label>

<!-- Good - using aria-label -->
<input type="text" aria-label="Search">
```

**Learn more:** https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html

---

## Implementation Summary by WCAG Level

| Level | Rules Implemented | Percentage of Common Issues |
|-------|------------------|----------------------------|
| **A** | 6 rules | ~60% of critical issues |
| **AA** | 1 rule | ~85% when combined with A |
| **AAA** | 0 rules | Future enhancement |

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