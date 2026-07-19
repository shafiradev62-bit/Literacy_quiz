from pathlib import Path

path = Path(r"C:\Users\rahmivina\Downloads\Literacy_quiz-master\Literacy_quiz-master\src\components\exam\Unit9Pisa.tsx")
text = path.read_text(encoding="utf-8")
start = text.index("            {/* ── STEP 1: Q1 — Yes/No Grid ── */}")
end = text.index("          </div>\n          {/* ── BOTTOM NAVIGATION ── */}")

new_steps = r'''            {/* ── STEP 1: natural dye essay (old Q2) ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 1 / 2" : "Question 1 / 2"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Produksi Batik" : "Batik Production"}</p>
                  <p>{isId
                    ? "Produksi batik dapat menggunakan pewarna sintetis atau pewarna alami. Kedua jenis tersebut dapat memengaruhi lingkungan jika penggunaan air tinggi dan limbah tidak diolah dengan baik."
                    : "Batik production can use synthetic dyes or natural dyes. Both types can affect the environment if water use is high and wastewater is not treated properly."}</p>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Perhatikan informasi Produksi Batik dan jalankan simulasi jika diperlukan.\n\nCoba skenario berikut dalam simulasi:\n• Jenis pewarna: Alami\n• Penggunaan air: Tinggi\n• Pengolahan limbah: Tidak ada atau Sebagian\n\nBeberapa pengrajin batik berpendapat bahwa penggunaan pewarna alami selalu aman bagi lingkungan, terlepas dari seberapa banyak air yang digunakan. Jelaskan mengapa pendapat ini tidak sepenuhnya benar. Gunakan stimulus dan/atau hasil simulasi sebagai bukti."
                  : "Refer to the Batik Production information and run the simulation if needed.\n\nTry this scenario in the simulation:\n• Dye type: Natural\n• Water use: High\n• Waste treatment: None or Partial\n\nSome batik craftspeople think that using natural dyes is always environmentally safe, regardless of how much water they use. Explain why this opinion is not entirely correct. Use the stimulus and/or simulation results as evidence."}</p>
                <WritingGuideBtn text={isId ? "Jawaban yang kuat menjelaskan bahwa pewarna alami dalam konsentrasi tinggi masih dapat mengganggu ekosistem karena limbah organik yang berlebihan, dan penggunaan air yang tinggi tetap menghasilkan volume limbah yang besar." : "A strong answer explains that natural dyes in high concentrations can still disrupt ecosystems due to excessive organic waste, and high water use still generates large volumes of waste."} />
                <textarea value={q2Answer} onChange={e => setQ2Answer(e.target.value)} className="w-full h-32 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q2Answer) >= 8  ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q2Answer)} {isId ? "kata (Minimal 8)" : "words (Min. 8)"}
                </p>
              </div>
            )}

            {/* ── STEP 2: decision/balance essay (old Q5) ── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 2 / 2" : "Question 2 / 2"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Pengambilan Keputusan" : "Decision Making"}</p>
                  <table className="w-full text-[11px] border-collapse">
                    <thead><tr className="bg-muted/50"><th className="border border-border/40 px-2 py-1 text-left">{isId?"Tujuan":"Goal"}</th><th className="border border-border/40 px-2 py-1 text-left">{isId?"Mengapa penting":"Why it matters"}</th></tr></thead>
                    <tbody>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Mempertahankan produksi batik":"Maintain batik production"}</td><td className="border border-border/40 px-2 py-1">{isId?"Mendukung lapangan kerja, pendapatan, dan warisan budaya":"Supports local jobs, income, and cultural heritage"}</td></tr>
                      <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1">{isId?"Mengurangi pencemaran air":"Reduce water pollution"}</td><td className="border border-border/40 px-2 py-1">{isId?"Melindungi sungai, organisme air, dan kesehatan masyarakat":"Protects rivers, aquatic organisms, and community health"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Menggunakan teknologi pengolahan":"Use treatment technology"}</td><td className="border border-border/40 px-2 py-1">{isId?"Membantu mengurangi zat berbahaya sebelum dibuang":"Helps reduce harmful contaminants before disposal"}</td></tr>
                      <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1">{isId?"Meningkatkan efisiensi produksi":"Improve production efficiency"}</td><td className="border border-border/40 px-2 py-1">{isId?"Dapat mengurangi penggunaan air dan limbah":"Can reduce water use and waste generation"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Industri batik di Trusmi mendukung lapangan kerja, pendapatan lokal, dan warisan budaya, tetapi juga menimbulkan tantangan lingkungan.\n\nGunakan tabel pengambilan keputusan dan simulasi untuk menjelaskan mengapa penting menyeimbangkan manfaat ekonomi dan perlindungan lingkungan dalam produksi batik. Jawabanmu harus menyebutkan produksi, pencemaran air, pengolahan limbah, dan keberlanjutan jangka panjang."
                  : "The batik industry in Trusmi supports jobs, local income, and cultural heritage, but it also creates environmental challenges.\n\nUse the decision-making table and the simulation to explain why it is important to balance economic benefits and environmental protection in batik production. Your answer should mention production, water pollution, wastewater treatment, and long-term sustainability."}</p>
                <WritingGuideBtn text={isId
                  ? "Gunakan air rendah atau sedang + pengolahan limbah penuh + pilihan pewarna yang lebih aman. Pewarna alami membantu, tetapi tetap perlu pengolahan limbah. Produksi tetap berjalan sambil mengurangi pencemaran sungai dan menjaga mata pencaharian masyarakat."
                  : "Use low or medium water use + full wastewater treatment + safer dye choice. Natural dyes are helpful, but they still need proper treatment. Production can continue while river pollution decreases and community livelihoods are protected."} />
                <textarea value={q5Answer} onChange={e => setQ5Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q5Answer) >= 8  ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q5Answer)} {isId ? "kata (Minimal 8)" : "words (Min. 8)"}
                </p>
                <button
                  onClick={() => {
                    if (!isStepValid()) return;
                    saveCompletedSession(9, { q2Answer, q5Answer, history }, computeScore(), 2);
                    onExit?.();
                  }}
                  disabled={!isStepValid()}
                  className="w-full py-3 bg-emerald-600 text-white text-[12px] font-bold rounded-lg border border-emerald-700 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isId ? "KIRIM JAWABAN UNIT 9" : "SUBMIT UNIT 9 ANSWERS"}
                </button>
              </div>
            )}

'''

path.write_text(text[:start] + new_steps + text[end:], encoding="utf-8")
print("steps replaced ok")
