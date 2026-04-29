# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: complete-user-journey.spec.ts >> Complete User Journey - Student Assessment Flow >> should navigate through Unit 10 PISA simulation
- Location: tests\complete-user-journey.spec.ts:113:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByLabel(/name|nama/i)

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T"
  - banner [ref=e3]:
    - navigation [ref=e4]:
      - link "Literasi" [ref=e5] [cursor=pointer]:
        - /url: /
      - generic [ref=e6]:
        - generic [ref=e7]:
          - link "Learn" [ref=e8] [cursor=pointer]:
            - /url: /learn
          - link "Quiz" [ref=e9] [cursor=pointer]:
            - /url: /quiz
          - link "Dashboard" [ref=e10] [cursor=pointer]:
            - /url: /dashboard
        - button "ID" [ref=e11] [cursor=pointer]
  - generic [ref=e12]:
    - generic [ref=e13]: Reading Material
    - generic [ref=e15]:
      - 'button "Unit 1: Nasi Jamblang" [ref=e16] [cursor=pointer]'
      - 'button "Unit 2: Terasi Cirebon" [ref=e17] [cursor=pointer]'
      - 'button "Unit 3: Empal Gentong" [ref=e18] [cursor=pointer]'
      - 'button "Unit 4: Kerupuk Melarat" [ref=e19] [cursor=pointer]'
      - 'button "Unit 5: Tape Ketan Bakung" [ref=e20] [cursor=pointer]'
      - 'button "Unit 6: Mangrove Ecosystem" [ref=e21] [cursor=pointer]'
      - 'button "Unit 7: Nadran (Sea Ritual)" [ref=e22] [cursor=pointer]'
      - 'button "Unit 8: Rattan Craft" [ref=e23] [cursor=pointer]'
      - 'button "Unit 9: Batik Trusmi" [ref=e24] [cursor=pointer]'
      - 'button "Unit 10: Tahu Gejrot" [ref=e25] [cursor=pointer]'
    - generic [ref=e26]:
      - generic [ref=e28]:
        - generic [ref=e29]:
          - 'heading "Nasi Jamblang: Culinary Tradition and Sustainable Packaging" [level=1] [ref=e30]'
          - text: "Theme: Environment"
        - generic [ref=e31]:
          - paragraph [ref=e32]: Context
          - paragraph [ref=e33]: Nasi Jamblang traditionally uses teak leaves as natural food packaging. Teak leaves are biodegradable and decompose naturally in the environment, reducing plastic waste.
        - paragraph [ref=e34]:
          - text: Nasi Jamblang is a traditional rice dish from Cirebon, West Java. What makes it unique is serving rice wrapped in teak leaves (
          - emphasis [ref=e35]: Tectona grandis
          - text: ).
        - paragraph [ref=e36]: Nasi Jamblang originated during the colonial period when workers needed practical, durable food. Teak leaves were chosen for their strength, tear-resistance, and porosity that allows air circulation.
        - paragraph [ref=e37]: Today, some vendors use plastic packaging because it's more practical and cheaper. However, plastic has significant environmental impacts because it is difficult to decompose. In contrast, teak leaves are natural and biodegradable.
        - paragraph [ref=e38]: Studies show that price significantly influences customer satisfaction in Nasi Jamblang businesses, with a coefficient value of 0.77.
      - generic [ref=e40]:
        - heading "Packaging Comparison" [level=2] [ref=e41]
        - table [ref=e43]:
          - rowgroup [ref=e44]:
            - row "Type Decomposition Env. Impact" [ref=e45]:
              - columnheader "Type" [ref=e46]
              - columnheader "Decomposition" [ref=e47]
              - columnheader "Env. Impact" [ref=e48]
          - rowgroup [ref=e49]:
            - row "Teak leaf 14–28 days Low" [ref=e50]:
              - cell "Teak leaf" [ref=e51]
              - cell "14–28 days" [ref=e52]
              - cell "Low" [ref=e53]
            - row "Paper 60–150 days Medium" [ref=e54]:
              - cell "Paper" [ref=e55]
              - cell "60–150 days" [ref=e56]
              - cell "Medium" [ref=e57]
            - row "Plastic 100–500 years High" [ref=e58]:
              - cell "Plastic" [ref=e59]
              - cell "100–500 years" [ref=e60]
              - cell "High" [ref=e61]
        - generic [ref=e62]:
          - paragraph [ref=e63]: Key Takeaways
          - list [ref=e64]:
            - listitem [ref=e65]: • Teak leaves decompose in 14–28 days
            - listitem [ref=e66]: • Plastic takes 100–500 years to decompose
            - listitem [ref=e67]: • Tradition can be a sustainability model
    - generic [ref=e69]:
      - generic [ref=e70]: Finished reading? Start the quiz now.
      - button "Start Quiz" [ref=e71] [cursor=pointer]:
        - text: Start Quiz
        - img [ref=e72]
```

# Test source

```ts
  15  |     
  16  |     await expect(page.getByRole("heading", { name: /student identity|identitas siswa/i })).toBeVisible({ timeout: 10000 });
  17  |     
  18  |     // Fill form fields
  19  |     await page.getByLabel(/name|nama/i).fill("Test Student");
  20  |     await page.getByLabel(/class|kelas/i).fill("12A");
  21  |     await page.getByLabel(/school|sekolah/i).fill("Test High School");
  22  |     await page.getByLabel(/email/i).fill("test@student.com");
  23  |     await page.getByLabel(/contact|kontak/i).fill("08123456789");
  24  |     
  25  |     // Submit form
  26  |     await page.getByRole("button", { name: /start|mulai/i }).click();
  27  |     
  28  |     // Step 2: Wait for loading screen (30 seconds)
  29  |     console.log("⏳ Step 2: Waiting for loading screen...");
  30  |     await expect(page.getByText(/loading|memuat/i)).toBeVisible({ timeout: 5000 });
  31  |     
  32  |     // Skip waiting by fast-forwarding (we'll wait minimum time)
  33  |     await page.waitForTimeout(2000);
  34  |     
  35  |     // Step 3: Unit selection screen
  36  |     console.log("📚 Step 3: Selecting unit...");
  37  |     await expect(page.getByRole("heading", { name: /select unit|pilih unit/i })).toBeVisible({ timeout: 35000 });
  38  |     
  39  |     // Select Unit 1
  40  |     await page.getByRole("button", { name: /unit 1/i }).first().click();
  41  |     
  42  |     // Step 4: Unit intro screen
  43  |     console.log("📖 Step 4: Reviewing unit intro...");
  44  |     await expect(page.getByText(/nasi jamblang|teak leaf/i)).toBeVisible({ timeout: 5000 });
  45  |     
  46  |     // Start questions
  47  |     await page.getByRole("button", { name: /start questions|mulai soal/i }).click();
  48  |     
  49  |     // Step 5: Answer questions
  50  |     console.log("✍️ Step 5: Answering questions...");
  51  |     
  52  |     // Wait for exam to load
  53  |     await page.waitForTimeout(1000);
  54  |     
  55  |     // Answer Question 1 (MCQ)
  56  |     const firstOption = page.locator("button").filter({ hasText: /cheapest|strong tear/i }).first();
  57  |     await expect(firstOption).toBeVisible({ timeout: 5000 });
  58  |     await firstOption.click();
  59  |     await page.waitForTimeout(500);
  60  |     
  61  |     // Navigate to next question
  62  |     await page.locator("button[aria-label='Next'], button svg[path*='M9 5l7 7-7 7']").click();
  63  |     await page.waitForTimeout(500);
  64  |     
  65  |     // Answer Question 2 (Checkbox)
  66  |     const checkboxOption = page.locator("button").filter({ hasText: /temperature|time taken/i }).first();
  67  |     await expect(checkboxOption).toBeVisible({ timeout: 5000 });
  68  |     await checkboxOption.click();
  69  |     await page.waitForTimeout(500);
  70  |     
  71  |     // Navigate to next
  72  |     await page.locator("button[aria-label='Next'], button svg[path*='M9 5l7 7-7 7']").click();
  73  |     await page.waitForTimeout(500);
  74  |     
  75  |     // Answer Question 3 (Open-ended)
  76  |     const textarea = page.locator("textarea").first();
  77  |     await expect(textarea).toBeVisible({ timeout: 5000 });
  78  |     await textarea.fill("Teak leaves are biodegradable and reduce plastic waste, making them more environmentally sustainable.");
  79  |     await page.waitForTimeout(500);
  80  |     
  81  |     // Navigate to next
  82  |     await page.locator("button[aria-label='Next'], button svg[path*='M9 5l7 7-7 7']").click();
  83  |     await page.waitForTimeout(500);
  84  |     
  85  |     // Answer Question 4
  86  |     const q4Option = page.locator("button").filter({ hasText: /durability|daya tahan/i }).first();
  87  |     await expect(q4Option).toBeVisible({ timeout: 5000 });
  88  |     await q4Option.click();
  89  |     await page.waitForTimeout(500);
  90  |     
  91  |     // Navigate to next
  92  |     await page.locator("button[aria-label='Next'], button svg[path*='M9 5l7 7-7 7']").click();
  93  |     await page.waitForTimeout(500);
  94  |     
  95  |     // Answer Question 5 (Open-ended)
  96  |     const textarea2 = page.locator("textarea").first();
  97  |     await expect(textarea2).toBeVisible({ timeout: 5000 });
  98  |     await textarea2.fill("I would recommend teak leaf packaging because it supports sustainability and reduces environmental impact.");
  99  |     await page.waitForTimeout(500);
  100 |     
  101 |     // Step 6: Submit assessment
  102 |     console.log("✅ Step 6: Submitting assessment...");
  103 |     await page.getByRole("button", { name: /submit|kirim/i }).click();
  104 |     await page.waitForTimeout(1000);
  105 |     
  106 |     // Step 7: Verify results page
  107 |     console.log("📊 Step 7: Checking results...");
  108 |     await expect(page.getByText(/results|hasil|score|skor/i)).toBeVisible({ timeout: 10000 });
  109 |     
  110 |     console.log("✅ Test completed successfully!");
  111 |   });
  112 | 
  113 |   test("should navigate through Unit 10 PISA simulation", async ({ page }: { page: Page }) => {
  114 |     // Quick setup - fill identity
> 115 |     await page.getByLabel(/name|nama/i).fill("Test User");
      |                                         ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  116 |     await page.getByLabel(/class|kelas/i).fill("12B");
  117 |     await page.getByLabel(/school|sekolah/i).fill("Test School");
  118 |     await page.getByLabel(/email/i).fill("test2@student.com");
  119 |     await page.getByLabel(/contact|kontak/i).fill("08123456789");
  120 |     await page.getByRole("button", { name: /start|mulai/i }).click();
  121 |     
  122 |     // Wait for loading
  123 |     await page.waitForTimeout(2000);
  124 |     
  125 |     // Select Unit 10
  126 |     await expect(page.getByRole("heading", { name: /select unit|pilih unit/i })).toBeVisible({ timeout: 35000 });
  127 |     await page.getByRole("button", { name: /unit 10/i }).first().click();
  128 |     
  129 |     // Wait for intro
  130 |     await expect(page.getByText(/tahu gejrot/i)).toBeVisible({ timeout: 5000 });
  131 |     await page.getByRole("button", { name: /start questions|mulai soal/i }).click();
  132 |     
  133 |     // Test simulation interactions
  134 |     console.log("🔬 Testing Unit 10 simulation...");
  135 |     
  136 |     // Wait for simulation to load
  137 |     await page.waitForTimeout(1000);
  138 |     
  139 |     // Check if simulation controls are visible
  140 |     await expect(page.getByText(/sustainability simulation|simulasi keberlanjutan/i)).toBeVisible({ timeout: 5000 });
  141 |     
  142 |     // Change protein source
  143 |     await page.getByRole("button", { name: /plant-based|nabati/i }).first().click();
  144 |     await page.waitForTimeout(300);
  145 |     
  146 |     // Change distance
  147 |     await page.getByRole("button", { name: /local|lokal/i }).first().click();
  148 |     await page.waitForTimeout(300);
  149 |     
  150 |     // Run simulation
  151 |     await page.getByRole("button", { name: /run simulation|jalankan simulasi/i }).click();
  152 |     await page.waitForTimeout(500);
  153 |     
  154 |     // Verify results appear
  155 |     await expect(page.getByText(/resource use|penggunaan sumber daya/i)).toBeVisible({ timeout: 5000 });
  156 |     
  157 |     // Record data
  158 |     await page.getByRole("button", { name: /record|catat/i }).click();
  159 |     await page.waitForTimeout(500);
  160 |     
  161 |     // Verify history table
  162 |     await expect(page.getByText(/simulation history|riwayat simulasi/i)).toBeVisible({ timeout: 5000 });
  163 |     
  164 |     console.log("✅ Unit 10 simulation test completed!");
  165 |   });
  166 | 
  167 |   test("should test language switching (EN/ID)", async ({ page }: { page: Page }) => {
  168 |     // Fill identity
  169 |     await page.getByLabel(/name|nama/i).fill("Language Test");
  170 |     await page.getByLabel(/class|kelas/i).fill("12C");
  171 |     await page.getByLabel(/school|sekolah/i).fill("Test School");
  172 |     await page.getByLabel(/email/i).fill("lang@test.com");
  173 |     await page.getByLabel(/contact|kontak/i).fill("08123456789");
  174 |     await page.getByRole("button", { name: /start|mulai/i }).click();
  175 |     
  176 |     await page.waitForTimeout(2000);
  177 |     
  178 |     // Check language toggle exists
  179 |     const langToggle = page.getByRole("button", { name: /EN|ID/i }).first();
  180 |     await expect(langToggle).toBeVisible({ timeout: 10000 });
  181 |     
  182 |     // Switch to Indonesian
  183 |     await langToggle.click();
  184 |     await page.waitForTimeout(500);
  185 |     
  186 |     // Verify Indonesian text
  187 |     await expect(page.getByText(/pilih unit/i)).toBeVisible({ timeout: 5000 });
  188 |     
  189 |     // Switch back to English
  190 |     await langToggle.click();
  191 |     await page.waitForTimeout(500);
  192 |     
  193 |     // Verify English text
  194 |     await expect(page.getByText(/select unit/i)).toBeVisible({ timeout: 5000 });
  195 |     
  196 |     console.log("✅ Language switching test completed!");
  197 |   });
  198 | 
  199 |   test("should verify Supabase session creation", async ({ page }: { page: Page }) => {
  200 |     // Fill identity
  201 |     await page.getByLabel(/name|nama/i).fill("Session Test");
  202 |     await page.getByLabel(/class|kelas/i).fill("12D");
  203 |     await page.getByLabel(/school|sekolah/i).fill("Test School");
  204 |     await page.getByLabel(/email/i).fill("session@test.com");
  205 |     await page.getByLabel(/contact|kontak/i).fill("08123456789");
  206 |     await page.getByRole("button", { name: /start|mulai/i }).click();
  207 |     
  208 |     await page.waitForTimeout(2000);
  209 |     
  210 |     // Select a unit
  211 |     await expect(page.getByRole("heading", { name: /select unit|pilih unit/i })).toBeVisible({ timeout: 35000 });
  212 |     await page.getByRole("button", { name: /unit 1/i }).first().click();
  213 |     await page.waitForTimeout(1000);
  214 |     
  215 |     // Start exam
```