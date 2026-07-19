import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const DIR = path.join("test-results", "screenshots");
fs.mkdirSync(DIR, { recursive: true });
const SS = (name: string) => path.join(DIR, `${name}.jpg`);

async function skipToUnitSelect(page: any) {
  await page.goto("http://localhost:8080/quiz", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const inputs = await page.locator("input").all();
  if (inputs[0]) await inputs[0].fill("Rahmi");
  if (inputs[1]) await inputs[1].fill("10A");
  if (inputs[2]) await inputs[2].fill("SMAN 1 Cirebon");
  if (inputs[3]) await inputs[3].fill("08123456789");
  await page.locator("button[type=submit]").first().click();
  await page.waitForTimeout(500);
  await page.waitForSelector("text=Nasi Jamblang", { timeout: 45000 });
}

test("1 - Results page font hitam angka skor berwarna", async ({ page }) => {
  await page.goto("http://localhost:8080/results", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.history.replaceState(
      { score: 2, total: 5, answers: { 1: "They contain natural compounds that help preserve food", 2: "Time taken for food to spoil" }, unit: 1 },
      "", "/results"
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SS("1-results-font-hitam"), fullPage: true, type: "jpeg", quality: 90 });
});

test("2 - Unit 1 soal 2 MCQ radio button", async ({ page }) => {
  await skipToUnitSelect(page);
  await page.locator("button").filter({ hasText: /Nasi Jamblang/ }).first().click();
  await page.waitForTimeout(1500);
  await page.locator("button").filter({ hasText: /Mulai Soal|Start Questions/ }).first().click();
  await page.waitForTimeout(800);
  await page.locator("button").filter({ hasText: /^1$/ }).first().click();
  await page.waitForTimeout(200);
  await page.locator("label").first().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.locator("button").filter({ hasText: /^2$/ }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: SS("2-unit1-soal2-radio-mcq"), fullPage: false, type: "jpeg", quality: 90 });
});

test("3a - Essay kurang 15 kata next disabled", async ({ page }) => {
  await skipToUnitSelect(page);
  await page.locator("button").filter({ hasText: /Nasi Jamblang/ }).first().click();
  await page.waitForTimeout(1500);
  await page.locator("button").filter({ hasText: /Mulai Soal|Start Questions/ }).first().click();
  await page.waitForTimeout(800);
  await page.locator("button").filter({ hasText: /^1$/ }).first().click();
  await page.waitForTimeout(200);
  await page.locator("label").first().click().catch(() => {});
  await page.waitForTimeout(200);
  await page.locator("button").filter({ hasText: /^2$/ }).first().click();
  await page.waitForTimeout(200);
  await page.locator("label").first().click().catch(() => {});
  await page.waitForTimeout(200);
  await page.locator("button").filter({ hasText: /^3$/ }).first().click();
  await page.waitForTimeout(400);
  await page.locator("textarea").fill("Daun jati lebih baik.");
  await page.waitForTimeout(400);
  await page.screenshot({ path: SS("3a-essay-kurang-15-disabled"), fullPage: false, type: "jpeg", quality: 90 });
});

test("3b - Essay cukup 15 kata next enabled", async ({ page }) => {
  await skipToUnitSelect(page);
  await page.locator("button").filter({ hasText: /Nasi Jamblang/ }).first().click();
  await page.waitForTimeout(1500);
  await page.locator("button").filter({ hasText: /Mulai Soal|Start Questions/ }).first().click();
  await page.waitForTimeout(800);
  await page.locator("button").filter({ hasText: /^1$/ }).first().click();
  await page.waitForTimeout(200);
  await page.locator("label").first().click().catch(() => {});
  await page.waitForTimeout(200);
  await page.locator("button").filter({ hasText: /^2$/ }).first().click();
  await page.waitForTimeout(200);
  await page.locator("label").first().click().catch(() => {});
  await page.waitForTimeout(200);
  await page.locator("button").filter({ hasText: /^3$/ }).first().click();
  await page.waitForTimeout(400);
  await page.locator("textarea").fill("Daun jati lebih baik dari plastik karena dapat terurai secara alami di lingkungan dan tidak mencemari tanah maupun air sungai.");
  await page.waitForTimeout(400);
  await page.screenshot({ path: SS("3b-essay-cukup-enabled"), fullPage: false, type: "jpeg", quality: 90 });
});

test("4a - Unit 9 sim output worst case merah", async ({ page }) => {
  await skipToUnitSelect(page);
  await page.locator("button").filter({ hasText: /Batik/ }).first().click();
  await page.waitForTimeout(1500);
  await page.locator("button").filter({ hasText: /Mulai Soal|Start Questions/ }).first().click();
  await page.waitForTimeout(1500);
  await page.locator("button").filter({ hasText: /START ASSESSMENT|MULAI PENILAIAN/ }).first().click().catch(() => {});
  await page.waitForTimeout(800);
  await page.locator("button").filter({ hasText: /RUN SIMULATION|JALANKAN SIMULASI/ }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: SS("4a-unit9-output-merah"), fullPage: false, type: "jpeg", quality: 90 });
});

test("4b - Unit 9 sim output best case hijau", async ({ page }) => {
  await skipToUnitSelect(page);
  await page.locator("button").filter({ hasText: /Batik/ }).first().click();
  await page.waitForTimeout(1500);
  await page.locator("button").filter({ hasText: /Mulai Soal|Start Questions/ }).first().click();
  await page.waitForTimeout(1500);
  await page.locator("button").filter({ hasText: /START ASSESSMENT|MULAI PENILAIAN/ }).first().click().catch(() => {});
  await page.waitForTimeout(800);
  await page.locator("button").filter({ hasText: /^Natural$|^Alami$/ }).first().click().catch(() => {});
  await page.locator("button").filter({ hasText: /^Low$|^Rendah$/ }).first().click().catch(() => {});
  await page.locator("button").filter({ hasText: /^Full$|^Penuh$/ }).first().click().catch(() => {});
  await page.locator("button").filter({ hasText: /RUN SIMULATION|JALANKAN SIMULASI/ }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: SS("4b-unit9-output-hijau"), fullPage: false, type: "jpeg", quality: 90 });
});

test("5a - Unit 9 intro tanpa teks Nasi Jamblang", async ({ page }) => {
  await skipToUnitSelect(page);
  await page.locator("button").filter({ hasText: /Batik/ }).first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SS("5a-unit9-intro"), fullPage: false, type: "jpeg", quality: 90 });
});

test("5b - Unit 10 intro tanpa teks Nasi Jamblang", async ({ page }) => {
  await skipToUnitSelect(page);
  await page.locator("button").filter({ hasText: /Tahu Gejrot/ }).first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SS("5b-unit10-intro"), fullPage: false, type: "jpeg", quality: 90 });
});

test("6 - Video watched badge Unit 5", async ({ page }) => {
  await skipToUnitSelect(page);
  await page.locator("button").filter({ hasText: /Tape/ }).first().click();
  await page.waitForTimeout(1500);
  await page.locator("button").filter({ hasText: /Mulai Soal|Start Questions/ }).first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: SS("6a-unit5-stimulus-sebelum"), fullPage: false, type: "jpeg", quality: 90 });
  await page.locator("button").filter({ hasText: /Watch Video|Tonton Video/ }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const video = document.querySelector("video");
    if (video) video.dispatchEvent(new Event("ended"));
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: SS("6b-unit5-video-watched-badge"), fullPage: false, type: "jpeg", quality: 90 });
});
