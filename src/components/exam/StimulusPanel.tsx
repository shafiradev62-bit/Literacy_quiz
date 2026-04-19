import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUnitStimulus } from "@/data/appContent";

interface StimulusPanelProps {
  unit?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  imageUrl?: string;
  videoUrl?: string;
  images?: string[]; // Multiple images support
  videos?: string[]; // Multiple videos support
}

const StimulusPanel = ({ unit = 2, imageUrl, videoUrl, images = [], videos = [] }: StimulusPanelProps) => {
  const { lang } = useLanguage();
  const [tab, setTab] = useState<"en" | "id">("en");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const dynamicStimulus = getUnitStimulus(unit);
  const isDynamic = dynamicStimulus && (dynamicStimulus.titleEn || dynamicStimulus.introductionEn);

  // Combine old and new media props
  const allImages = [imageUrl, ...images].filter(Boolean) as string[];
  const allVideos = [videoUrl, ...videos].filter(Boolean) as string[];
  const hasMedia = allImages.length > 0 || allVideos.length > 0;

  const unitStyles = {
    1: "bg-emerald-50/70 border-emerald-100",
    2: "bg-blue-50/70 border-blue-100",
    3: "bg-amber-50/70 border-amber-100",
    4: "bg-orange-50/70 border-orange-100",
    5: "bg-lime-50/70 border-lime-100",
    6: "bg-teal-50/70 border-teal-100",
    7: "bg-cyan-50/70 border-cyan-100",
    8: "bg-emerald-100 border-emerald-200",
    9: "bg-indigo-50 border-indigo-100",
    10: "bg-slate-100 border-slate-200",
  }[unit] || "bg-muted/30";

  return (
    <div className={`h-full flex flex-col overflow-hidden ${unitStyles} transition-colors duration-500`}>
      <div className="shrink-0 flex border-b border-border/50 bg-muted/30 px-4 pt-3 gap-1">
        <button onClick={() => setTab("en")} className={`px-3 py-1.5 text-[11px] font-medium rounded-t-md transition-all ${tab === "en" ? "bg-white border border-b-white border-border/50 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Bahasa Inggris (English)
        </button>
        <button onClick={() => setTab("id")} className={`px-3 py-1.5 text-[11px] font-medium rounded-t-md transition-all ${tab === "id" ? "bg-white border border-b-white border-border/50 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          Bahasa Indonesia (Indonesian)
        </button>
      </div>
      <div className="flex-1 overflow-y-auto exam-scrollbar px-5 py-5">
        {/* Media Gallery */}
        {hasMedia && (
          <div className="mb-6 space-y-3">
            {/* Main Media Display */}
            {selectedMedia ? (
              <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/10 shadow-sm relative group">
                {mediaType === "video" ? (
                  <video
                    src={selectedMedia}
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full aspect-video object-cover"
                    onEnded={() => setVideoWatched(true)}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src={selectedMedia} alt="Stimulus" className="w-full h-auto object-cover max-h-[400px] cursor-zoom-in" onClick={() => window.open(selectedMedia, '_blank')} />
                )}
                <button
                  onClick={() => { setSelectedMedia(null); setMediaType(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : allImages.length > 0 ? (
              <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/10 shadow-sm">
                <img src={allImages[0]} alt="Stimulus" className="w-full h-auto object-cover max-h-[300px] cursor-zoom-in" onClick={() => { setSelectedMedia(allImages[0]); setMediaType("image"); }} />
              </div>
            ) : allVideos.length > 0 ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <button
                  onClick={() => { setSelectedMedia(allVideos[0]); setMediaType("video"); }}
                  className="flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all text-lg font-medium shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  {lang === "id" ? "Tonton Video (Watch Video)" : "Watch Video (Tonton Video)"}
                </button>
                {videoWatched && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    {lang === "id" ? "Video selesai ditonton" : "Video watched"}
                  </div>
                )}
              </div>
            ) : null}

            {/* Media Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={`img-${idx}`}
                    onClick={() => { setSelectedMedia(img); setMediaType("image"); }}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-105"
                  >
                    <img src={img} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isDynamic ? (
          <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl animate-in fade-in duration-500">
             <h1 className="font-display text-lg font-normal text-foreground leading-tight">
               {tab === "en" ? dynamicStimulus.titleEn : dynamicStimulus.titleId}
             </h1>
             <div className="whitespace-pre-wrap">
               {tab === "en" ? dynamicStimulus.introductionEn : dynamicStimulus.introductionId}
             </div>
          </div>
        ) : (
          <>
            {unit === 1 ? (tab === "en" ? <Unit1En /> : <Unit1Id />)
              : unit === 2 ? (tab === "en" ? <Unit2En /> : <Unit2Id />)
              : unit === 3 ? (tab === "en" ? <Unit3En /> : <Unit3Id />)
              : unit === 4 ? (tab === "en" ? <Unit4En /> : <Unit4Id />)
              : unit === 5 ? (tab === "en" ? <Unit5En /> : <Unit5Id />)
              : unit === 6 ? (tab === "en" ? <Unit6En /> : <Unit6Id />)
              : (tab === "en" ? <Unit7En /> : <Unit7Id />)}
          </>
        )}
      </div>
    </div>
  );
};

const Unit1En = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Nasi Jamblang (Teak Leaf Food Packaging)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Theme</p>
      <p className="text-[12px] italic text-foreground/80">Nasi Jamblang traditionally uses teak leaves as natural food packaging. Teak leaves are biodegradable and decompose naturally in the environment, reducing plastic waste.</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Nasi Jamblang: Tradition or Sustainable Solution?</h1>
    <p>Food plays an important role in human life, not only as a source of energy but also as part of culture and environmental sustainability. One traditional Indonesian dish is Nasi Jamblang from Cirebon.</p>
    <p>Nasi Jamblang originated during the colonial period when workers needed practical and durable food. To meet this need, rice was wrapped in teak leaves (<em>Tectona grandis</em>). These leaves are strong and resistant to tearing. In addition, teak leaves have natural pores that allow air circulation, helping to preserve food quality over time.</p>
    <p>Today, some vendors use plastic packaging because it is more practical and cheaper. However, plastic has significant environmental impacts because it is difficult to decompose. In contrast, teak leaves are natural and biodegradable, making them more environmentally friendly.</p>
    <p>Meanwhile, studies show that in the culinary business, price significantly influences customer satisfaction. In Nasi Jamblang businesses, price has a strong effect on customer satisfaction, with a coefficient value of 0.77.</p>
    <p>A student named Rani becomes interested in understanding whether the use of teak leaves as packaging is still relevant in modern times when viewed from scientific, environmental, and economic perspectives.</p>
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-2">Table 1. Comparison of Packaging Characteristics</p>
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-muted/40">
              <th className="p-2 text-left font-semibold border-b">Packaging Type</th>
              <th className="p-2 text-left font-semibold border-b">Physical Properties</th>
              <th className="p-2 text-left font-semibold border-b">Food Preservation</th>
              <th className="p-2 text-left font-semibold border-b">Decomposition Time</th>
              <th className="p-2 text-left font-semibold border-b">Env. Impact</th>
              <th className="p-2 text-left font-semibold border-b">Source</th>
            </tr>
          </thead>
          <tbody className="text-foreground/80">
            <tr className="border-b border-border/40"><td className="p-2 font-medium">Teak leaf</td><td className="p-2">Strong, porous, tear-resistant</td><td className="p-2">High (maintains moisture, prevents spoilage)</td><td className="p-2">~14–28 days</td><td className="p-2 text-green-700">Low (biodegradable)</td><td className="p-2 text-[10px] text-muted-foreground">KLHK</td></tr>
            <tr className="border-b border-border/40"><td className="p-2 font-medium">Paper</td><td className="p-2">Moderately strong, absorbent</td><td className="p-2">Medium</td><td className="p-2">~60–150 days</td><td className="p-2 text-amber-700">Medium</td><td className="p-2 text-[10px] text-muted-foreground">U.S. EPA</td></tr>
            <tr><td className="p-2 font-medium">Plastic</td><td className="p-2">Strong, airtight</td><td className="p-2">High</td><td className="p-2">~100–500 years</td><td className="p-2 text-red-700">High (non-biodegradable)</td><td className="p-2 text-[10px] text-muted-foreground">NOAA; UNEP</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const Unit1Id = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Nasi Jamblang (Kemasan Makanan Daun Jati)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Tema (Theme)</p>
      <p className="text-[12px] italic text-foreground/80">Nasi Jamblang secara tradisional menggunakan daun jati sebagai pembungkus makanan alami. Daun jati bersifat biodegradable dan terurai secara alami di lingkungan, sehingga mengurangi limbah plastik. (Nasi Jamblang traditionally uses teak leaves as natural food packaging. Teak leaves are biodegradable and decompose naturally in the environment, reducing plastic waste.)</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Nasi Jamblang: Tradisi atau Solusi Berkelanjutan? (Nasi Jamblang: Tradition or Sustainable Solution?)</h1>
    <p>Makanan merupakan bagian penting dari kehidupan manusia, tidak hanya sebagai sumber energi tetapi juga sebagai bagian dari budaya dan lingkungan. Salah satu makanan khas Indonesia adalah Nasi Jamblang dari Cirebon.</p>
    <p>Nasi Jamblang mulai dikenal sejak masa kolonial, ketika para pekerja membutuhkan makanan yang praktis dan tahan lama untuk dibawa ke tempat kerja. Untuk memenuhi kebutuhan tersebut, nasi dibungkus menggunakan daun jati (<em>Tectona grandis</em>). Daun ini dipilih karena memiliki tekstur yang kuat dan tidak mudah robek. Selain itu, daun jati memiliki struktur berpori yang memungkinkan sirkulasi udara, sehingga nasi tetap dalam kondisi baik meskipun disimpan dalam waktu lama.</p>
    <p>Saat ini, beberapa pedagang mulai beralih menggunakan plastik sebagai kemasan karena dianggap lebih praktis dan murah. Namun, plastik memiliki dampak lingkungan yang besar karena sulit terurai di alam. Sebaliknya, daun jati merupakan bahan alami yang dapat terurai dengan cepat dan lebih ramah lingkungan.</p>
    <p>Di sisi lain, penelitian menunjukkan bahwa dalam bisnis kuliner, faktor harga memiliki pengaruh penting terhadap kepuasan pelanggan. Pada usaha Nasi Jamblang di Cirebon, harga memiliki pengaruh signifikan terhadap kepuasan pelanggan dengan nilai koefisien sebesar 0,77, yang menunjukkan hubungan yang kuat antara harga dan kepuasan.</p>
    <p>Seorang siswa bernama Rani tertarik untuk memahami apakah penggunaan daun jati sebagai kemasan masih relevan di era modern, jika dilihat dari aspek ilmiah, lingkungan, dan ekonomi.</p>
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-2">Tabel 1. Perbandingan Karakteristik Kemasan (Table 1. Comparison of Packaging Characteristics)</p>
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-muted/40">
              <th className="p-2 text-left font-semibold border-b">Jenis Kemasan</th>
              <th className="p-2 text-left font-semibold border-b">Sifat Fisik</th>
              <th className="p-2 text-left font-semibold border-b">Menjaga Kualitas</th>
              <th className="p-2 text-left font-semibold border-b">Waktu Terurai</th>
              <th className="p-2 text-left font-semibold border-b">Dampak Lingkungan</th>
              <th className="p-2 text-left font-semibold border-b">Sumber Data</th>
            </tr>
          </thead>
          <tbody className="text-foreground/80">
            <tr className="border-b border-border/40"><td className="p-2 font-medium">Daun jati</td><td className="p-2">Kuat, berpori, tidak mudah robek</td><td className="p-2">Tinggi (menjaga kelembaban & tidak cepat basi)</td><td className="p-2">±14–28 hari</td><td className="p-2 text-green-700">Rendah (biodegradable)</td><td className="p-2 text-[10px] text-muted-foreground">KLHK</td></tr>
            <tr className="border-b border-border/40"><td className="p-2 font-medium">Kertas</td><td className="p-2">Cukup kuat, menyerap air</td><td className="p-2">Sedang</td><td className="p-2">±60–150 hari</td><td className="p-2 text-amber-700">Sedang</td><td className="p-2 text-[10px] text-muted-foreground">U.S. EPA</td></tr>
            <tr><td className="p-2 font-medium">Plastik</td><td className="p-2">Kuat, kedap udara</td><td className="p-2">Tinggi (kedap udara)</td><td className="p-2">±100–500 tahun</td><td className="p-2 text-red-700">Tinggi (tidak biodegradable)</td><td className="p-2 text-[10px] text-muted-foreground">NOAA; UNEP</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const Unit2En = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Shrimp Paste Production (Terasi Cirebon)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Theme</p>
      <p className="text-[12px] italic text-foreground/80">Shrimp paste is produced from rebon shrimp harvested from coastal marine ecosystems. Its production depends on the sustainability of shrimp populations and healthy marine ecosystems.</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Terasi Cirebon: Tradition, Science, and Sustainability</h1>
    <p>Terasi is a traditional Indonesian fermented shrimp paste widely used as a flavor enhancer. In Cirebon, it's made from rebon shrimp harvested from coastal marine ecosystems.</p>
    <p>The process includes salting, grinding, drying, and fermentation. During fermentation, microorganisms break down proteins into amino acids such as glutamic acid, producing umami taste.</p>
    <p>Scientific studies show that fermentation significantly changes the microbial composition of terasi. Before fermentation, raw shrimp may contain various bacteria, including potentially harmful ones such as <em>Vibrio</em>. However, after fermentation, these harmful bacteria are reduced or eliminated, while beneficial bacteria become dominant. For example, certain bacteria such as <em>Bacilli</em> and <em>Staphylococcus</em> increase during fermentation, contributing to the development of flavor and preservation.</p>
    <p>Research also shows that fermentation increases important amino acids. In one study, glutamic acid levels increased significantly after fermentation. However, different processing methods can result in different microbial compositions and product quality.</p>
    <p>Fermentation conditions — salt level, drying time, and hygiene — are critical for ensuring safety and consistency. Poor hygiene and improper processing may lead to contamination by harmful bacteria such as <em>Salmonella</em>.</p>
    <p>Terasi production is also closely linked to environmental sustainability. The availability of rebon shrimp depends on healthy marine ecosystems. Overfishing or environmental degradation can reduce shrimp populations, affecting both biodiversity and local livelihoods.</p>
  </div>
);

const Unit2Id = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Produksi Terasi Cirebon</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Tema (Theme)</p>
      <p className="text-[12px] italic text-foreground/80">Terasi dibuat dari udang rebon yang ditangkap dari ekosistem laut pesisir. Produksinya bergantung pada keberlanjutan populasi udang dan kesehatan ekosistem laut. (Shrimp paste is produced from rebon shrimp harvested from coastal marine ecosystems. Its production depends on the sustainability of shrimp populations and healthy marine ecosystems.)</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Terasi Cirebon: Tradisi, Sains, dan Keberlanjutan (Terasi Cirebon: Tradition, Science, and Sustainability)</h1>
    <p>Terasi adalah produk fermentasi tradisional Indonesia yang banyak digunakan sebagai penyedap. Di Cirebon, terasi dibuat dari udang rebon yang ditangkap dari ekosistem laut pesisir.</p>
    <p>Proses pembuatan meliputi penggaraman, penghalusan, penjemuran, dan fermentasi. Selama fermentasi, mikroorganisme memecah protein menjadi asam amino seperti asam glutamat yang memberikan rasa umami khas.</p>
    <p>Penelitian ilmiah menunjukkan bahwa fermentasi menyebabkan perubahan signifikan pada komposisi mikroorganisme dalam terasi. Sebelum fermentasi, bahan baku udang dapat mengandung berbagai jenis bakteri, termasuk bakteri yang berpotensi berbahaya seperti <em>Vibrio</em>. Namun, setelah fermentasi, bakteri berbahaya tersebut berkurang atau bahkan hilang, sementara bakteri yang menguntungkan menjadi dominan. Sebagai contoh, bakteri seperti <em>Bacilli</em> dan <em>Staphylococcus</em> meningkat selama fermentasi dan berperan dalam pembentukan rasa serta proses pengawetan.</p>
    <p>Penelitian juga menunjukkan bahwa fermentasi meningkatkan kandungan asam amino penting. Dalam suatu studi, kadar asam glutamat meningkat secara signifikan setelah fermentasi. Namun, metode pengolahan yang berbeda dapat menghasilkan komposisi mikroba dan kualitas produk yang berbeda pula.</p>
    <p>Kondisi fermentasi — seperti kadar garam, lama penjemuran, dan tingkat kebersihan — sangat penting untuk menjamin keamanan dan konsistensi produk. Kebersihan yang kurang baik dapat menyebabkan kontaminasi oleh bakteri berbahaya seperti <em>Salmonella</em>.</p>
    <p>Produksi terasi juga berkaitan erat dengan keberlanjutan lingkungan. Ketersediaan udang rebon bergantung pada kesehatan ekosistem laut. Penangkapan berlebihan atau kerusakan lingkungan dapat mengurangi populasi udang, yang berdampak pada keanekaragaman hayati dan mata pencaharian masyarakat pesisir.</p>
  </div>
);

const Unit3En = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Empal Gentong (Clay Pot Cooking)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Theme</p>
      <p className="text-[12px] italic text-foreground/80">Empal Gentong is traditionally cooked in clay pots made from natural soil materials. Clay retains and distributes heat efficiently, reducing energy consumption during cooking.</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Empal Gentong: Tradition, Heat Science, and Sustainability</h1>
    <p>Empal Gentong is a traditional dish from Cirebon cooked using a clay pot (<em>gentong</em>) made from natural soil materials. Clay is a natural resource that can return to the environment without producing harmful waste, making it environmentally friendly.</p>
    <p>Scientific studies show that cooking materials significantly influence heat transfer, energy efficiency, and food quality. Clay pots are known for their ability to retain and distribute heat evenly, allowing food to cook more efficiently with less energy. In contrast, metal pots tend to lose heat more quickly, which may require higher energy input to maintain cooking temperature.</p>
    <p>Research also indicates that cooking conditions such as pot thickness, heat input, and water volume affect cooking performance. Thicker clay walls can improve heat retention, while excessive heat input may reduce efficiency and increase environmental impact. Additionally, the choice of cooking substrate—whether clay, metal, or stone—affects thermal conductivity, heat distribution, and energy consumption during cooking.</p>
    <p>Empal Gentong, which is cooked slowly over a fire, reflects a traditional practice that may be both energy-efficient and sustainable, depending on how it is prepared.</p>
    <p>In this simulation, you will investigate how different variables influence cooking efficiency and sustainability.</p>
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">How to run the simulation</p>
      <ol className="list-decimal pl-4 space-y-1 text-[12px] text-foreground/80">
        <li>Select pot type (clay or metal).</li>
        <li>Adjust wall thickness, heat input, and water volume.</li>
        <li>Click Record Data to save results.</li>
        <li>Use the data to answer the questions.</li>
      </ol>
    </div>
  </div>
);

const Unit3Id = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Empal Gentong (Memasak dengan Kuali Tanah Liat)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Tema (Theme)</p>
      <p className="text-[12px] italic text-foreground/80">Empal Gentong secara tradisional dimasak menggunakan gentong tanah liat. Tanah liat mampu menahan dan mendistribusikan panas secara efisien, sehingga mengurangi konsumsi energi saat memasak. (Empal Gentong is traditionally cooked in clay pots made from natural soil materials. Clay retains and distributes heat efficiently, reducing energy consumption during cooking.)</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Empal Gentong: Tradisi, Ilmu Panas, dan Keberlanjutan (Empal Gentong: Tradition, Heat Science, and Sustainability)</h1>
    <p>Empal Gentong adalah makanan tradisional khas Cirebon yang dimasak menggunakan gentong tanah liat yang terbuat dari bahan alami. Tanah liat merupakan sumber daya alam yang ramah lingkungan karena dapat kembali ke alam tanpa menghasilkan limbah berbahaya.</p>
    <p>Penelitian ilmiah menunjukkan bahwa bahan alat masak mempengaruhi perpindahan panas, efisiensi energi, dan kualitas makanan. Wadah tanah liat mampu menahan dan mendistribusikan panas secara merata, sehingga makanan dapat dimasak lebih efisien dengan energi yang lebih sedikit. Sebaliknya, panci logam cenderung kehilangan panas lebih cepat sehingga membutuhkan energi lebih besar.</p>
    <p>Penelitian juga menunjukkan bahwa kondisi memasak seperti ketebalan wadah, besar panas, dan volume air mempengaruhi hasil memasak. Dinding tanah liat yang lebih tebal dapat meningkatkan kemampuan menahan panas, sedangkan panas yang terlalu tinggi dapat menurunkan efisiensi dan meningkatkan dampak lingkungan. Selain itu, pemilihan substrat memasak—baik tanah liat, logam, maupun batu—memengaruhi konduktivitas panas, distribusi suhu, dan konsumsi energi selama memasak.</p>
    <p>Empal Gentong yang dimasak perlahan mencerminkan praktik tradisional yang berpotensi hemat energi dan berkelanjutan, tergantung pada cara memasaknya.</p>
    <p>Dalam simulasi ini, kamu akan menyelidiki bagaimana berbagai variabel mempengaruhi efisiensi dan keberlanjutan memasak.</p>
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">Cara menjalankan simulasi (How to run the simulation)</p>
      <ol className="list-decimal pl-4 space-y-1 text-[12px] text-foreground/80">
        <li>Pilih jenis wadah (tanah liat atau logam). (Select pot type (clay or metal).)</li>
        <li>Atur ketebalan dinding, besar panas, dan volume air. (Adjust wall thickness, heat input, and water volume.)</li>
        <li>Klik Record Data untuk menyimpan hasil. (Click Record Data to save results.)</li>
        <li>Gunakan data untuk menjawab pertanyaan. (Use the data to answer the questions.)</li>
      </ol>
    </div>
  </div>
);

const Unit4En = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Kerupuk Melarat (Sand-Frying Technique)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Theme</p>
      <p className="text-[12px] italic text-foreground/80">Kerupuk Melarat is fried using heated sand instead of cooking oil. This traditional technique reduces the need for large amounts of oil and allows the sand to be reused multiple times.</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Kerupuk Melarat: Sand-Frying and Sustainability</h1>
    <p>Kerupuk Melarat is a traditional cracker cooked using hot sand instead of oil. Sand acts as a heat-transfer medium and can be reused many times, while oil frying usually causes higher oil absorption in the food.</p>
    <p>Scientific studies show that frying involves heat transfer through direct contact between food and a heating medium. Different media, temperatures, and frying times affect oil absorption, crispiness, energy use, and sustainability.</p>
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">How to run the simulation</p>
      <ol className="list-decimal pl-4 space-y-1 text-[12px] text-foreground/80">
        <li>Select the frying medium.</li>
        <li>Adjust temperature and frying time.</li>
        <li>Choose whether the material is new or reused.</li>
        <li>Click Run to record the result in the table.</li>
        <li>Use the recorded data to answer the questions.</li>
      </ol>
    </div>
  </div>
);

const Unit4Id = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Kerupuk Melarat (Teknik Goreng Pasir)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Tema (Theme)</p>
      <p className="text-[12px] italic text-foreground/80">Kerupuk Melarat digoreng menggunakan pasir panas, bukan minyak. Teknik tradisional ini mengurangi kebutuhan minyak dalam jumlah besar dan memungkinkan pasir digunakan kembali berkali-kali. (Kerupuk Melarat is fried using heated sand instead of cooking oil. This traditional technique reduces the need for large amounts of oil and allows the sand to be reused multiple times.)</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Kerupuk Melarat: Goreng Pasir dan Keberlanjutan (Kerupuk Melarat: Sand-Frying and Sustainability)</h1>
    <p>Kerupuk Melarat adalah kerupuk tradisional yang dimasak menggunakan pasir panas, bukan minyak. Pasir berfungsi sebagai media penghantar panas dan dapat digunakan kembali berkali-kali.</p>
    <p>Studi ilmiah menunjukkan bahwa proses penggorengan melibatkan perpindahan panas melalui kontak langsung antara makanan dan media pemanas. Perbedaan media, suhu, dan waktu penggorengan memengaruhi penyerapan minyak, tingkat kerenyahan, penggunaan energi, serta keberlanjutan.</p>
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">Cara menjalankan simulasi (How to run the simulation)</p>
      <ol className="list-decimal pl-4 space-y-1 text-[12px] text-foreground/80">
        <li>Pilih media penggorengan. (Select the frying medium.)</li>
        <li>Atur suhu dan waktu penggorengan. (Adjust temperature and frying time.)</li>
        <li>Tentukan apakah bahan yang digunakan baru atau hasil penggunaan ulang. (Choose whether the material is new or reused.)</li>
        <li>Klik Run untuk mencatat hasil ke dalam tabel. (Click Run to record the result in the table.)</li>
        <li>Gunakan data yang tercatat untuk menjawab pertanyaan. (Use the recorded data to answer the questions.)</li>
      </ol>
    </div>
  </div>
);

const Unit5En = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Tape Ketan Bakung (Fermented Glutinous Rice with Leaf Packaging)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Theme</p>
      <p className="text-[12px] italic text-foreground/80">Tape Ketan Bakung is made from glutinous rice through a traditional fermentation process. The product is wrapped in natural leaves which are biodegradable and reduce plastic waste. Fermentation extends shelf life, reducing food waste and supporting sustainability in local food systems.</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Tape Ketan Bakung: Traditional Fermentation and Sustainable Packaging</h1>
    <p>Tape ketan is a traditional fermented glutinous rice product. Microorganisms in ragi break down starch into sugar, then convert part of the sugar into alcohol, acids, and aroma compounds.</p>
    <p>The fermentation process involves microbial activity (yeast and bacteria) that converts carbohydrates into simpler compounds. This reflects traditional biotechnology that is energy-efficient and environmentally friendly.</p>
    <p>Natural leaf packaging is biodegradable and can reduce plastic waste. Research shows that banana leaf packaging is often preferred and can influence product quality and microbial community composition.</p>
    <p>Good fermentation usually occurs around 25–30°C for about 24–48 hours. Over-fermentation can make the product too sour.</p>
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">How to run the simulation</p>
      <ol className="list-decimal pl-4 space-y-1 text-[12px] text-foreground/80">
        <li>Adjust fermentation time and temperature.</li>
        <li>Select packaging type and starter quality.</li>
        <li>Click Run to see the result and save a row in the table.</li>
        <li>Use the table to answer Questions 1–5.</li>
      </ol>
    </div>
  </div>
);

const Unit5Id = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Tape Ketan Bakung (Fermentasi Beras Ketan dengan Kemasan Daun)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Tema (Theme)</p>
      <p className="text-[12px] italic text-foreground/80">Tape Ketan Bakung dibuat dari beras ketan melalui proses fermentasi tradisional. Produk ini dibungkus dengan daun alami yang dapat terurai secara hayati dan mengurangi limbah plastik. Fermentasi memperpanjang masa simpan dan mendukung keberlanjutan sistem pangan lokal. (Tape Ketan Bakung is made from glutinous rice through a traditional fermentation process. The product is wrapped in natural leaves which are biodegradable and reduce plastic waste. Fermentation extends shelf life, reducing food waste and supporting sustainability in local food systems.)</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Tape Ketan Bakung: Fermentasi Tradisional dan Kemasan Berkelanjutan (Tape Ketan Bakung: Traditional Fermentation and Sustainable Packaging)</h1>
    <p>Tape ketan adalah produk tradisional hasil fermentasi beras ketan. Mikroorganisme dalam ragi menguraikan pati menjadi gula, kemudian mengubah sebagian gula tersebut menjadi alkohol, asam, dan senyawa aroma.</p>
    <p>Proses fermentasi melibatkan aktivitas mikroba (ragi dan bakteri) yang mengubah karbohidrat menjadi senyawa yang lebih sederhana. Hal ini mencerminkan bioteknologi tradisional yang hemat energi dan ramah lingkungan.</p>
    <p>Kemasan daun alami bersifat biodegradable dan dapat mengurangi limbah plastik. Penelitian menunjukkan bahwa kemasan daun pisang sering lebih disukai dan dapat memengaruhi kualitas produk.</p>
    <p>Fermentasi yang baik biasanya terjadi pada suhu sekitar 25–30°C selama kurang lebih 24–48 jam. Fermentasi yang berlebihan dapat membuat produk menjadi terlalu asam.</p>
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">Cara menjalankan simulasi (How to run the simulation)</p>
      <ol className="list-decimal pl-4 space-y-1 text-[12px] text-foreground/80">
        <li>Atur waktu dan suhu fermentasi. (Adjust fermentation time and temperature.)</li>
        <li>Pilih jenis kemasan dan kualitas starter (ragi). (Select packaging type and starter quality.)</li>
        <li>Klik Run untuk melihat hasil dan menyimpan satu baris pada tabel. (Click Run to see the result and save a row in the table.)</li>
        <li>Gunakan tabel tersebut untuk menjawab Pertanyaan 1–5. (Use the table to answer Questions 1–5.)</li>
      </ol>
    </div>
  </div>
);

const Unit6En = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Mangrove Ecosystem (Coastal Protection)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Theme</p>
      <p className="text-[12px] italic text-foreground/80">Mangrove forests serve as coastal protection against erosion, carbon sinks, and habitats for diverse species. They also support fisheries and maintain coastal ecosystem balance. Mangrove conservation is essential for biodiversity protection, climate change mitigation, and sustainable coastal ecosystems.</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Save the Coast</h1>
    <p>In coastal areas of Cirebon, some communities have reported that shoreline erosion has become more severe. Fish ponds, coastal roads, and some houses are increasingly affected by waves and flooding.</p>
    <p>One possible cause is the reduction of mangrove forests. Mangroves can reduce wave energy, trap sediment with their roots, provide habitat for fish and crabs, and store carbon. However, some people argue that erosion is caused only by strong waves or sea-level rise.</p>
    <p>In the next questions, you will use scientific ideas and an interactive simulation to investigate how mangroves may help protect the coast in Cirebon.</p>
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">Mangrove Ecosystem Simulation</p>
      <p className="text-[12px] text-foreground/80">Adjust variables, run the simulation, and record data.</p>
    </div>
  </div>
);

const Unit6Id = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Ekosistem Mangrove (Perlindungan Pesisir)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Tema (Theme)</p>
      <p className="text-[12px] italic text-foreground/80">Hutan mangrove berfungsi sebagai perlindungan pesisir dari erosi, penyerap karbon, serta habitat bagi berbagai spesies. Konservasi mangrove sangat penting untuk perlindungan keanekaragaman hayati, mitigasi perubahan iklim, dan keberlanjutan ekosistem pesisir. (Mangrove forests serve as coastal protection against erosion, carbon sinks, and habitats for diverse species. They also support fisheries and maintain coastal ecosystem balance. Mangrove conservation is essential for biodiversity protection, climate change mitigation, and sustainable coastal ecosystems.)</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">Selamatkan Pesisir (Save the Coast)</h1>
    <p>Di wilayah pesisir Cirebon, beberapa masyarakat melaporkan bahwa abrasi pantai menjadi semakin parah. Tambak ikan, jalan pesisir, dan beberapa rumah semakin terdampak oleh gelombang dan banjir.</p>
    <p>Salah satu kemungkinan penyebabnya adalah berkurangnya hutan mangrove. Mangrove dapat mengurangi energi gelombang, menjebak sedimen dengan akarnya, menyediakan habitat bagi ikan dan kepiting, serta menyimpan karbon.</p>
    <p>Pada pertanyaan berikutnya, kamu akan menggunakan konsep ilmiah dan simulasi interaktif untuk menyelidiki bagaimana mangrove dapat membantu melindungi pesisir di Cirebon.</p>
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">Simulasi Ekosistem Mangrove (Mangrove Ecosystem Simulation)</p>
      <p className="text-[12px] text-foreground/80">Atur variabel, jalankan simulasi, dan catat data. (Adjust variables, run the simulation, and record data.)</p>
    </div>
  </div>
);

const Unit7En = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Nadran (Sea Thanksgiving Ritual)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Theme</p>
      <p className="text-[12px] italic text-foreground/80">Nadran is a traditional ritual expressing gratitude for marine resources. The practice reflects the cultural relationship between coastal communities and the sea and may foster awareness about sustainable fishing practices and marine ecosystem conservation.</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">NADRAN IN CIREBON</h1>
    <p className="font-semibold">Nadran ritual, community cooperation, and the coastal ecosystem in Cirebon</p>
    <p>Nadran is a traditional ritual practiced by coastal communities in Cirebon as an expression of gratitude for marine resources and a prayer for safety at sea. It involves collective participation and reflects the close cultural relationship between fishermen and the sea.</p>
    <p>Studies about Nadran in Cirebon and nearby coastal regions show that the tradition contains values of gratitude, cooperation, cultural identity, and ecological awareness. Some researchers suggest that such traditions may help encourage responsible fishing behavior and marine ecosystem conservation.</p>
    <p>In this unit, you will investigate how fishing intensity, community awareness, waste management, and conservation efforts may influence marine sustainability. You will use an interactive simulation to explore the system.</p>
    
    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">Marine Sustainability Simulation</p>
      <p className="text-[12px] text-foreground/80">Adjust variables and observe how they affect the marine ecosystem. Record your data to analyze the system.</p>
    </div>
  </div>
);

const Unit7Id = () => (
  <div className="space-y-4 text-[13px] leading-[1.75] text-foreground/85 max-w-xl">
    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Nadran (Ritual Syukuran Laut)</p>
    <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/30 rounded-lg border border-primary/10">
      <p className="text-[11px] font-semibold uppercase text-primary mb-1">Tema (Theme)</p>
      <p className="text-[12px] italic text-foreground/80">Nadran merupakan ritual tradisional sebagai ungkapan rasa syukur atas sumber daya laut. Praktik ini mencerminkan hubungan budaya antara masyarakat pesisir dan laut, serta dapat meningkatkan kesadaran terhadap praktik perikanan berkelanjutan dan konservasi ekosistem laut. (Nadran is a traditional ritual expressing gratitude for marine resources. The practice reflects the cultural relationship between coastal communities and the sea and may foster awareness about sustainable fishing practices and marine ecosystem conservation.)</p>
    </div>
    <h1 className="font-display text-lg font-normal text-foreground leading-tight">NADRAN DI CIREBON (NADRAN IN CIREBON)</h1>
    <p className="font-semibold">Ritual nadran, kerja sama masyarakat, dan ekosistem pesisir di Cirebon (Nadran ritual, community cooperation, and the coastal ecosystem in Cirebon)</p>
    <p>Nadran adalah ritual tradisional yang dipraktikkan oleh masyarakat pesisir di Cirebon sebagai ungkapan rasa syukur atas sumber daya laut dan doa untuk keselamatan di laut. Ritual ini melibatkan partisipasi bersama dan mencerminkan hubungan budaya yang erat antara nelayan dan laut.</p>
    <p>Studi tentang Nadran di Cirebon dan wilayah pesisir sekitarnya menunjukkan bahwa tradisi ini mengandung nilai-nilai rasa syukur, kerja sama, identitas budaya, dan kesadaran ekologis. Beberapa peneliti berpendapat bahwa tradisi seperti ini dapat mendorong perilaku penangkapan ikan yang bertanggung jawab serta konservasi ekosistem laut.</p>
    <p>Dalam unit ini, kamu akan menyelidiki bagaimana intensitas penangkapan ikan, kesadaran masyarakat, pengelolaan limbah, dan upaya konservasi dapat memengaruhi keberlanjutan laut. Kamu akan menggunakan simulasi interaktif untuk mengeksplorasi sistem tersebut.</p>

    <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
      <p className="text-[11px] font-semibold text-foreground mb-2">Simulasi Keberlanjutan Laut (Marine Sustainability Simulation)</p>
      <p className="text-[12px] text-foreground/80">Atur variabel dan amati bagaimana faktor-faktor tersebut memengaruhi ekosistem laut. Catat data Anda untuk menganalisis sistem tersebut. (Adjust variables and observe how they affect the marine ecosystem. Record your data to analyze the system.)</p>
    </div>
  </div>
);

export default StimulusPanel;
