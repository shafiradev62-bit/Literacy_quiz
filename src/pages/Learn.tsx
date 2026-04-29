import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Learn = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isId = lang === "id";
  const [selectedUnit, setSelectedUnit] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(1);

  const unitLabels: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, string> = {
    1: isId ? "Unit 1: Nasi Jamblang" : "Unit 1: Nasi Jamblang",
    2: isId ? "Unit 2: Terasi Cirebon" : "Unit 2: Terasi Cirebon",
    3: isId ? "Unit 3: Empal Gentong" : "Unit 3: Empal Gentong",
    4: isId ? "Unit 4: Kerupuk Melarat" : "Unit 4: Kerupuk Melarat",
    5: isId ? "Unit 5: Tape Ketan Bakung" : "Unit 5: Tape Ketan Bakung",
    6: isId ? "Unit 6: Ekosistem Mangrove" : "Unit 6: Mangrove Ecosystem",
    7: isId ? "Unit 7: Nadran (Syukuran Laut)" : "Unit 7: Nadran (Sea Ritual)",
    8: isId ? "Unit 8: Kerajinan Rotan" : "Unit 8: Rattan Craft",
    9: isId ? "Unit 9: Batik Trusmi" : "Unit 9: Batik Trusmi",
    10: isId ? "Unit 10: Tahu Gejrot" : "Unit 10: Tahu Gejrot",
  };

  return (
    <div className="h-screen flex flex-col pt-16">
      <div className="bg-white border-b border-border/60 px-6 py-4 shrink-0">
        <span className="text-xs font-bold tracking-wide uppercase text-foreground">
          {isId ? "Materi Bacaan" : "Reading Material"}
        </span>
      </div>

      <div className="bg-muted/30 px-6 py-3 border-b border-border/50 shrink-0">
        <div className="flex gap-2 flex-wrap">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((u) => (
            <button
              key={u}
              onClick={() => setSelectedUnit(u)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                selectedUnit === u
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {unitLabels[u]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto exam-scrollbar px-8 py-8 border-r border-border/30">
          <div className="pr-4 space-y-5 text-[14px] leading-[1.75] text-foreground/80">

            {/* UNIT 1 */}
            {selectedUnit === 1 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Nasi Jamblang: Tradisi Kuliner dan Kemasan Berkelanjutan" : "Nasi Jamblang: Culinary Tradition and Sustainable Packaging"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Lingkungan" : "Theme: Environment"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Nasi Jamblang secara tradisional menggunakan daun jati sebagai pembungkus makanan alami. Daun jati bersifat biodegradable dan terurai secara alami di lingkungan, sehingga mengurangi limbah plastik." : "Nasi Jamblang traditionally uses teak leaves as natural food packaging. Teak leaves are biodegradable and decompose naturally in the environment, reducing plastic waste."}
                </p>
              </div>
              


              {isId ? <>
                <p>Nasi Jamblang adalah hidangan nasi tradisional yang berasal dari Cirebon, Jawa Barat. Yang membuatnya unik adalah cara penyajiannya — nasi dibungkus dengan daun jati (<em>Tectona grandis</em>).</p>
                <p>Nasi Jamblang mulai dikenal sejak masa kolonial, ketika para pekerja membutuhkan makanan yang praktis dan tahan lama. Daun jati dipilih karena kuat, tidak mudah robek, dan berpori sehingga memungkinkan sirkulasi udara.</p>
                <p>Saat ini, beberapa pedagang beralih ke plastik karena lebih praktis dan murah. Namun plastik memiliki dampak lingkungan yang besar karena sulit terurai. Sebaliknya, daun jati merupakan bahan alami yang dapat terurai dengan cepat dan lebih ramah lingkungan.</p>
                <p>Penelitian menunjukkan bahwa harga memiliki pengaruh signifikan terhadap kepuasan pelanggan pada usaha Nasi Jamblang, dengan nilai koefisien sebesar 0,77.</p>
              </> : <>
                <p>Nasi Jamblang is a traditional rice dish from Cirebon, West Java. What makes it unique is serving rice wrapped in teak leaves (<em>Tectona grandis</em>).</p>
                <p>Nasi Jamblang originated during the colonial period when workers needed practical, durable food. Teak leaves were chosen for their strength, tear-resistance, and porosity that allows air circulation.</p>
                <p>Today, some vendors use plastic packaging because it's more practical and cheaper. However, plastic has significant environmental impacts because it is difficult to decompose. In contrast, teak leaves are natural and biodegradable.</p>
                <p>Studies show that price significantly influences customer satisfaction in Nasi Jamblang businesses, with a coefficient value of 0.77.</p>
              </>}
            </>}

            {/* UNIT 2 */}
            {selectedUnit === 2 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Terasi Cirebon: Tradisi, Sains, dan Keberlanjutan" : "Terasi Cirebon: Tradition, Science, and Sustainability"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Lingkungan & Pangan" : "Theme: Environment & Food"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Terasi dibuat dari udang rebon yang ditangkap dari ekosistem laut pesisir. Produksinya bergantung pada keberlanjutan populasi udang dan kesehatan ekosistem laut." : "Shrimp paste is produced from rebon shrimp harvested from coastal marine ecosystems. Its production depends on the sustainability of shrimp populations and healthy marine ecosystems."}
                </p>
              </div>



              {isId ? <>
                <p>Terasi adalah produk fermentasi tradisional Indonesia yang banyak digunakan sebagai penyedap. Di Cirebon, terasi dibuat dari udang rebon yang ditangkap dari ekosistem laut pesisir.</p>
                <p>Proses pembuatan meliputi penggaraman, penghalusan, penjemuran, dan fermentasi. Selama fermentasi, mikroorganisme memecah protein menjadi asam amino seperti asam glutamat yang memberikan rasa umami khas.</p>
                <p>Fermentasi menyebabkan perubahan signifikan pada komposisi mikroorganisme. Sebelum fermentasi, udang dapat mengandung bakteri berbahaya seperti <em>Vibrio</em>. Setelah fermentasi, bakteri berbahaya berkurang dan bakteri menguntungkan seperti <em>Bacilli</em> menjadi dominan.</p>
                <p>Kondisi fermentasi — seperti kadar garam, lama penjemuran, dan tingkat kebersihan — sangat penting untuk menjamin keamanan dan konsistensi produk.</p>
                <p>Produksi terasi juga berkaitan erat dengan keberlanjutan lingkungan. Ketersediaan udang rebon bergantung pada kesehatan ekosistem laut.</p>
              </> : <>
                <p>Terasi is a traditional Indonesian fermented shrimp paste widely used as a flavor enhancer. In Cirebon, it's made from rebon shrimp harvested from coastal marine ecosystems.</p>
                <p>The process includes salting, grinding, drying, and fermentation. During fermentation, microorganisms break down proteins into amino acids such as glutamic acid, producing umami taste.</p>
                <p>Fermentation significantly changes microbial composition. Before fermentation, shrimp may contain harmful bacteria like <em>Vibrio</em>. After fermentation, harmful bacteria are reduced and beneficial bacteria like <em>Bacilli</em> become dominant.</p>
                <p>Fermentation conditions — salt level, drying time, and hygiene — are critical for ensuring safety and consistency.</p>
                <p>Terasi production is also closely linked to environmental sustainability. The availability of rebon shrimp depends on healthy marine ecosystems.</p>
              </>}
            </>}

            {/* UNIT 3 */}
            {selectedUnit === 3 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Empal Gentong: Tradisi, Ilmu Panas, dan Keberlanjutan" : "Empal Gentong: Tradition, Heat Science, and Sustainability"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Energi & Lingkungan" : "Theme: Energy & Environment"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Empal Gentong secara tradisional dimasak menggunakan gentong tanah liat yang terbuat dari bahan tanah alami. Tanah liat merupakan sumber daya alam yang dapat kembali ke lingkungan tanpa menimbulkan bahaya. Wadah tanah liat juga mampu menahan dan mendistribusikan panas secara efisien." : "Empal Gentong is traditionally cooked in clay pots made from natural soil materials. Clay is a natural resource that can return to the environment without producing harmful waste. Clay cookware also retains and distributes heat efficiently."}
                </p>
              </div>



              {isId ? <>
                <p>Empal Gentong adalah makanan tradisional khas Cirebon yang dimasak menggunakan gentong tanah liat yang terbuat dari bahan alami. Tanah liat merupakan sumber daya alam yang ramah lingkungan karena dapat kembali ke alam tanpa menghasilkan limbah berbahaya.</p>
                <p>Penelitian ilmiah menunjukkan bahwa bahan alat masak mempengaruhi perpindahan panas, efisiensi energi, dan kualitas makanan. Wadah tanah liat mampu menahan dan mendistribusikan panas secara merata sehingga makanan dapat dimasak lebih efisien dengan energi yang lebih sedikit.</p>
                <p>Sebaliknya, panci logam cenderung kehilangan panas lebih cepat sehingga membutuhkan energi lebih besar untuk mempertahankan suhu memasak.</p>
                <p>Kondisi memasak seperti ketebalan wadah, besar panas, dan volume air mempengaruhi hasil memasak. Dinding tanah liat yang lebih tebal dapat meningkatkan kemampuan menahan panas.</p>
                <p>Empal Gentong yang dimasak perlahan mencerminkan praktik tradisional yang berpotensi hemat energi dan berkelanjutan.</p>
              </> : <>
                <p>Empal Gentong is a traditional dish from Cirebon cooked using a clay pot (<em>gentong</em>) made from natural soil materials. Clay is environmentally friendly as it can return to the environment without producing harmful waste.</p>
                <p>Scientific studies show that cooking materials significantly influence heat transfer, energy efficiency, and food quality. Clay pots retain and distribute heat evenly, allowing food to cook more efficiently with less energy.</p>
                <p>In contrast, metal pots tend to lose heat more quickly, requiring higher energy input to maintain cooking temperature.</p>
                <p>Cooking conditions such as pot thickness, heat input, and water volume affect cooking performance. Thicker clay walls can improve heat retention.</p>
                <p>Empal Gentong, cooked slowly over a fire, reflects a traditional practice that may be both energy-efficient and sustainable.</p>
              </>}
            </>}

            {/* UNIT 4 */}
            {selectedUnit === 4 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Kerupuk Melarat: Goreng Pasir dan Keberlanjutan" : "Kerupuk Melarat: Sand-Frying and Sustainability"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Sumber Daya & Keberlanjutan" : "Theme: Resources & Sustainability"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Kerupuk Melarat digoreng menggunakan pasir panas, bukan minyak. Teknik tradisional ini mengurangi kebutuhan minyak dalam jumlah besar dan memungkinkan pasir digunakan kembali berkali-kali." : "Kerupuk Melarat is fried using heated sand instead of cooking oil. This traditional technique reduces the need for large amounts of oil and allows the sand to be reused multiple times."}
                </p>
              </div>



              {isId ? <>
                <p>Kerupuk Melarat adalah kerupuk tradisional yang dimasak menggunakan pasir panas, bukan minyak. Pasir berfungsi sebagai media penghantar panas dan dapat digunakan kembali berkali-kali, sementara penggorengan dengan minyak biasanya menyebabkan penyerapan minyak yang lebih tinggi pada makanan.</p>
                <p>Studi ilmiah menunjukkan bahwa proses penggorengan melibatkan perpindahan panas melalui kontak langsung antara makanan dan media pemanas. Perbedaan media, suhu, dan waktu penggorengan memengaruhi penyerapan minyak, tingkat kerenyahan, penggunaan energi, serta keberlanjutan.</p>
                <p>Penggunaan pasir sebagai media penggorengan mengurangi kebutuhan minyak secara signifikan. Pasir dapat dipanaskan ulang dan digunakan kembali, sehingga mengurangi limbah dan biaya produksi.</p>
                <p>Dari sisi kesehatan, kerupuk yang digoreng dengan pasir memiliki kandungan lemak yang lebih rendah dibandingkan yang digoreng dengan minyak, karena pasir tidak meresap ke dalam makanan.</p>
                <p>Metode ini menunjukkan bagaimana praktik tradisional dapat mendukung keberlanjutan dalam sistem produksi pangan lokal.</p>
              </> : <>
                <p>Kerupuk Melarat is a traditional cracker cooked using hot sand instead of oil. Sand acts as a heat-transfer medium and can be reused many times, while oil frying usually causes higher oil absorption in the food.</p>
                <p>Scientific studies show that frying involves heat transfer through direct contact between food and a heating medium. Different media, temperatures, and frying times affect oil absorption, crispiness, energy use, and sustainability.</p>
                <p>Using sand as a frying medium significantly reduces the need for oil. Sand can be reheated and reused, reducing waste and production costs.</p>
                <p>From a health perspective, crackers fried in sand have lower fat content compared to oil-fried ones, since sand does not absorb into the food.</p>
                <p>This method demonstrates how traditional practices can support sustainability in local food production systems.</p>
              </>}
            </>}

            {/* UNIT 5 */}
            {selectedUnit === 5 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Tape Ketan Bakung: Fermentasi Tradisional dan Kemasan Berkelanjutan" : "Tape Ketan Bakung: Traditional Fermentation and Sustainable Packaging"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Bioteknologi & Keberlanjutan" : "Theme: Biotechnology & Sustainability"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Tape Ketan Bakung dibuat dari beras ketan melalui proses fermentasi tradisional yang melibatkan mikroorganisme. Produk ini dibungkus dengan daun alami yang biodegradable dan mengurangi limbah plastik." : "Tape Ketan Bakung is made from glutinous rice through a traditional fermentation process involving microorganisms. The product is wrapped in natural leaves that are biodegradable and reduce plastic waste."}
                </p>
              </div>



              {isId ? <>
                <p>Tape ketan adalah produk tradisional hasil fermentasi beras ketan. Mikroorganisme dalam ragi menguraikan pati menjadi gula, kemudian mengubah sebagian gula tersebut menjadi alkohol, asam, dan senyawa aroma.</p>
                <p>Proses fermentasi melibatkan aktivitas mikroba (ragi dan bakteri) yang mengubah karbohidrat menjadi senyawa yang lebih sederhana. Hal ini mencerminkan bioteknologi tradisional yang hemat energi dan lebih ramah lingkungan dibandingkan pengolahan pangan industri.</p>
                <p>Kemasan daun alami bersifat biodegradable dan dapat mengurangi limbah plastik. Penelitian menunjukkan bahwa kemasan daun pisang sering lebih disukai dan dapat memengaruhi kualitas produk serta komposisi komunitas mikroba.</p>
                <p>Fermentasi yang baik biasanya terjadi pada suhu sekitar 25–30°C selama kurang lebih 24–48 jam. Fermentasi yang berlebihan dapat membuat produk menjadi terlalu asam.</p>
              </> : <>
                <p>Tape ketan is a traditional fermented glutinous rice product. Microorganisms in ragi break down starch into sugar, then convert part of the sugar into alcohol, acids, and aroma compounds.</p>
                <p>The fermentation process involves microbial activity (yeast and bacteria) that converts carbohydrates into simpler compounds. This reflects traditional biotechnology that is energy-efficient and environmentally friendly compared to industrial food processing.</p>
                <p>Natural leaf packaging is biodegradable and can reduce plastic waste. Research shows that banana leaf packaging is often preferred and can influence product quality and microbial community composition.</p>
                <p>Good fermentation usually occurs around 25–30°C for about 24–48 hours. Over-fermentation can make the product too sour.</p>
              </>}
            </>}

            {/* UNIT 6 */}
            {selectedUnit === 6 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Ekosistem Mangrove: Perlindungan Pesisir dan Keberlanjutan" : "Mangrove Ecosystem: Coastal Protection and Sustainability"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Ekosistem & Lingkungan" : "Theme: Ecosystem & Environment"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Hutan mangrove berfungsi sebagai perlindungan pesisir dari erosi, penyerap karbon, serta habitat bagi berbagai spesies. Konservasi mangrove sangat penting untuk perlindungan keanekaragaman hayati dan keberlanjutan ekosistem pesisir." : "Mangrove forests serve as coastal protection against erosion, carbon sinks, and habitats for diverse species. Mangrove conservation is essential for biodiversity protection and sustainable coastal ecosystems."}
                </p>
              </div>



              {isId ? <>
                <p>Di wilayah pesisir Cirebon, beberapa masyarakat melaporkan bahwa abrasi pantai menjadi semakin parah. Tambak ikan, jalan pesisir, dan beberapa rumah semakin terdampak oleh gelombang dan banjir.</p>
                <p>Salah satu kemungkinan penyebabnya adalah berkurangnya hutan mangrove. Mangrove dapat mengurangi energi gelombang, menjebak sedimen dengan akarnya, menyediakan habitat bagi ikan dan kepiting, serta menyimpan karbon.</p>
                <p>Akar mangrove yang kompleks berfungsi sebagai penyaring alami yang menjebak sedimen dan mengurangi energi gelombang sebelum mencapai pantai, sehingga secara langsung mengurangi laju abrasi.</p>
                <p>Mangrove juga menyediakan habitat dan tempat pembesaran (nursery ground) bagi berbagai spesies ikan dan organisme laut. Ketika tutupan mangrove berkurang, produksi ikan dapat menurun secara signifikan.</p>
                <p>Selain itu, hutan mangrove merupakan penyerap karbon yang efisien, membantu mitigasi perubahan iklim dan menjaga keseimbangan ekosistem pesisir.</p>
              </> : <>
                <p>In coastal areas of Cirebon, some communities have reported that shoreline erosion has become more severe. Fish ponds, coastal roads, and some houses are increasingly affected by waves and flooding.</p>
                <p>One possible cause is the reduction of mangrove forests. Mangroves can reduce wave energy, trap sediment with their roots, provide habitat for fish and crabs, and store carbon.</p>
                <p>Mangrove roots act as natural filters that trap sediment and reduce wave energy before it reaches the shore, directly reducing erosion rates.</p>
                <p>Mangroves also provide habitat and nursery grounds for various fish species and marine organisms. When mangrove cover decreases, fish production can decline significantly.</p>
                <p>Additionally, mangrove forests are efficient carbon sinks, helping to mitigate climate change and maintain coastal ecosystem balance.</p>
              </>}
            </>}

            {/* UNIT 7 */}
            {selectedUnit === 7 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Nadran: Ritual Syukuran Laut dan Keberlanjutan Ekosistem" : "Nadran: Sea Thanksgiving Ritual and Ecosystem Sustainability"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Budaya & Keberlanjutan Laut" : "Theme: Culture & Marine Sustainability"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Nadran merupakan ritual tradisional sebagai ungkapan rasa syukur atas sumber daya laut. Praktik ini mencerminkan hubungan budaya antara masyarakat pesisir dan laut, serta dapat meningkatkan kesadaran terhadap praktik perikanan berkelanjutan." : "Nadran is a traditional ritual expressing gratitude for marine resources. The practice reflects the cultural relationship between coastal communities and the sea and may foster awareness about sustainable fishing practices."}
                </p>
              </div>



              {isId ? <>
                <p>Nadran adalah ritual tradisional yang dipraktikkan oleh masyarakat pesisir di Cirebon sebagai ungkapan rasa syukur atas sumber daya laut yang melimpah dan doa untuk keselamatan para nelayan saat melaut.</p>
                <p>Dalam ritual ini, masyarakat bekerja sama untuk merayakan hubungan spiritual dan budaya mereka dengan laut. Kerja sama tim dan partisipasi masyarakat sangat penting dalam menjaga kelangsungan tradisi ini.</p>
                <p>Studi ilmiah menunjukkan bahwa tradisi budaya seperti Nadran dapat berdampak positif terhadap lingkungan. Nilai-nilai syukur dan penghormatan terhadap alam yang terkandung dalam Nadran dapat mendorong perilaku penangkapan ikan yang lebih bertanggung jawab dan berkelanjutan.</p>
                <p>Faktor-faktor seperti intensitas penangkapan ikan, kesadaran masyarakat, pengelolaan limbah pesisir, dan upaya konservasi sangat menentukan keberlanjutan ekosistem laut dalam jangka panjang.</p>
              </> : <>
                <p>Nadran is a traditional ritual practiced by coastal communities in Cirebon as an expression of gratitude for abundant marine resources and a prayer for the safety of fishermen at sea.</p>
                <p>In this ritual, the community works together to celebrate their spiritual and cultural relationship with the sea. Teamwork and community participation are essential for the continuity of this tradition.</p>
                <p>Scientific studies show that cultural traditions like Nadran can have a positive impact on the environment. The values of gratitude and respect for nature found in Nadran can encourage more responsible and sustainable fishing behavior.</p>
                <p>Factors such as fishing intensity, community awareness, coastal waste management, and conservation efforts are crucial in determining the long-term sustainability of the marine ecosystem.</p>
              </>}
            </>}

            {/* UNIT 8 */}
            {selectedUnit === 8 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Industri Kerajinan Rotan: Panen Berkelanjutan dan Pengelolaan Limbah" : "Rattan Craft Industry: Sustainable Harvesting and Waste Management"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Sumber Daya Hutan & Keberlanjutan" : "Theme: Forest Resources & Sustainability"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Rotan merupakan hasil hutan bukan kayu yang dipanen dari ekosistem hutan. Pemanenan rotan secara berkelanjutan dapat mendukung mata pencaharian masyarakat lokal sekaligus menjaga keanekaragaman hayati hutan dan keseimbangan ekologi jika dikelola dengan baik." : "Rattan is a non-timber forest product harvested from forest ecosystems. Sustainable rattan harvesting supports local livelihoods while maintaining forest biodiversity and ecological balance when managed responsibly."}
                </p>
              </div>



              {isId ? <>
                <p>Di Cirebon, rotan digunakan untuk membuat furnitur dan kerajinan tangan. Rotan merupakan hasil hutan bukan kayu, yang berarti diambil dari ekosistem hutan tanpa menebang pohon secara langsung.</p>
                <p>Para peneliti tertarik pada bagaimana rotan dapat dipanen dan digunakan secara berkelanjutan. Pemanenan rotan secara berkelanjutan dapat mendukung mata pencaharian lokal sekaligus membantu menjaga keanekaragaman hayati hutan dan keseimbangan ekologi.</p>
                <p>Keberlanjutan bergantung pada tiga faktor utama: tingkat panen (seberapa banyak rotan yang diambil), upaya penanaman kembali (seberapa banyak tanaman baru ditanam setelah panen), dan pemanfaatan limbah (seberapa banyak sisa produksi yang digunakan kembali).</p>
                <p>Jika tingkat panen melebihi kemampuan regenerasi hutan, keanekaragaman hayati dapat menurun. Sebaliknya, penanaman kembali yang aktif dan pemanfaatan limbah yang tinggi dapat menjaga keseimbangan ekosistem sekaligus meningkatkan pendapatan lokal.</p>
              </> : <>
                <p>In Cirebon, rattan is used to make furniture and handicrafts. Rattan is a non-timber forest product, meaning it is taken from forest ecosystems without directly cutting down trees.</p>
                <p>Researchers are interested in how rattan can be harvested and used sustainably. Sustainable rattan harvesting can support local livelihoods while helping to maintain forest biodiversity and ecological balance.</p>
                <p>Sustainability depends on three key factors: harvest rate (how much rattan is taken), replanting effort (how many new plants are added after harvesting), and waste utilization (how much production waste is reused).</p>
                <p>If the harvest rate exceeds the forest's regeneration capacity, biodiversity can decline. Conversely, active replanting and high waste utilization can maintain ecosystem balance while increasing local income.</p>
              </>}
            </>}

            {/* UNIT 9 */}
            {selectedUnit === 9 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Batik Trusmi: Produksi Berkelanjutan dan Pengelolaan Limbah Cair" : "Batik Trusmi: Sustainable Production and Wastewater Management"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Industri & Lingkungan Perairan" : "Theme: Industry & Aquatic Environment"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId ? "Produksi batik melibatkan proses pewarnaan yang menggunakan air serta zat pewarna kimia atau alami. Tanpa pengolahan yang tepat, limbah cair dapat mencemari ekosistem perairan." : "Batik production involves dyeing processes that use water and chemical or natural dyes. Without proper treatment, wastewater can pollute aquatic ecosystems."}
                </p>
              </div>



              {isId ? <>
                <p>Batik Trusmi adalah salah satu industri batik tradisional yang paling terkenal di Cirebon. Produksi batik penting bagi budaya lokal dan menyediakan lapangan kerja serta pendapatan bagi masyarakat.</p>
                <p>Namun, produksi batik juga menggunakan air dan pewarna dalam jumlah besar. Selama proses pewarnaan dan pencucian, limbah cair dapat mengandung sisa pewarna, lilin, senyawa organik, dan logam berat yang berbahaya bagi ekosistem perairan.</p>
                <p>Pewarna sintetis mengandung bahan kimia persisten yang sulit terurai, sementara pewarna alami tetap dapat menambah limbah organik ke air jika digunakan dalam jumlah besar tanpa pengolahan. Pengolahan limbah yang tepat — baik sebagian maupun penuh — sangat penting untuk melindungi kualitas air sungai.</p>
                <p>Keseimbangan antara keberlanjutan lingkungan dan kelayakan produksi menjadi tantangan utama industri batik. Penggunaan air yang lebih rendah, jenis pewarna yang lebih aman, dan sistem pengolahan limbah yang efektif dapat mengurangi dampak lingkungan tanpa mengorbankan produksi.</p>
              </> : <>
                <p>Batik Trusmi is one of the best-known traditional batik industries in Cirebon. Batik production is important for local culture and provides jobs and income for the community.</p>
                <p>However, batik production also uses large amounts of water and dyes. During dyeing and washing, wastewater can contain leftover dyes, wax, organic compounds, and heavy metals that are harmful to aquatic ecosystems.</p>
                <p>Synthetic dyes contain persistent chemicals that are difficult to break down, while natural dyes can still add organic waste to water if used in large quantities without treatment. Proper wastewater treatment — whether partial or full — is essential to protect river water quality.</p>
                <p>Balancing environmental sustainability with production feasibility is the main challenge for the batik industry. Lower water use, safer dye types, and effective treatment systems can reduce environmental impact without sacrificing production.</p>
              </>}
            </>}

            {/* UNIT 10 */}
            {selectedUnit === 10 && <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-normal text-foreground leading-tight mb-3">
                  {isId ? "Tahu Gejrot: Sistem Pangan Lokal Berkelanjutan" : "Tahu Gejrot: Sustainable Local Food Systems"}
                </h1>
                <span className="px-2.5 py-1.5 bg-muted/80 rounded-md font-medium text-xs text-muted-foreground">{isId ? "Tema: Pangan & Keberlanjutan Lokal" : "Theme: Food & Local Sustainability"}</span>
              </div>
              <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-xl border border-primary/10">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-primary mb-2">{isId ? "Konteks" : "Context"}</p>
                <p className="text-[13px] leading-relaxed text-foreground/80 italic">
                  {isId
                    ? "Tahu gejrot menggunakan tahu sebagai sumber protein nabati, yang umumnya membutuhkan lebih sedikit sumber daya alam dan menghasilkan tekanan lingkungan yang lebih rendah dibandingkan banyak pangan berbasis hewani. Proses pembuatannya juga mencerminkan penggunaan bahan-bahan lokal yang tersedia serta pengolahan pangan skala kecil, sehingga mendukung sistem pangan lokal yang lebih berkelanjutan."
                    : "Tahu gejrot uses tofu as a plant-based protein source, which generally requires fewer natural resources and produces lower environmental pressure than many animal-based foods. Its preparation also reflects the use of locally available ingredients and small-scale food processing, supporting more sustainable local food systems."}
                </p>
              </div>



              {isId ? <>
                <p>Tahu gejrot adalah makanan tradisional khas Cirebon yang terbuat dari tahu goreng yang disajikan dengan kuah yang terdiri dari gula merah, cuka, bawang merah, bawang putih, dan cabai. Makanan ini biasanya disajikan dalam porsi kecil dengan menggunakan bahan-bahan lokal yang sederhana.</p>
                <p>Tahu merupakan sumber protein nabati. Dibandingkan dengan banyak makanan berbasis hewani, protein nabati umumnya menggunakan lebih sedikit sumber daya alam dan menghasilkan tekanan lingkungan yang lebih rendah.</p>
                <p>Namun, produksi tahu tetap dapat berdampak pada lingkungan. Proses pembuatan tahu menggunakan banyak air dan menghasilkan limbah cair yang kaya akan bahan organik. Jika limbah ini dibuang tanpa pengolahan, dapat meningkatkan BOD dan COD serta mencemari perairan.</p>
                <p>Siswa menyelidiki bagaimana sistem pangan lokal dapat dibuat lebih berkelanjutan dengan mengkaji sumber protein (nabati atau hewani), jarak bahan baku (lokal atau non-lokal), dan pengolahan limbah cair (tidak ada, sebagian, atau pengolahan penuh).</p>
              </> : <>
                <p>Tahu gejrot is a traditional Cirebon dish made from fried tofu served with a sauce of palm sugar, vinegar, shallot, garlic, and chili. It is usually served in small portions using simple local ingredients.</p>
                <p>Tofu is a plant-based protein. Compared with many animal-based foods, plant-based protein generally uses fewer natural resources and creates lower environmental pressure.</p>
                <p>However, tofu production can still affect the environment. Tofu processing uses large amounts of water and produces liquid waste rich in organic matter. If this waste is released without treatment, it can increase BOD and COD and pollute waterways.</p>
                <p>Students investigate how a local food system can be made more sustainable by examining protein source (plant-based or animal-based), ingredient distance (local or non-local), and wastewater treatment (none, partial, or full treatment).</p>
              </>}
            </>}

          </div>
        </div>

        {/* Right panel: tables */}
        <div className="w-[380px] shrink-0 overflow-y-auto exam-scrollbar px-6 py-8 bg-muted/20">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-foreground mb-4">
              {selectedUnit === 1 ? (isId ? "Perbandingan Kemasan" : "Packaging Comparison")
               : selectedUnit === 2 ? (isId ? "Perubahan Fermentasi" : "Fermentation Changes")
               : selectedUnit === 3 ? (isId ? "Perbandingan Wadah Masak" : "Cookware Comparison")
               : selectedUnit === 4 ? (isId ? "Perbandingan Media Goreng" : "Frying Media Comparison")
               : selectedUnit === 5 ? (isId ? "Perbandingan Kemasan Tape Ketan" : "Tape Ketan Packaging Comparison")
               : selectedUnit === 6 ? (isId ? "Fungsi Ekosistem Mangrove" : "Mangrove Ecosystem Functions")
               : selectedUnit === 7 ? (isId ? "Faktor Keberlanjutan Laut" : "Marine Sustainability Factors")
               : selectedUnit === 8 ? (isId ? "Faktor Keberlanjutan Rotan" : "Rattan Sustainability Factors")
               : selectedUnit === 9 ? (isId ? "Perbandingan Produksi Batik" : "Batik Production Comparison")
               : (isId ? "Sistem Pangan Tahu Gejrot" : "Tahu Gejrot Food System")}
            </h2>

            <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-muted/50">
                    {selectedUnit === 1 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Jenis" : "Type"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Waktu Terurai" : "Decomposition"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Dampak Lingkungan" : "Env. Impact"}</th>
                    </>}
                    {selectedUnit === 2 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Parameter" : "Parameter"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Sebelum" : "Before"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Sesudah" : "After"}</th>
                    </>}
                    {selectedUnit === 3 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Aspek" : "Aspect"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Tanah Liat" : "Clay Pot"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Logam" : "Metal Pot"}</th>
                    </>}
                    {selectedUnit === 4 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Aspek" : "Aspect"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Pasir" : "Sand"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Minyak" : "Oil"}</th>
                    </>}
                    {selectedUnit === 5 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Kemasan" : "Packaging"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Biodegradable" : "Biodegradable"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Dampak Lingkungan" : "Env. Impact"}</th>
                    </>}
                    {selectedUnit === 6 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Fungsi" : "Function"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Mangrove Tinggi" : "High Mangrove"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Mangrove Rendah" : "Low Mangrove"}</th>
                    </>}
                    {selectedUnit === 7 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Faktor" : "Factor"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Dampak Utama" : "Direct Effect"}</th>
                    </>}
                    {selectedUnit === 8 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Indikator" : "Indicator"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Keberlanjutan Rendah" : "Low Sustainability"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Keberlanjutan Tinggi" : "High Sustainability"}</th>
                    </>}
                    {selectedUnit === 9 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Metode" : "Method"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Jenis Pewarna" : "Dye Type"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Pengolahan" : "Treatment"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Risiko Ekosistem" : "Eco Risk"}</th>
                    </>}
                    {selectedUnit === 10 && <>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Pilihan Desain" : "Design Choice"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Tekanan Lingkungan" : "Env. Pressure"}</th>
                      <th className="text-left py-3 px-3 font-semibold border-b">{isId ? "Keberlanjutan" : "Sustainability"}</th>
                    </>}
                  </tr>
                </thead>
                <tbody className="text-foreground/80">
                  {selectedUnit === 1 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Daun jati" : "Teak leaf"}</td><td className="py-3 px-3">{isId ? "14–28 hari" : "14–28 days"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Kertas" : "Paper"}</td><td className="py-3 px-3">{isId ? "60–150 hari" : "60–150 days"}</td><td className="py-3 px-3 text-amber-700">{isId ? "Sedang" : "Medium"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Plastik" : "Plastic"}</td><td className="py-3 px-3">{isId ? "100–500 tahun" : "100–500 years"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tinggi" : "High"}</td></tr>
                  </>}
                  {selectedUnit === 2 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Bakteri Berbahaya" : "Harmful Bacteria"}</td><td className="py-3 px-3">{isId ? "Tinggi (Vibrio)" : "High (Vibrio)"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Bakteri Baik" : "Beneficial Bacteria"}</td><td className="py-3 px-3">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Asam Glutamat" : "Glutamic Acid"}</td><td className="py-3 px-3">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Rasa Umami" : "Umami Taste"}</td><td className="py-3 px-3">{isId ? "Tidak ada" : "None"}</td><td className="py-3 px-3 text-green-700">{isId ? "Kuat" : "Strong"}</td></tr>
                  </>}
                  {selectedUnit === 3 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Retensi Panas" : "Heat Retention"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td><td className="py-3 px-3 text-amber-700">{isId ? "Rendah" : "Low"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Efisiensi Energi" : "Energy Efficiency"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td><td className="py-3 px-3 text-red-700">{isId ? "Rendah" : "Low"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Dampak Lingkungan" : "Env. Impact"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Waktu Memasak" : "Cooking Time"}</td><td className="py-3 px-3">{isId ? "Lebih lama" : "Longer"}</td><td className="py-3 px-3">{isId ? "Lebih cepat" : "Faster"}</td></tr>
                  </>}
                  {selectedUnit === 4 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Penyerapan Minyak" : "Oil Absorption"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Dapat Digunakan Ulang" : "Reusable"}</td><td className="py-3 px-3 text-green-700">{isId ? "Ya" : "Yes"}</td><td className="py-3 px-3 text-amber-700">{isId ? "Terbatas" : "Limited"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Kandungan Lemak" : "Fat Content"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Keberlanjutan" : "Sustainability"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td><td className="py-3 px-3 text-amber-700">{isId ? "Sedang" : "Medium"}</td></tr>
                  </>}
                  {selectedUnit === 5 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Daun pisang" : "Banana leaf"}</td><td className="py-3 px-3 text-green-700">{isId ? "Ya" : "Yes"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Plastik" : "Plastic"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tidak" : "No"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Daun lainnya" : "Other leaves"}</td><td className="py-3 px-3 text-green-700">{isId ? "Ya" : "Yes"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td></tr>
                  </>}
                  {selectedUnit === 6 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Abrasi Pantai" : "Coastal Erosion"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Risiko Banjir" : "Flood Risk"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Produksi Ikan" : "Fish Production"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td><td className="py-3 px-3 text-red-700">{isId ? "Rendah" : "Low"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Penyimpanan Karbon" : "Carbon Storage"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td><td className="py-3 px-3 text-red-700">{isId ? "Rendah" : "Low"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Keanekaragaman Hayati" : "Biodiversity"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td><td className="py-3 px-3 text-red-700">{isId ? "Rendah" : "Low"}</td></tr>
                  </>}
                  {selectedUnit === 7 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Intensitas Tangkapan Tinggi" : "High Fishing Intensity"}</td><td className="py-3 px-3 text-red-700">{isId ? "Populasi Ikan Menurun" : "Fish Population Decline"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Kesadaran Masyarakat Tinggi" : "High Community Awareness"}</td><td className="py-3 px-3 text-green-700">{isId ? "Perilaku Bijak" : "Responsible Behavior"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Pengelolaan Limbah Baik" : "Good Waste Management"}</td><td className="py-3 px-3 text-green-700">{isId ? "Kualitas Air Meningkat" : "Better Water Quality"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Upaya Konservasi Kuat" : "Strong Conservation"}</td><td className="py-3 px-3 text-green-700">{isId ? "Biodiversitas Meningkat" : "Increased Biodiversity"}</td></tr>
                  </>}
                  {selectedUnit === 8 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Tingkat Panen" : "Harvest Rate"}</td><td className="py-3 px-3">{isId ? "Sangat Tinggi" : "Very High"}</td><td className="py-3 px-3">{isId ? "Seimbang" : "Balanced"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Penanaman Kembali" : "Replanting"}</td><td className="py-3 px-3">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Pemanfaatan Limbah" : "Waste Utilization"}</td><td className="py-3 px-3">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Keanekaragaman Hayati" : "Biodiversity"}</td><td className="py-3 px-3">{isId ? "Menurun" : "Declining"}</td><td className="py-3 px-3">{isId ? "Terjaga" : "Maintained"}</td></tr>
                  </>}
                  {selectedUnit === 9 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">A</td><td className="py-3 px-3">{isId ? "Sintetis" : "Synthetic"}</td><td className="py-3 px-3">{isId ? "Tidak Ada" : "None"}</td><td className="py-3 px-3">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">B</td><td className="py-3 px-3">{isId ? "Alami" : "Natural"}</td><td className="py-3 px-3">{isId ? "Tidak Ada" : "None"}</td><td className="py-3 px-3">{isId ? "Sedang" : "Medium"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">C</td><td className="py-3 px-3">{isId ? "Sintetis" : "Synthetic"}</td><td className="py-3 px-3">{isId ? "Sebagian" : "Partial"}</td><td className="py-3 px-3">{isId ? "Sedang" : "Medium"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">D</td><td className="py-3 px-3">{isId ? "Alami" : "Natural"}</td><td className="py-3 px-3">{isId ? "Penuh" : "Full"}</td><td className="py-3 px-3">{isId ? "Rendah" : "Low"}</td></tr>
                  </>}
                  {selectedUnit === 10 && <>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Protein nabati, lokal, pengolahan penuh" : "Plant-based, local, full treatment"}</td><td className="py-3 px-3 text-green-700">{isId ? "Rendah" : "Low"}</td><td className="py-3 px-3 text-green-700">{isId ? "Tinggi" : "High"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Protein nabati, lokal, tanpa pengolahan" : "Plant-based, local, no treatment"}</td><td className="py-3 px-3 text-amber-700">{isId ? "Sedang" : "Medium"}</td><td className="py-3 px-3 text-amber-700">{isId ? "Sedang" : "Medium"}</td></tr>
                    <tr className="border-b border-border/60"><td className="py-3 px-3 font-medium">{isId ? "Protein hewani, non-lokal, tanpa pengolahan" : "Animal-based, non-local, no treatment"}</td><td className="py-3 px-3 text-red-700">{isId ? "Tinggi" : "High"}</td><td className="py-3 px-3 text-red-700">{isId ? "Rendah" : "Low"}</td></tr>
                    <tr><td className="py-3 px-3 font-medium">{isId ? "Protein hewani, lokal, pengolahan penuh" : "Animal-based, local, full treatment"}</td><td className="py-3 px-3 text-amber-700">{isId ? "Sedang" : "Medium"}</td><td className="py-3 px-3 text-amber-700">{isId ? "Sedang" : "Medium"}</td></tr>
                  </>}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-accent/30 rounded-lg border border-accent/50">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-accent-foreground mb-2">{isId ? "Poin Penting" : "Key Takeaways"}</p>
              <ul className="text-[12px] leading-relaxed text-foreground/80 space-y-1.5">
                {selectedUnit === 1 && <>
                  <li>• {isId ? "Daun jati terurai dalam 14–28 hari" : "Teak leaves decompose in 14–28 days"}</li>
                  <li>• {isId ? "Plastik butuh 100–500 tahun terurai" : "Plastic takes 100–500 years to decompose"}</li>
                  <li>• {isId ? "Tradisi bisa jadi model keberlanjutan" : "Tradition can be a sustainability model"}</li>
                </>}
                {selectedUnit === 2 && <>
                  <li>• {isId ? "Fermentasi mengurangi bakteri berbahaya" : "Fermentation reduces harmful bacteria"}</li>
                  <li>• {isId ? "Bakteri baik meningkat selama fermentasi" : "Beneficial bacteria increase during fermentation"}</li>
                  <li>• {isId ? "Asam glutamat meningkat → rasa umami" : "Glutamic acid increases → umami taste"}</li>
                  <li>• {isId ? "Keberlanjutan bergantung pada ekosistem laut" : "Sustainability depends on marine ecosystems"}</li>
                </>}
                {selectedUnit === 3 && <>
                  <li>• {isId ? "Tanah liat menahan panas lebih baik dari logam" : "Clay retains heat better than metal"}</li>
                  <li>• {isId ? "Efisiensi energi lebih tinggi dengan tanah liat" : "Higher energy efficiency with clay pots"}</li>
                  <li>• {isId ? "Tanah liat ramah lingkungan dan dapat terurai" : "Clay is eco-friendly and biodegradable"}</li>
                </>}
                {selectedUnit === 4 && <>
                  <li>• {isId ? "Pasir dapat digunakan ulang berkali-kali" : "Sand can be reused many times"}</li>
                  <li>• {isId ? "Penyerapan minyak lebih rendah dengan pasir" : "Lower oil absorption with sand frying"}</li>
                  <li>• {isId ? "Lebih sehat dan berkelanjutan dari goreng minyak" : "Healthier and more sustainable than oil frying"}</li>
                </>}
                {selectedUnit === 5 && <>
                  <li>• {isId ? "Fermentasi optimal pada 25–30°C selama 24–48 jam" : "Optimal fermentation at 25–30°C for 24–48 hours"}</li>
                  <li>• {isId ? "Daun pisang biodegradable, plastik tidak" : "Banana leaves are biodegradable, plastic is not"}</li>
                  <li>• {isId ? "Fermentasi memperpanjang masa simpan produk" : "Fermentation extends product shelf life"}</li>
                </>}
                {selectedUnit === 6 && <>
                  <li>• {isId ? "Mangrove mengurangi abrasi dan risiko banjir" : "Mangroves reduce erosion and flood risk"}</li>
                  <li>• {isId ? "Tutupan mangrove tinggi → produksi ikan tinggi" : "High mangrove cover → high fish production"}</li>
                  <li>• {isId ? "Mangrove adalah penyerap karbon yang efisien" : "Mangroves are efficient carbon sinks"}</li>
                  <li>• {isId ? "Konservasi mangrove penting untuk keberlanjutan pesisir" : "Mangrove conservation is vital for coastal sustainability"}</li>
                </>}
                {selectedUnit === 7 && <>
                  <li>• {isId ? "Tradisi mendorong kesadaran ekologis" : "Tradition encourages ecological awareness"}</li>
                  <li>• {isId ? "Penangkapan ikan harus dilakukan dengan bijak" : "Fishing must be done responsibly"}</li>
                  <li>• {isId ? "Pengelolaan limbah menjaga kualitas air" : "Waste management preserves water quality"}</li>
                  <li>• {isId ? "Konservasi melindungi biodiversitas laut" : "Conservation protects marine biodiversity"}</li>
                </>}
                {selectedUnit === 8 && <>
                  <li>• {isId ? "Panen berlebihan menurunkan keanekaragaman hayati hutan" : "Over-harvesting reduces forest biodiversity"}</li>
                  <li>• {isId ? "Penanaman kembali menjaga pasokan rotan jangka panjang" : "Replanting maintains long-term rattan supply"}</li>
                  <li>• {isId ? "Pemanfaatan limbah mengurangi polusi dan meningkatkan pendapatan" : "Waste utilization reduces pollution and boosts income"}</li>
                </>}
                {selectedUnit === 9 && <>
                  <li>• {isId ? "Pewarna alami tetap mencemari jika tidak diolah" : "Natural dyes still pollute if untreated"}</li>
                  <li>• {isId ? "Pengolahan penuh memberikan kualitas air terbaik" : "Full treatment gives the best water quality"}</li>
                  <li>• {isId ? "Keseimbangan ekonomi dan lingkungan adalah kunci keberlanjutan" : "Balancing economy and environment is key to sustainability"}</li>
                </>}
                {selectedUnit === 10 && <>
                  <li>• {isId ? "Protein nabati umumnya membutuhkan lebih sedikit sumber daya" : "Plant-based protein generally requires fewer resources"}</li>
                  <li>• {isId ? "Bahan lokal mendukung rantai pasok pendek dan produsen lokal" : "Local ingredients support short supply chains and local producers"}</li>
                  <li>• {isId ? "Limbah tahu tanpa pengolahan meningkatkan BOD dan COD" : "Untreated tofu wastewater increases BOD and COD"}</li>
                  <li>• {isId ? "Pengolahan limbah penuh memberikan risiko pencemaran paling rendah" : "Full wastewater treatment gives the lowest pollution risk"}</li>
                </>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-border/60 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {isId ? "Bacaan selesai? Mulai quiz sekarang." : "Finished reading? Start the quiz now."}
          </div>
          <button
            onClick={() => navigate("/quiz")}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 hover:opacity-90 flex items-center gap-2"
          >
            {isId ? "Mulai Quiz" : "Start Quiz"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Learn;
