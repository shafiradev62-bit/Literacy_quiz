# 🧪 Playwright Testing Guide

## Overview
Comprehensive Playwright tests for Nasi Jamblang Story application covering:
- ✅ Student identity form
- ✅ Loading screen flow
- ✅ Unit selection
- ✅ Exam functionality
- ✅ Simulation interactions (Units 8, 9, 10)
- ✅ Language switching (EN/ID)
- ✅ Supabase session management
- ✅ Responsive design

## Test Files

### 1. `basic-functionality.spec.ts`
Quick tests for core functionality:
- Homepage loading
- Student form completion
- Device ID storage
- Language toggle
- Responsive design (mobile & tablet)
- Unit navigation

### 2. `complete-user-journey.spec.ts`
End-to-end tests for complete user flows:
- Full assessment from identity to results
- Unit 10 PISA simulation testing
- Language switching
- Supabase session verification

## 🚀 Running Tests

### Prerequisites
```bash
# Make sure dependencies are installed
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

### Start Development Server
```bash
npm run dev
```
The app should be running at `http://localhost:5173`

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test Files
```bash
# Basic functionality tests only
npx playwright test tests/basic-functionality.spec.ts

# Complete user journey tests only
npx playwright test tests/complete-user-journey.spec.ts
```

### Run Tests with Browser Visible (Headed Mode)
```bash
# See the browser while tests run
npx playwright test --headed

# Or use UI mode for interactive testing
npx playwright test --ui
```

### Run Single Test
```bash
# Run test by name pattern
npx playwright test -g "should complete student form"

# Run specific test file in headed mode
npx playwright test tests/basic-functionality.spec.ts --headed
```

### Generate Report
```bash
# View test report
npx playwright show-report
```

## 📋 Test Coverage

### ✅ User Authentication Flow
- [x] Student identity form displays
- [x] Form validation
- [x] Form submission
- [x] Loading screen (30 seconds)
- [x] Transition to unit selection

### ✅ Unit Selection
- [x] All 10 units displayed
- [x] Unit metadata (title, subtitle, theme)
- [x] Unit selection navigation
- [x] Unit intro screen

### ✅ Exam Functionality
- [x] Question rendering (MCQ, Checkbox, Open-ended)
- [x] Answer selection
- [x] Navigation (Next/Previous)
- [x] Question flagging
- [x] Progress tracking
- [x] Timer display
- [x] Submit assessment

### ✅ Simulation Tests (Units 8, 9, 10)
- [x] Simulation controls visible
- [x] Parameter adjustment
- [x] Run simulation
- [x] Results display
- [x] Record data to history
- [x] History table updates

### ✅ Supabase Integration
- [x] Device ID creation & storage
- [x] Session creation on exam start
- [x] Auto-save answers (debounced 800ms)
- [x] Session completion with score
- [x] Student profile linkage

### ✅ Language Support
- [x] English/Indonesian toggle
- [x] Content translation
- [x] UI element translation

### ✅ Responsive Design
- [x] Mobile viewport (375x667)
- [x] Tablet viewport (768x1024)
- [x] Desktop viewport (default)

## 🔍 Debugging Tests

### Enable Verbose Logging
Tests include console.log statements with emojis:
- 📝 Form filling
- ⏳ Loading states
- 📚 Unit selection
- ✍️ Answering questions
- ✅ Success confirmations

### Take Screenshots
Add to any test:
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Pause Execution
```typescript
await page.pause(); // Opens Playwright inspector
```

### Trace Viewer
```bash
# Run with tracing
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## 🎯 Test Data

### Sample Student Profiles Used in Tests
1. **Test Student** - 12A - Test High School
2. **Test User** - 12B - Test School
3. **Language Test** - 12C - Test School
4. **Session Test** - 12D - Test School
5. **John Doe** - 12A - SMA Test
6. **Jane Doe** - 12B - SMA Test

### Test Emails
- test@student.com
- test2@student.com
- lang@test.com
- session@test.com
- john@test.com
- jane@test.com
- exam@test.com

## ⚙️ Configuration

### Playwright Config
Located in `playwright.config.ts`
- Base URL: `http://localhost:5173` (Vite dev server)
- Browser: Chromium (default)
- Timeout: 30 seconds per test
- Retries: 0 (can be increased for CI)

### Test Isolation
Each test runs in isolation with:
- Fresh browser context
- Clean localStorage
- No shared state between tests

## 🐛 Common Issues

### Issue: "Cannot connect to dev server"
**Solution:** Make sure `npm run dev` is running before tests

### Issue: "Timeout waiting for element"
**Solution:** 
- Increase timeout: `{ timeout: 10000 }`
- Check if element selector is correct
- Verify app state (loading, errors, etc.)

### Issue: "localStorage is empty"
**Solution:** 
- Ensure form is submitted before checking localStorage
- Add wait time: `await page.waitForTimeout(1000)`

### Issue: "Tests fail intermittently"
**Solution:**
- Add more explicit waits
- Use `expect().toBeVisible()` instead of `waitForTimeout()`
- Check for race conditions

## 📊 CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run dev &
      - run: npx playwright test
```

## 📝 Adding New Tests

### Template
```typescript
import { test, expect } from "../playwright-fixture";

test.describe("Feature Name", () => {
  test("should do something", async ({ page }) => {
    // Arrange
    await page.goto("/");
    
    // Act
    // ... perform actions
    
    // Assert
    await expect(something).toBeVisible();
  });
});
```

### Best Practices
1. ✅ Use descriptive test names
2. ✅ Add console.log for debugging
3. ✅ Use explicit waits over timeouts
4. ✅ Test both EN and ID languages
5. ✅ Verify Supabase data persistence
6. ✅ Test edge cases and errors
7. ✅ Keep tests independent
8. ✅ Clean up after tests if needed

## 🎓 Learning Resources

- [Playwright Docs](https://playwright.dev/)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

---

**Last Updated:** April 9, 2026
**Test Count:** 12 tests across 2 files
**Coverage:** Full application flow
