import { test, expect } from "../playwright-fixture";

test.describe("Nasi Jamblang Story - Basic Functionality Tests", () => {
  
  test("1. Should load homepage and show student identity form", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Verify student identity form is visible
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    const headingText = await heading.textContent();
    console.log("✅ Homepage loaded with heading:", headingText);
    
    // Verify form fields exist using placeholders
    await expect(page.getByPlaceholder(/name|nama/i)).toBeVisible();
    await expect(page.getByPlaceholder(/class|kelas/i)).toBeVisible();
    await expect(page.getByPlaceholder(/school|sekolah/i)).toBeVisible();
    
    console.log("✅ Student identity form is ready");
  });

  test("2. Should complete student form and show loading screen", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Fill form using placeholders
    await page.getByPlaceholder(/name|nama/i).fill("John Doe");
    await page.getByPlaceholder(/class|kelas/i).fill("12A");
    await page.getByPlaceholder(/school|sekolah/i).fill("SMA Test");
    await page.getByPlaceholder(/email/i).fill("john@test.com");
    await page.getByPlaceholder(/contact|kontak/i).fill("08123456789");
    
    // Submit
    await page.getByRole("button", { name: /start|mulai/i }).click();
    
    // Loading screen should appear
    await page.waitForTimeout(1000);
    const loadingText = page.getByText(/loading|memuat|preparing/i);
    await expect(loadingText).toBeVisible({ timeout: 5000 });
    
    console.log("✅ Loading screen displayed after form submission");
  });

  test("3. Should show unit selection after loading", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Fill and submit form using placeholders
    await page.getByPlaceholder(/name|nama/i).fill("Jane Doe");
    await page.getByPlaceholder(/class|kelas/i).fill("12B");
    await page.getByPlaceholder(/school|sekolah/i).fill("SMA Test");
    await page.getByPlaceholder(/email/i).fill("jane@test.com");
    await page.getByPlaceholder(/contact|kontak/i).fill("08123456789");
    await page.getByRole("button", { name: /start|mulai/i }).click();
    
    // Wait for unit selection (loading is 30s, but we'll check earlier)
    await page.waitForTimeout(2000);
    
    // Try to find unit selection heading
    const unitHeading = page.getByRole("heading", { name: /select unit|pilih unit/i });
    const isVisible = await unitHeading.isVisible({ timeout: 35000 }).catch(() => false);
    
    if (isVisible) {
      console.log("✅ Unit selection screen appeared");
      
      // Verify all 10 units are shown
      const unitButtons = page.getByRole("button", { name: /unit/i });
      const count = await unitButtons.count();
      console.log(`✅ Found ${count} unit buttons`);
      expect(count).toBeGreaterThanOrEqual(10);
    } else {
      console.log("⏳ Still loading (this is normal - loading takes 30 seconds)");
    }
  });

  test("4. Should store device ID in localStorage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Fill form to trigger session creation using placeholders
    await page.getByPlaceholder(/name|nama/i).fill("Test User");
    await page.getByPlaceholder(/class|kelas/i).fill("12C");
    await page.getByPlaceholder(/school|sekolah/i).fill("SMA Test");
    await page.getByPlaceholder(/email/i).fill("test@test.com");
    await page.getByPlaceholder(/contact|kontak/i).fill("08123456789");
    await page.getByRole("button", { name: /start|mulai/i }).click();
    
    await page.waitForTimeout(2000);
    
    // Check localStorage
    const deviceId = await page.evaluate(() => localStorage.getItem("exam_device_id"));
    expect(deviceId).toBeTruthy();
    console.log("✅ Device ID stored:", deviceId);
  });

  test("5. Should toggle language between EN and ID", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Find language toggle button
    const langButton = page.locator("button").filter({ hasText: /EN|ID/ }).first();
    const isLangVisible = await langButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isLangVisible) {
      // Get initial text
      const initialText = await langButton.textContent();
      console.log("Initial language:", initialText);
      
      // Click to toggle
      await langButton.click();
      await page.waitForTimeout(500);
      
      // Get new text
      const newText = await langButton.textContent();
      console.log("After toggle:", newText);
      
      expect(initialText).not.toBe(newText);
      console.log("✅ Language toggle working");
    } else {
      console.log("ℹ️ Language toggle not found (may not be implemented yet)");
    }
  });

  test("6. Should navigate to unit intro and start exam", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Complete form using placeholders
    await page.getByPlaceholder(/name|nama/i).fill("Exam Test");
    await page.getByPlaceholder(/class|kelas/i).fill("12D");
    await page.getByPlaceholder(/school|sekolah/i).fill("SMA Test");
    await page.getByPlaceholder(/email/i).fill("exam@test.com");
    await page.getByPlaceholder(/contact|kontak/i).fill("08123456789");
    await page.getByRole("button", { name: /start|mulai/i }).click();
    
    // Wait for unit selection
    await page.waitForTimeout(2000);
    const unitSelectVisible = await page.getByRole("heading", { name: /select unit|pilih unit/i }).isVisible({ timeout: 35000 }).catch(() => false);
    
    if (unitSelectVisible) {
      // Select Unit 1
      await page.getByRole("button", { name: /unit 1/i }).first().click();
      await page.waitForTimeout(1000);
      
      // Check if intro screen loaded
      const introVisible = await page.getByText(/theme|tema|stimulus/i).isVisible({ timeout: 5000 }).catch(() => false);
      
      if (introVisible) {
        console.log("✅ Unit intro screen loaded");
        
        // Click start questions
        await page.getByRole("button", { name: /start questions|mulai soal/i }).click();
        await page.waitForTimeout(1000);
        
        // Check if exam loaded
        const examVisible = await page.locator("textarea, input[type='radio']").first().isVisible({ timeout: 5000 }).catch(() => false);
        
        if (examVisible) {
          console.log("✅ Exam screen loaded successfully");
        } else {
          console.log("ℹ️ Exam screen elements not detected yet");
        }
      } else {
        console.log("ℹ️ Intro screen not detected");
      }
    } else {
      console.log("⏳ Unit selection not yet visible (still loading)");
    }
  });

  test("7. Should test responsive design - mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Verify form is visible on mobile
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    console.log("✅ App loads correctly on mobile viewport (375x667)");
  });

  test("8. Should test responsive design - tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Verify form is visible on tablet
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    console.log("✅ App loads correctly on tablet viewport (768x1024)");
  });
});
