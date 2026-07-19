import { test, expect } from '@playwright/test';

test.describe('Complete Unit 1-10 Auto-Test with Screenshots', () => {
  // Helper function to take screenshot
  async function takeScreenshot(page: any, unitNum: number, questionNum: number, description: string) {
    const filename = `unit${unitNum}_q${questionNum}_${description.replace(/\s+/g, '_').toLowerCase()}`;
    await page.screenshot({ 
      path: `test-results/screenshots/${filename}.jpg`,
      type: 'jpeg',
      quality: 90
    });
    console.log(`✓ Screenshot saved: ${filename}.jpg`);
  }

  // Helper function to answer MCQ questions
  async function answerMCQ(page: any, optionIndex: number) {
    const options = await page.locator('button, label').filter({ hasText: /.*/ }).all();
    if (options[optionIndex]) {
      await options[optionIndex].click();
    }
  }

  // Helper function to fill essay with minimum 15 words
  async function fillEssay(page: any, answer: string) {
    const textarea = page.locator('textarea').first();
    await textarea.fill(answer);
    await page.waitForTimeout(500);
  }

  test('Unit 1: Nasi Jamblang - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 1: Nasi Jamblang ===');
    
    // Navigate to quiz
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    // Select Unit 1
    await page.locator('button').filter({ hasText: /Unit 1/i }).first().click();
    await page.waitForTimeout(1000);
    
    // Start questions
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(1000);

    // Question 1 - MCQ
    await page.locator('button').filter({ hasText: /natural compounds|senyawa alami/i }).click();
    await takeScreenshot(page, 1, 1, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 2 - MCQ
    await page.locator('button').filter({ hasText: /Time taken|Waktu yang dibutuhkan/i }).click();
    await takeScreenshot(page, 1, 2, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 3 - Essay
    await fillEssay(page, 'Teak leaves are considered more environmentally sustainable than plastic because they are biodegradable and decompose naturally within fourteen to twenty-eight days. Plastic takes hundreds of years to decompose and creates significant environmental pollution. Teak leaves also come from renewable natural resources and do not produce harmful waste when they break down in the environment.');
    await takeScreenshot(page, 1, 3, 'essay_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 4 - MCQ
    await page.locator('button').filter({ hasText: /Durability is beneficial|Daya tahan memang menguntungkan/i }).click();
    await takeScreenshot(page, 1, 4, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    await fillEssay(page, 'As a policymaker, I would recommend using teak leaves for sustainable food practices because they offer multiple environmental benefits. Teak leaves are naturally biodegradable, which means they decompose quickly without leaving harmful residues. This significantly reduces plastic waste accumulation in landfills and oceans. Additionally, teak leaves are renewable resources that can be harvested sustainably. While plastic may be more durable, its long-term environmental costs far outweigh the short-term convenience benefits for both ecosystems and human health.');
    await takeScreenshot(page, 1, 5, 'essay_answered');
    
    // Submit
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 1, 0, 'completed');
  });

  test('Unit 2: Terasi - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 2: Terasi ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 2/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(1000);

    // Question 1 - MCQ
    await page.locator('button').filter({ hasText: /Higher microbial risk|Risiko mikroba lebih tinggi/i }).click();
    await takeScreenshot(page, 2, 1, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 2 - Simulation (run it)
    await page.locator('button').filter({ hasText: /Run Simulation/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 2, 2, 'simulation_run');
    await page.locator('button').filter({ hasText: /Record Data/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 3 - Essay
    await fillEssay(page, 'Fermentation improves terasi quality through several biological processes. During fermentation, beneficial microorganisms break down complex proteins into simpler amino acids, particularly glutamic acid which creates the characteristic umami taste. The fermentation process also reduces harmful bacteria while increasing beneficial bacteria populations. Additionally, proper salt concentration and drying time during fermentation create optimal conditions for flavor development and product safety, resulting in higher quality terasi with better taste, texture, and shelf life.');
    await takeScreenshot(page, 2, 3, 'essay_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 4 - MCQ
    await page.locator('button').filter({ hasText: /Fermentation conditions|Kondisi fermentasi/i }).click();
    await takeScreenshot(page, 2, 4, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    await fillEssay(page, 'Sustainable shrimp paste production requires balancing traditional methods with modern environmental practices. Producers should maintain proper fermentation conditions including adequate salt levels, hygienic processing facilities, and appropriate drying times to ensure product safety. Additionally, sustainable fishing practices for rebon shrimp are essential to maintain marine ecosystem health. Producers should implement waste management systems to prevent contamination of coastal waters. By combining traditional knowledge with scientific understanding of fermentation microbiology, producers can create high-quality terasi while protecting the marine ecosystems that provide the raw materials.');
    await takeScreenshot(page, 2, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 2, 0, 'completed');
  });

  test('Unit 3: Empal Gentong - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 3: Empal Gentong ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 3/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(1000);

    // Question 1 - MCQ
    await page.locator('button').filter({ hasText: /Clay pots retain|Wadah tanah liat mampu/i }).click();
    await takeScreenshot(page, 3, 1, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 2 - Simulation
    await page.locator('button').filter({ hasText: /Run|Jalankan/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 3, 2, 'simulation_run');
    await page.locator('button').filter({ hasText: /Record Data|Catat/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 3 - Essay
    await fillEssay(page, 'Clay pots demonstrate superior heat retention compared to metal pots due to their material properties and physical structure. Clay is a natural insulator with low thermal conductivity, which means it absorbs heat slowly and releases it gradually. This property allows clay pots to maintain consistent cooking temperatures even when heat input fluctuates. The porous structure of clay also contributes to heat retention by trapping warm air within its microscopic pores. In contrast, metal pots have high thermal conductivity and lose heat rapidly to the surrounding environment. This makes clay pots more energy-efficient for slow-cooking dishes like Empal Gentong, as they require less fuel to maintain optimal cooking temperatures over extended periods.');
    await takeScreenshot(page, 3, 3, 'essay_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 4 - MCQ
    await page.locator('button').filter({ hasText: /Thicker walls|Dinding lebih tebal/i }).click();
    await takeScreenshot(page, 3, 4, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    await fillEssay(page, 'Traditional clay pot cooking methods offer significant sustainability advantages over modern metal cookware. Clay pots are made from natural earth materials that can return to the environment without causing pollution when they eventually break down. The manufacturing process for clay pots requires less energy-intensive processing compared to metal production, which involves mining, smelting, and industrial manufacturing. Additionally, clay pots superior heat retention means they consume less fuel during cooking, reducing overall energy consumption and carbon emissions. By supporting traditional clay pot usage, communities can preserve cultural heritage while maintaining environmentally sustainable cooking practices that minimize resource extraction and energy consumption.');
    await takeScreenshot(page, 3, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 3, 0, 'completed');
  });

  test('Unit 4: Kerupuk Melarat - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 4: Kerupuk Melarat ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 4/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(1000);

    // Question 1 - MCQ
    await page.locator('button').filter({ hasText: /Sand reduces|Pasir mengurangi/i }).click();
    await takeScreenshot(page, 4, 1, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 2 - Simulation
    await page.locator('button').filter({ hasText: /Run|Jalankan/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 4, 2, 'simulation_run');
    await page.locator('button').filter({ hasText: /Record Data|Catat/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 3 - Essay
    await fillEssay(page, 'Sand-frying technique demonstrates significant sustainability advantages over traditional oil frying methods. The primary benefit is that sand can be reused multiple times without degradation, while frying oil must be replaced frequently after it breaks down from repeated heating. This reusability dramatically reduces waste generation and resource consumption. Additionally, sand-frying produces crackers with lower oil absorption, which is healthier for consumers and reduces the demand for cooking oil production. The sand-frying method also eliminates the environmental problems associated with disposing of used cooking oil, which can contaminate water systems if improperly discarded. This traditional technique showcases how indigenous knowledge can provide environmentally sustainable food processing solutions.');
    await takeScreenshot(page, 4, 3, 'essay_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 4 - MCQ
    await page.locator('button').filter({ hasText: /Temperature|Suhu/i }).click();
    await takeScreenshot(page, 4, 4, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    await fillEssay(page, 'The sand-frying technique used in Kerupuk Melarat production represents an excellent example of sustainable food processing that balances economic viability with environmental responsibility. By using heated sand instead of oil, producers significantly reduce their operational costs since sand does not need frequent replacement like cooking oil. The lower oil absorption in the final product also appeals to health-conscious consumers, potentially expanding market opportunities. From an environmental perspective, this method eliminates oil waste disposal problems and reduces the overall demand for cooking oil production, which has its own environmental footprint including agricultural land use and processing energy. Traditional food processing methods like sand-frying should be preserved and studied for their sustainable practices.');
    await takeScreenshot(page, 4, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 4, 0, 'completed');
  });

  test('Unit 5: Tape Ketan - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 5: Tape Ketan ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 5/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(1000);

    // Watch video first
    await page.waitForTimeout(2000);
    const video = page.locator('video');
    if (await video.isVisible()) {
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = video.duration - 1;
          video.dispatchEvent(new Event('ended'));
        }
      });
      await page.waitForTimeout(1000);
    }
    await takeScreenshot(page, 5, 0, 'video_watched');

    // Question 1 - MCQ
    await page.locator('button').filter({ hasText: /Yeast and bacteria|Ragi dan bakteri/i }).click();
    await takeScreenshot(page, 5, 1, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 2 - Simulation
    await page.locator('button').filter({ hasText: /Run|Jalankan/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 5, 2, 'simulation_run');
    await page.locator('button').filter({ hasText: /Record Data|Catat/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 3 - Essay
    await fillEssay(page, 'The fermentation process in tape ketan production involves complex microbial activity that transforms glutinous rice into a flavorful fermented product. Ragi, the traditional starter culture, contains various microorganisms including yeast and beneficial bacteria. These microorganisms secrete enzymes that break down complex starch molecules in the rice into simpler sugars through a process called saccharification. The yeast then converts these sugars into alcohol and carbon dioxide, while bacteria produce organic acids that contribute to the characteristic tangy flavor. Temperature control is crucial during fermentation, as optimal temperatures between twenty-five and thirty degrees Celsius promote balanced microbial activity. The natural leaf packaging provides a protective environment that maintains proper humidity and allows gas exchange during fermentation.');
    await takeScreenshot(page, 5, 3, 'essay_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 4 - MCQ
    await page.locator('button').filter({ hasText: /Natural leaves|Daun alami/i }).click();
    await takeScreenshot(page, 5, 4, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    await fillEssay(page, 'Traditional fermentation practices like tape ketan production offer valuable lessons in sustainable food processing and preservation. Fermentation naturally extends the shelf life of perishable foods without requiring artificial preservatives or energy-intensive refrigeration. This traditional biotechnology harnesses natural microbial processes that are energy-efficient and environmentally friendly. The use of natural leaf packaging instead of plastic demonstrates sustainable packaging practices that reduce environmental waste while maintaining product quality. These traditional methods also support local food systems by utilizing locally available ingredients and knowledge. By preserving and promoting traditional fermentation techniques, communities can maintain food security, reduce food waste, and practice environmentally sustainable food production that has been refined over generations of practical experience.');
    await takeScreenshot(page, 5, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 5, 0, 'completed');
  });

  test('Unit 6: Mangrove - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 6: Mangrove ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 6/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(1000);

    // Watch video
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = video.duration - 1;
        video.dispatchEvent(new Event('ended'));
      }
    });
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 6, 0, 'video_watched');

    // Question 1 - MCQ
    await page.locator('button').filter({ hasText: /Mangrove roots trap sediment|Akar mangrove menjebak/i }).click();
    await takeScreenshot(page, 6, 1, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 2 - Simulation
    await page.locator('button').filter({ hasText: /Run Simulation/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 6, 2, 'simulation_run');
    await page.locator('button').filter({ hasText: /Record Data/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 3 - Essay
    await fillEssay(page, 'Mangrove forests provide essential coastal protection through multiple ecological mechanisms that work together to reduce erosion and flooding. The complex root systems of mangrove trees create a physical barrier that dissipates wave energy before it reaches the shoreline. These roots also trap sediment carried by water currents, gradually building up the coastal land and stabilizing the shoreline. Additionally, mangrove forests act as natural carbon sinks, absorbing and storing significant amounts of carbon dioxide from the atmosphere, which helps mitigate climate change impacts. The dense canopy provides habitat and nursery areas for numerous marine species, supporting local fisheries and biodiversity. Protecting mangrove ecosystems is therefore crucial for both environmental conservation and the livelihoods of coastal communities who depend on these natural resources.');
    await takeScreenshot(page, 6, 3, 'essay_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 4 - MCQ
    await page.locator('button').filter({ hasText: /Reduced fish production|Produksi ikan menurun/i }).click();
    await takeScreenshot(page, 6, 4, 'mcq_answered');
    await page.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    await fillEssay(page, 'Mangrove conservation requires a comprehensive approach that balances environmental protection with the economic needs of coastal communities. Effective conservation strategies should include community-based mangrove management programs that involve local residents in planting, monitoring, and protecting mangrove forests. Education programs can help communities understand the long-term economic benefits of healthy mangrove ecosystems, including improved fish catches, reduced coastal damage from storms, and potential ecotourism opportunities. Alternative livelihood programs should be developed to reduce dependence on activities that damage mangroves, such as unsustainable aquaculture or timber harvesting. Government policies should enforce protection of existing mangrove areas while providing incentives for restoration projects. By integrating ecological science with community development, mangrove conservation can achieve both environmental sustainability and improved quality of life for coastal populations.');
    await takeScreenshot(page, 6, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 6, 0, 'completed');
  });

  test('Unit 7: Nadran - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 7: Nadran ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 7/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(2000);

    // Watch video
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = video.duration - 1;
        video.dispatchEvent(new Event('ended'));
      }
    });
    await page.waitForTimeout(1000);

    // Question 1 - MCQ
    await page.locator('label').filter({ hasText: /Mangrove roots trap|Akar mangrove/i }).click();
    await takeScreenshot(page, 7, 1, 'mcq_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 2 - MCQ
    await page.locator('label').filter({ hasText: /Flood risk increases|Risiko banjir/i }).click();
    await takeScreenshot(page, 7, 2, 'mcq_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 3 - Essay
    const essay3 = page.locator('textarea').first();
    await essay3.fill('Mangrove forests protect coastal ecosystems through multiple interconnected mechanisms that maintain ecological balance. The extensive root systems physically trap sediment and reduce wave energy, preventing shoreline erosion. Mangroves also serve as critical nursery habitats for juvenile fish and crustaceans, supporting commercial fisheries. The dense vegetation provides feeding and nesting areas for diverse bird species and other wildlife. Additionally, mangrove forests sequester significant amounts of carbon in their biomass and sediments, contributing to climate change mitigation. When mangrove cover decreases, these protective functions are compromised, leading to increased coastal erosion, reduced fish populations, loss of biodiversity, and greater vulnerability to storm surges and flooding events.');
    await takeScreenshot(page, 7, 3, 'essay_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 4 - Essay (two rows)
    const row1 = page.locator('textarea').first();
    await row1.fill('Increasing mangrove cover from twenty percent to seventy percent would significantly reduce coastal erosion rates. The dense root systems would trap more sediment and dissipate wave energy more effectively. This reduction in erosion would protect coastal infrastructure and maintain shoreline stability.');
    
    const row2 = page.locator('textarea').nth(1);
    await row2.fill('Fish production would increase substantially because mangroves provide essential nursery habitats for juvenile fish. With seventy percent mangrove cover, more young fish would survive to adulthood, supporting both commercial and subsistence fisheries. The improved habitat would also increase biodiversity and overall ecosystem health.');
    await takeScreenshot(page, 7, 4, 'essays_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    const essay5 = page.locator('textarea').first();
    await essay5.fill('Coastal communities can balance economic development with mangrove conservation through sustainable resource management practices. Community-based ecotourism programs can generate income while preserving mangrove ecosystems. Sustainable fisheries management ensures long-term fishery productivity without degrading mangrove habitats. Alternative livelihood programs, such as aquaculture in designated areas outside mangrove zones, reduce pressure on the ecosystem. Environmental education helps communities understand the economic value of mangrove ecosystem services, including coastal protection, fisheries support, and carbon sequestration. By involving communities in conservation planning and ensuring they benefit from healthy mangrove ecosystems, economic development and environmental protection can be mutually reinforcing rather than conflicting goals.');
    await takeScreenshot(page, 7, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 7, 0, 'completed');
  });

  test('Unit 8: Rattan - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 8: Rattan ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 8/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(2000);

    // Question 1 - Essay
    const essay1 = page.locator('textarea').first();
    await essay1.fill('Rattan harvesting affects local ecosystems through multiple interconnected pathways that influence both biodiversity and community livelihoods. When rattan is harvested sustainably, with proper replanting and waste management, the forest ecosystem can maintain its ecological functions while providing economic benefits. However, overharvesting without adequate replanting leads to habitat degradation, reduced biodiversity, and long-term economic decline. Sustainable harvesting practices include selective cutting that preserves mature plants for seed production, replanting harvested areas promptly, and utilizing all parts of the plant to minimize waste. These practices maintain forest structure, protect wildlife habitat, and ensure continuous income for local communities. The key is balancing harvest rates with natural regeneration capacity to achieve long-term sustainability.');
    await takeScreenshot(page, 8, 1, 'essay_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 2 - MCQ + Essay
    await page.locator('label').filter({ hasText: /Medium harvest rate/i }).click();
    
    const essay2 = page.locator('textarea').filter({ hasText: /Explain|Jelaskan/i }).first();
    await essay2.fill('Medium harvest rate with high replanting ensures sustainable income while maintaining ecosystem health. This balance allows economic development without depleting natural resources. High replanting compensates for harvested plants, maintaining forest cover and biodiversity. This approach demonstrates that economic and environmental goals can be achieved simultaneously through careful resource management and long-term planning.');
    await takeScreenshot(page, 8, 2, 'mcq_essay_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 3 - MCQ
    await page.locator('label').filter({ hasText: /High replanting|Penanaman tinggi/i }).click();
    await takeScreenshot(page, 8, 3, 'mcq_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 4 - Essay
    const essay4 = page.locator('textarea').first();
    await essay4.fill('A balanced combination for sustainable rattan management would be: harvest rate at fifty percent (medium level), replanting rate at eighty percent (high level), and waste utilization at ninety percent (high level). This combination maintains moderate economic income while ensuring forest regeneration through high replanting rates. The high waste utilization minimizes environmental impact by using all parts of harvested rattan efficiently. This balance prevents overharvesting, maintains biodiversity at acceptable levels, and provides sustainable income for local communities. The medium harvest rate prevents rapid resource depletion while still generating economic benefits, and the high replanting ensures long-term resource availability.');
    await takeScreenshot(page, 8, 4, 'essay_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    const essay5 = page.locator('textarea').first();
    await essay5.fill('Local communities can achieve sustainable economic growth through rattan harvesting by implementing comprehensive resource management strategies. First, communities should establish harvest quotas based on scientific assessments of rattan regeneration rates to prevent overharvesting. Second, mandatory replanting programs should require harvesters to plant multiple new rattan seedlings for each plant harvested. Third, waste reduction initiatives should utilize all parts of the rattan plant, with smaller pieces used for woven products and larger stems for furniture. Fourth, value-added processing, such as crafting finished products locally rather than selling raw materials, can increase income without increasing harvest volume. Finally, certification programs for sustainably harvested rattan can access premium markets, providing economic incentives for sustainable practices while protecting forest ecosystems.');
    await takeScreenshot(page, 8, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 8, 0, 'completed');
  });

  test('Unit 9: Batik - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 9: Batik ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 9/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(2000);

    // Watch video
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = video.duration - 1;
        video.dispatchEvent(new Event('ended'));
      }
    });
    await page.waitForTimeout(1000);

    // Question 1 - Multiple answers (select 4 items)
    await page.locator('label').filter({ hasText: /Using synthetic dyes|Menggunakan pewarna/i }).click();
    await page.locator('label').filter({ hasText: /Using less water|Menggunakan lebih/i }).click();
    await page.locator('label').filter({ hasText: /Releasing untreated|Membuang limbah/i }).click();
    await page.locator('label').filter({ hasText: /Applying full treatment|Menerapkan pengolahan/i }).click();
    await takeScreenshot(page, 9, 1, 'multiple_answers');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 2 - Essay
    const essay2 = page.locator('textarea').first();
    await essay2.fill('Wastewater from batik production contains harmful substances including synthetic dyes, heavy metals, wax residues, and various chemical compounds used in the dyeing process. If released without treatment, these pollutants can severely contaminate water bodies, reducing water quality and harming aquatic ecosystems. The chemicals can be toxic to fish and other aquatic organisms, disrupt food chains, and make water unsafe for human use. Heavy metals can accumulate in sediments and bioaccumulate in organisms, creating long-term environmental hazards. Proper wastewater treatment is essential to remove or neutralize these pollutants before discharge, protecting both environmental health and community water resources.');
    await takeScreenshot(page, 9, 2, 'essay_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 3 - Simulation
    await page.locator('button').filter({ hasText: /Run Simulation/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 9, 3, 'simulation_run');
    await page.locator('button').filter({ hasText: /Record Data/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 4 - Essay
    const essay4 = page.locator('textarea').first();
    await essay4.fill('The most sustainable combination would be: natural dyes, low water use, and full wastewater treatment. Natural dyes are derived from plants and other renewable sources, eliminating the toxic chemicals found in synthetic dyes. Low water use minimizes resource consumption and reduces the volume of wastewater requiring treatment. Full wastewater treatment ensures that any remaining pollutants are removed before discharge, protecting aquatic ecosystems. This combination balances environmental protection with practical production needs. While natural dyes may have different color properties than synthetics, they are safer for workers and the environment. The initial investment in water conservation and treatment infrastructure pays long-term environmental and health benefits.');
    await takeScreenshot(page, 9, 4, 'essay_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    const essay5 = page.locator('textarea').first();
    await essay5.fill('Batik producers can balance economic and environmental sustainability through integrated approaches that reduce environmental impact while maintaining profitability. Transitioning to natural dyes, though initially more expensive, can create premium products that command higher prices in environmentally conscious markets. Implementing water recycling systems reduces water costs while minimizing environmental discharge. Proper wastewater treatment, while requiring investment, prevents regulatory penalties and protects community health, maintaining the social license to operate. Training artisans in efficient production techniques reduces material waste and improves product quality. Developing eco-certification programs can access international markets willing to pay premium prices for sustainably produced batik. By viewing environmental responsibility as a competitive advantage rather than a cost burden, producers can achieve both economic success and environmental sustainability.');
    await takeScreenshot(page, 9, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 9, 0, 'completed');
  });

  test('Unit 10: Tahu Gejrot - Complete all questions', async ({ page }) => {
    console.log('\n=== Testing Unit 10: Tahu Gejrot ===');
    
    await page.goto('http://localhost:8080/quiz');
    await page.waitForTimeout(1000);
    
    await page.locator('button').filter({ hasText: /Unit 10/i }).first().click();
    await page.waitForTimeout(1000);
    await page.locator('button').filter({ hasText: /Start|Mulai/i }).click();
    await page.waitForTimeout(2000);

    // Watch video
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = video.duration - 1;
        video.dispatchEvent(new Event('ended'));
      }
    });
    await page.waitForTimeout(1000);

    // Question 1 - Drag and drop
    // Drag items to drop zones
    await page.waitForTimeout(500);
    const tofu = page.locator('[draggable="true"]').filter({ hasText: /Tofu|Tahu/i }).first();
    const prepTank = page.locator('div').filter({ hasText: /Preparation|Persiapan/i }).first();
    await tofu.dragTo(prepTank);
    await page.waitForTimeout(500);
    
    const sauce = page.locator('[draggable="true"]').filter({ hasText: /Sauce|Kuah/i }).first();
    const inputTank = page.locator('div').filter({ hasText: /Input/i }).first();
    await sauce.dragTo(inputTank);
    await page.waitForTimeout(500);
    
    const waste = page.locator('[draggable="true"]').filter({ hasText: /Wastewater|Pengolahan/i }).first();
    const treatTank = page.locator('div').filter({ hasText: /Treatment|Pengolahan/i }).first();
    await waste.dragTo(treatTank);
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 10, 1, 'dragdrop_answered');

    // Question 2 - Simulation
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: /Run Simulation/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 10, 2, 'simulation_run');
    await page.locator('button').filter({ hasText: /Record Data/i }).click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 3 - MCQ
    await page.locator('label').filter({ hasText: /Plant-based protein|Protein nabati/i }).click();
    await takeScreenshot(page, 10, 3, 'mcq_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 4 - Essay
    const essay4 = page.locator('textarea').first();
    await essay4.fill('Tahu gejrot production demonstrates sustainable food system principles through its use of plant-based protein, local ingredients, and traditional processing methods. Tofu, made from soybeans, requires significantly fewer natural resources than animal-based proteins, including less water, land, and energy. The dish uses locally sourced ingredients such as palm sugar, vinegar, and chili, which support local agriculture and reduce transportation emissions. Small-scale production typical of tahu gejrot vendors minimizes industrial processing and packaging waste. The traditional preparation methods have been refined over generations to be efficient and environmentally friendly. By consuming plant-based traditional foods like tahu gejrot, communities can maintain cultural food heritage while practicing environmentally sustainable consumption patterns.');
    await takeScreenshot(page, 10, 4, 'essay_answered');
    await page.locator('button').filter({ hasText: /Next|Berikutnya/i }).click();
    await page.waitForTimeout(500);

    // Question 5 - Essay
    const essay5 = page.locator('textarea').first();
    await essay5.fill('Local food systems like tahu gejrot contribute to environmental sustainability through multiple interconnected mechanisms. First, plant-based protein production from soybeans has a much lower environmental footprint than animal agriculture, requiring less land, water, and energy while producing fewer greenhouse gas emissions. Second, local sourcing of ingredients reduces transportation distances and associated carbon emissions. Third, small-scale traditional production methods typically use less packaging and generate less waste than industrial food processing. Fourth, these food systems support local economies and agricultural diversity, which strengthens community resilience. Fifth, traditional knowledge embedded in these food practices often includes sustainable techniques refined over generations. By supporting and preserving local food systems like tahu gejrot, communities can maintain cultural identity while practicing sustainable consumption that benefits both people and the environment.');
    await takeScreenshot(page, 10, 5, 'essay_answered');
    
    await page.locator('button').filter({ hasText: /Submit|Kirim/i }).click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 10, 0, 'completed');
  });
});
