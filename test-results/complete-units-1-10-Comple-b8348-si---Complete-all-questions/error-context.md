# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: complete-units-1-10.spec.ts >> Complete Unit 1-10 Auto-Test with Screenshots >> Unit 2: Terasi - Complete all questions
- Location: tests\complete-units-1-10.spec.ts:79:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /Unit 2/i }).first()

```

# Page snapshot

```yaml
- generic [active]:
  - generic:
    - region "Notifications alt+T"
    - banner [ref=e1]:
      - navigation [ref=e2]:
        - link "Assessing Science Literacy through Cirebon Culture" [ref=e3] [cursor=pointer]:
          - /url: /
        - generic [ref=e4]:
          - generic [ref=e5]:
            - link "Learn" [ref=e6] [cursor=pointer]:
              - /url: /learn
            - link "Quiz" [ref=e7] [cursor=pointer]:
              - /url: /quiz
            - link "Results" [ref=e8] [cursor=pointer]:
              - /url: /dashboard
            - link "Admin" [ref=e9] [cursor=pointer]:
              - /url: /admin
          - button "ID" [ref=e10] [cursor=pointer]
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "Student Identity (Identitas Siswa)" [level=2] [ref=e14]
        - paragraph [ref=e15]: Fill in your details before starting the quiz
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: Full Name *
          - textbox "e.g. Budi Santoso" [ref=e19]
        - generic [ref=e20]:
          - generic [ref=e21]: Class *
          - textbox "e.g. 10A" [ref=e22]
        - generic [ref=e23]:
          - generic [ref=e24]: School *
          - textbox "e.g. SMA Negeri 1 Cirebon" [ref=e25]
        - generic [ref=e26]:
          - generic [ref=e27]: Contact (Phone/WA) *
          - textbox "e.g. 08123456789" [ref=e28]
        - generic [ref=e29]:
          - generic [ref=e30]: Instagram (optional)
          - generic [ref=e31]:
            - generic [ref=e32]: "@"
            - textbox "e.g. budi_santoso" [ref=e33]
        - button "Register & Start" [ref=e34] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Complete Unit 1-10 Auto-Test with Screenshots', () => {
  4   |   // Helper function to take screenshot
  5   |   async function takeScreenshot(page: any, unitNum: number, questionNum: number, description: string) {
  6   |     const filename = `unit${unitNum}_q${questionNum}_${description.replace(/\s+/g, '_').toLowerCase()}`;
  7   |     await page.screenshot({ 
  8   |       path: `test-results/screenshots/${filename}.jpg`,
  9   |       type: 'jpeg',
  10  |       quality: 90
  11  |     });
  12  |     console.log(`✓ Screenshot saved: ${filename}.jpg`);
  13  |   }
  14  | 
  15  |   // Helper function to answer MCQ questions
  16  |   async function answerMCQ(page: any, optionIndex: number) {
  17  |     const options = await page.locator('button, label').filter({ hasText: /.*/ }).all();
  18  |     if (options[optionIndex]) {
  19  |       await options[optionIndex].click();
  20  |     }
  21  |   }
  22  | 
  23  |   // Helper function to fill essay with minimum 15 words
  24  |   async function fillEssay(page: any, answer: string) {
  25  |     const textarea = page.locator('textarea').first();
  26  |     await textarea.fill(answer);
  27  |     await page.waitForTimeout(500);
  28  |   }
  29  | 
  30  |   test('Unit 1: Nasi Jamblang - Complete all questions', async ({ page }) => {
  31  |     console.log('\n=== Testing Unit 1: Nasi Jamblang ===');
  32  |     
  33  |     // Navigate to quiz
  34  |     await page.goto('http://localhost:8080/quiz');
  35  |     await page.waitForTimeout(1000);
  36  |     
  37  |     // Select Unit 1
  38  |     await page.locator('button').filter({ hasText: /Unit 1/i }).first().click();
  39  |     await page.waitForTimeout(1000);
  40  |     
  41  |     // Start questions
  42  |     await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
  43  |     await page.waitForTimeout(1000);
  44  | 
  45  |     // Question 1 - MCQ
  46  |     await page.locator('button').filter({ hasText: /natural compounds|senyawa alami/i }).click();
  47  |     await takeScreenshot(page, 1, 1, 'mcq_answered');
  48  |     await page.locator('button[aria-label="Next"]').click();
  49  |     await page.waitForTimeout(500);
  50  | 
  51  |     // Question 2 - MCQ
  52  |     await page.locator('button').filter({ hasText: /Time taken|Waktu yang dibutuhkan/i }).click();
  53  |     await takeScreenshot(page, 1, 2, 'mcq_answered');
  54  |     await page.locator('button[aria-label="Next"]').click();
  55  |     await page.waitForTimeout(500);
  56  | 
  57  |     // Question 3 - Essay
  58  |     await fillEssay(page, 'Teak leaves are considered more environmentally sustainable than plastic because they are biodegradable and decompose naturally within fourteen to twenty-eight days. Plastic takes hundreds of years to decompose and creates significant environmental pollution. Teak leaves also come from renewable natural resources and do not produce harmful waste when they break down in the environment.');
  59  |     await takeScreenshot(page, 1, 3, 'essay_answered');
  60  |     await page.locator('button[aria-label="Next"]').click();
  61  |     await page.waitForTimeout(500);
  62  | 
  63  |     // Question 4 - MCQ
  64  |     await page.locator('button').filter({ hasText: /Durability is beneficial|Daya tahan memang menguntungkan/i }).click();
  65  |     await takeScreenshot(page, 1, 4, 'mcq_answered');
  66  |     await page.locator('button[aria-label="Next"]').click();
  67  |     await page.waitForTimeout(500);
  68  | 
  69  |     // Question 5 - Essay
  70  |     await fillEssay(page, 'As a policymaker, I would recommend using teak leaves for sustainable food practices because they offer multiple environmental benefits. Teak leaves are naturally biodegradable, which means they decompose quickly without leaving harmful residues. This significantly reduces plastic waste accumulation in landfills and oceans. Additionally, teak leaves are renewable resources that can be harvested sustainably. While plastic may be more durable, its long-term environmental costs far outweigh the short-term convenience benefits for both ecosystems and human health.');
  71  |     await takeScreenshot(page, 1, 5, 'essay_answered');
  72  |     
  73  |     // Submit
  74  |     await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
  75  |     await page.waitForTimeout(1000);
  76  |     await takeScreenshot(page, 1, 0, 'completed');
  77  |   });
  78  | 
  79  |   test('Unit 2: Terasi - Complete all questions', async ({ page }) => {
  80  |     console.log('\n=== Testing Unit 2: Terasi ===');
  81  |     
  82  |     await page.goto('http://localhost:8080/quiz');
  83  |     await page.waitForTimeout(1000);
  84  |     
> 85  |     await page.locator('button').filter({ hasText: /Unit 2/i }).first().click();
      |                                                                         ^ Error: locator.click: Test timeout of 60000ms exceeded.
  86  |     await page.waitForTimeout(1000);
  87  |     await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
  88  |     await page.waitForTimeout(1000);
  89  | 
  90  |     // Question 1 - MCQ
  91  |     await page.locator('button').filter({ hasText: /Higher microbial risk|Risiko mikroba lebih tinggi/i }).click();
  92  |     await takeScreenshot(page, 2, 1, 'mcq_answered');
  93  |     await page.locator('button[aria-label="Next"]').click();
  94  |     await page.waitForTimeout(500);
  95  | 
  96  |     // Question 2 - Simulation (run it)
  97  |     await page.locator('button').filter({ hasText: /Run Simulation/i }).click();
  98  |     await page.waitForTimeout(1000);
  99  |     await takeScreenshot(page, 2, 2, 'simulation_run');
  100 |     await page.locator('button').filter({ hasText: /Record Data/i }).click();
  101 |     await page.waitForTimeout(500);
  102 |     await page.locator('button[aria-label="Next"]').click();
  103 |     await page.waitForTimeout(500);
  104 | 
  105 |     // Question 3 - Essay
  106 |     await fillEssay(page, 'Fermentation improves terasi quality through several biological processes. During fermentation, beneficial microorganisms break down complex proteins into simpler amino acids, particularly glutamic acid which creates the characteristic umami taste. The fermentation process also reduces harmful bacteria while increasing beneficial bacteria populations. Additionally, proper salt concentration and drying time during fermentation create optimal conditions for flavor development and product safety, resulting in higher quality terasi with better taste, texture, and shelf life.');
  107 |     await takeScreenshot(page, 2, 3, 'essay_answered');
  108 |     await page.locator('button[aria-label="Next"]').click();
  109 |     await page.waitForTimeout(500);
  110 | 
  111 |     // Question 4 - MCQ
  112 |     await page.locator('button').filter({ hasText: /Fermentation conditions|Kondisi fermentasi/i }).click();
  113 |     await takeScreenshot(page, 2, 4, 'mcq_answered');
  114 |     await page.locator('button[aria-label="Next"]').click();
  115 |     await page.waitForTimeout(500);
  116 | 
  117 |     // Question 5 - Essay
  118 |     await fillEssay(page, 'Sustainable shrimp paste production requires balancing traditional methods with modern environmental practices. Producers should maintain proper fermentation conditions including adequate salt levels, hygienic processing facilities, and appropriate drying times to ensure product safety. Additionally, sustainable fishing practices for rebon shrimp are essential to maintain marine ecosystem health. Producers should implement waste management systems to prevent contamination of coastal waters. By combining traditional knowledge with scientific understanding of fermentation microbiology, producers can create high-quality terasi while protecting the marine ecosystems that provide the raw materials.');
  119 |     await takeScreenshot(page, 2, 5, 'essay_answered');
  120 |     
  121 |     await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
  122 |     await page.waitForTimeout(1000);
  123 |     await takeScreenshot(page, 2, 0, 'completed');
  124 |   });
  125 | 
  126 |   test('Unit 3: Empal Gentong - Complete all questions', async ({ page }) => {
  127 |     console.log('\n=== Testing Unit 3: Empal Gentong ===');
  128 |     
  129 |     await page.goto('http://localhost:8080/quiz');
  130 |     await page.waitForTimeout(1000);
  131 |     
  132 |     await page.locator('button').filter({ hasText: /Unit 3/i }).first().click();
  133 |     await page.waitForTimeout(1000);
  134 |     await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
  135 |     await page.waitForTimeout(1000);
  136 | 
  137 |     // Question 1 - MCQ
  138 |     await page.locator('button').filter({ hasText: /Clay pots retain|Wadah tanah liat mampu/i }).click();
  139 |     await takeScreenshot(page, 3, 1, 'mcq_answered');
  140 |     await page.locator('button[aria-label="Next"]').click();
  141 |     await page.waitForTimeout(500);
  142 | 
  143 |     // Question 2 - Simulation
  144 |     await page.locator('button').filter({ hasText: /Run|Jalankan/i }).click();
  145 |     await page.waitForTimeout(1000);
  146 |     await takeScreenshot(page, 3, 2, 'simulation_run');
  147 |     await page.locator('button').filter({ hasText: /Record Data|Catat/i }).click();
  148 |     await page.waitForTimeout(500);
  149 |     await page.locator('button[aria-label="Next"]').click();
  150 |     await page.waitForTimeout(500);
  151 | 
  152 |     // Question 3 - Essay
  153 |     await fillEssay(page, 'Clay pots demonstrate superior heat retention compared to metal pots due to their material properties and physical structure. Clay is a natural insulator with low thermal conductivity, which means it absorbs heat slowly and releases it gradually. This property allows clay pots to maintain consistent cooking temperatures even when heat input fluctuates. The porous structure of clay also contributes to heat retention by trapping warm air within its microscopic pores. In contrast, metal pots have high thermal conductivity and lose heat rapidly to the surrounding environment. This makes clay pots more energy-efficient for slow-cooking dishes like Empal Gentong, as they require less fuel to maintain optimal cooking temperatures over extended periods.');
  154 |     await takeScreenshot(page, 3, 3, 'essay_answered');
  155 |     await page.locator('button[aria-label="Next"]').click();
  156 |     await page.waitForTimeout(500);
  157 | 
  158 |     // Question 4 - MCQ
  159 |     await page.locator('button').filter({ hasText: /Thicker walls|Dinding lebih tebal/i }).click();
  160 |     await takeScreenshot(page, 3, 4, 'mcq_answered');
  161 |     await page.locator('button[aria-label="Next"]').click();
  162 |     await page.waitForTimeout(500);
  163 | 
  164 |     // Question 5 - Essay
  165 |     await fillEssay(page, 'Traditional clay pot cooking methods offer significant sustainability advantages over modern metal cookware. Clay pots are made from natural earth materials that can return to the environment without causing pollution when they eventually break down. The manufacturing process for clay pots requires less energy-intensive processing compared to metal production, which involves mining, smelting, and industrial manufacturing. Additionally, clay pots superior heat retention means they consume less fuel during cooking, reducing overall energy consumption and carbon emissions. By supporting traditional clay pot usage, communities can preserve cultural heritage while maintaining environmentally sustainable cooking practices that minimize resource extraction and energy consumption.');
  166 |     await takeScreenshot(page, 3, 5, 'essay_answered');
  167 |     
  168 |     await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
  169 |     await page.waitForTimeout(1000);
  170 |     await takeScreenshot(page, 3, 0, 'completed');
  171 |   });
  172 | 
  173 |   test('Unit 4: Kerupuk Melarat - Complete all questions', async ({ page }) => {
  174 |     console.log('\n=== Testing Unit 4: Kerupuk Melarat ===');
  175 |     
  176 |     await page.goto('http://localhost:8080/quiz');
  177 |     await page.waitForTimeout(1000);
  178 |     
  179 |     await page.locator('button').filter({ hasText: /Unit 4/i }).first().click();
  180 |     await page.waitForTimeout(1000);
  181 |     await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
  182 |     await page.waitForTimeout(1000);
  183 | 
  184 |     // Question 1 - MCQ
  185 |     await page.locator('button').filter({ hasText: /Sand reduces|Pasir mengurangi/i }).click();
```