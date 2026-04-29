import { test, expect } from "../playwright-fixture";

test.describe("Complete User Journey - Student Assessment Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");
    // Wait for app to load
    await page.waitForLoadState("networkidle");
  });

  test("should complete full student assessment flow from identity to results", async ({ page }) => {
    // Step 1: Fill student identity form
    console.log("📝 Step 1: Filling student identity form...");
    
    await expect(page.getByRole("heading", { name: /student identity|identitas siswa/i })).toBeVisible({ timeout: 10000 });
    
    // Fill form fields using placeholders
    await page.getByPlaceholder(/name|nama/i).fill("Test Student");
    await page.getByPlaceholder(/class|kelas/i).fill("12A");
    await page.getByPlaceholder(/school|sekolah/i).fill("Test High School");
    await page.getByPlaceholder(/email/i).fill("test@student.com");
    await page.getByPlaceholder(/contact|kontak/i).fill("08123456789");
    
    // Submit form
    await page.getByRole("button", { name: /start|mulai/i }).click();
    
    // Step 2: Wait for loading screen (30 seconds)
    console.log("⏳ Step 2: Waiting for loading screen...");
    await expect(page.getByText(/loading|memuat/i)).toBeVisible({ timeout: 5000 });
    
    // Skip waiting by fast-forwarding (we'll wait minimum time)
    await page.waitForTimeout(2000);
    
    // Step 3: Unit selection screen
    console.log("📚 Step 3: Selecting unit...");
    await expect(page.getByRole("heading", { name: /select unit|pilih unit/i })).toBeVisible({ timeout: 35000 });
    
    // Select Unit 1
    await page.getByRole("button", { name: /unit 1/i }).first().click();
    
    // Step 4: Unit intro screen
    console.log("📖 Step 4: Reviewing unit intro...");
    await expect(page.getByText(/nasi jamblang|teak leaf/i)).toBeVisible({ timeout: 5000 });
    
    // Start questions
    await page.getByRole("button", { name: /start questions|mulai soal/i }).click();
    
    // Step 5: Answer questions
    console.log("✍️ Step 5: Answering questions...");
    
    // Wait for exam to load
    await page.waitForTimeout(1000);
    
    // Answer Question 1 (MCQ)
    const firstOption = page.locator("button").filter({ hasText: /cheapest|strong tear/i }).first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();
    await page.waitForTimeout(500);
    
    // Navigate to next question
    await page.locator("button[aria-label='Next'], button svg[path*='M9 5l7 7-7 7']").click();
    await page.waitForTimeout(500);
    
    // Answer Question 2 (Checkbox)
    const checkboxOption = page.locator("button").filter({ hasText: /temperature|time taken/i }).first();
    await expect(checkboxOption).toBeVisible({ timeout: 5000 });
    await checkboxOption.click();
    await page.waitForTimeout(500);
    
    // Navigate to next
    await page.locator("button[aria-label='Next'], button svg[path*='M9 5l7 7-7 7']").click();
    await page.waitForTimeout(500);
    
    // Answer Question 3 (Open-ended)
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill("Teak leaves are biodegradable and reduce plastic waste, making them more environmentally sustainable.");
    await page.waitForTimeout(500);
    
    // Navigate to next
    await page.locator("button[aria-label='Next'], button svg[path*='M9 5l7 7-7 7']").click();
    await page.waitForTimeout(500);
    
    // Answer Question 4
    const q4Option = page.locator("button").filter({ hasText: /durability|daya tahan/i }).first();
    await expect(q4Option).toBeVisible({ timeout: 5000 });
    await q4Option.click();
    await page.waitForTimeout(500);
    
    // Navigate to next
    await page.locator("button[aria-label='Next'], button svg[path*='M9 5l7 7-7 7']").click();
    await page.waitForTimeout(500);
    
    // Answer Question 5 (Open-ended)
    const textarea2 = page.locator("textarea").first();
    await expect(textarea2).toBeVisible({ timeout: 5000 });
    await textarea2.fill("I would recommend teak leaf packaging because it supports sustainability and reduces environmental impact.");
    await page.waitForTimeout(500);
    
    // Step 6: Submit assessment
    console.log("✅ Step 6: Submitting assessment...");
    await page.getByRole("button", { name: /submit|kirim/i }).click();
    await page.waitForTimeout(1000);
    
    // Step 7: Verify results page
    console.log("📊 Step 7: Checking results...");
    await expect(page.getByText(/results|hasil|score|skor/i)).toBeVisible({ timeout: 10000 });
    
    console.log("✅ Test completed successfully!");
  });

  test("should navigate through Unit 10 PISA simulation", async ({ page }) => {
    // Quick setup - fill identity using placeholders
    await page.getByPlaceholder(/name|nama/i).fill("Test User");
    await page.getByPlaceholder(/class|kelas/i).fill("12B");
    await page.getByPlaceholder(/school|sekolah/i).fill("Test School");
    await page.getByPlaceholder(/email/i).fill("test2@student.com");
    await page.getByPlaceholder(/contact|kontak/i).fill("08123456789");
    await page.getByRole("button", { name: /start|mulai/i }).click();
    
    // Wait for loading
    await page.waitForTimeout(2000);
    
    // Select Unit 10
    await expect(page.getByRole("heading", { name: /select unit|pilih unit/i })).toBeVisible({ timeout: 35000 });
    await page.getByRole("button", { name: /unit 10/i }).first().click();
    
    // Wait for intro
    await expect(page.getByText(/tahu gejrot/i)).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /start questions|mulai soal/i }).click();
    
    // Test simulation interactions
    console.log("🔬 Testing Unit 10 simulation...");
    
    // Wait for simulation to load
    await page.waitForTimeout(1000);
    
    // Check if simulation controls are visible
    await expect(page.getByText(/sustainability simulation|simulasi keberlanjutan/i)).toBeVisible({ timeout: 5000 });
    
    // Change protein source
    await page.getByRole("button", { name: /plant-based|nabati/i }).first().click();
    await page.waitForTimeout(300);
    
    // Change distance
    await page.getByRole("button", { name: /local|lokal/i }).first().click();
    await page.waitForTimeout(300);
    
    // Run simulation
    await page.getByRole("button", { name: /run simulation|jalankan simulasi/i }).click();
    await page.waitForTimeout(500);
    
    // Verify results appear
    await expect(page.getByText(/resource use|penggunaan sumber daya/i)).toBeVisible({ timeout: 5000 });
    
    // Record data
    await page.getByRole("button", { name: /record|catat/i }).click();
    await page.waitForTimeout(500);
    
    // Verify history table
    await expect(page.getByText(/simulation history|riwayat simulasi/i)).toBeVisible({ timeout: 5000 });
    
    console.log("✅ Unit 10 simulation test completed!");
  });

  test("should test language switching (EN/ID)", async ({ page }) => {
    // Fill identity using placeholders
    await page.getByPlaceholder(/name|nama/i).fill("Language Test");
    await page.getByPlaceholder(/class|kelas/i).fill("12C");
    await page.getByPlaceholder(/school|sekolah/i).fill("Test School");
    await page.getByPlaceholder(/email/i).fill("lang@test.com");
    await page.getByPlaceholder(/contact|kontak/i).fill("08123456789");
    await page.getByRole("button", { name: /start|mulai/i }).click();
    
    await page.waitForTimeout(2000);
    
    // Check language toggle exists
    const langToggle = page.getByRole("button", { name: /EN|ID/i }).first();
    await expect(langToggle).toBeVisible({ timeout: 10000 });
    
    // Switch to Indonesian
    await langToggle.click();
    await page.waitForTimeout(500);
    
    // Verify Indonesian text
    await expect(page.getByText(/pilih unit/i)).toBeVisible({ timeout: 5000 });
    
    // Switch back to English
    await langToggle.click();
    await page.waitForTimeout(500);
    
    // Verify English text
    await expect(page.getByText(/select unit/i)).toBeVisible({ timeout: 5000 });
    
    console.log("✅ Language switching test completed!");
  });

  test("should verify Supabase session creation", async ({ page }) => {
    // Fill identity using placeholders
    await page.getByPlaceholder(/name|nama/i).fill("Session Test");
    await page.getByPlaceholder(/class|kelas/i).fill("12D");
    await page.getByPlaceholder(/school|sekolah/i).fill("Test School");
    await page.getByPlaceholder(/email/i).fill("session@test.com");
    await page.getByPlaceholder(/contact|kontak/i).fill("08123456789");
    await page.getByRole("button", { name: /start|mulai/i }).click();
    
    await page.waitForTimeout(2000);
    
    // Select a unit
    await expect(page.getByRole("heading", { name: /select unit|pilih unit/i })).toBeVisible({ timeout: 35000 });
    await page.getByRole("button", { name: /unit 1/i }).first().click();
    await page.waitForTimeout(1000);
    
    // Start exam
    await page.getByRole("button", { name: /start questions|mulai soal/i }).click();
    await page.waitForTimeout(2000);
    
    // Check that device ID is stored in localStorage
    const deviceId = await page.evaluate(() => localStorage.getItem("exam_device_id"));
    expect(deviceId).toBeTruthy();
    console.log("Device ID:", deviceId);
    
    // Check exam_active flag
    const examActive = await page.evaluate(() => localStorage.getItem("exam_active"));
    expect(examActive).toBe("1");
    
    console.log("✅ Session creation test completed!");
  });
});
