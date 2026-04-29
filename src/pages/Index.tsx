import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-jamblang.jpg";

const Index = () => {
  const { t } = useLanguage();

return (
    <main className="pt-16">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="fade-in-up">
            <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-4">
              {t("Unit 1 — Cultural Food Study", "Unit 1 — Studi Pangan Budaya")}
            </p>
            <h1 className="editorial-heading text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
              {t(
                "Nasi Jamblang: Tradition or Sustainable Solution?",
                "Nasi Jamblang: Tradisi atau Solusi Berkelanjutan?"
              )}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
              {t(
                "Explore how a humble dish from Cirebon connects cultural heritage with modern sustainability practices.",
                "Jelajahi bagaimana hidangan sederhana dari Cirebon menghubungkan warisan budaya dengan praktik keberlanjutan modern."
              )}
            </p>
            <Link
              to="/learn"
              className="inline-block px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-sm transition-all duration-200 hover:opacity-90"
            >
              {t("Start Learning", "Mulai Belajar")}
            </Link>
          </div>

          <div className="fade-in-up stagger-2">
            <img
              src={heroImage}
              alt="Nasi Jamblang served on a teak leaf"
              className="w-full rounded-sm"
              width={1920}
              height={1080}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="fade-in-up stagger-3">
          <h2 className="editorial-heading text-xl md:text-2xl text-foreground mb-5">
            {t("What is Nasi Jamblang?", "Apa itu Nasi Jamblang?")}
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              {t(
                "Nasi Jamblang is a traditional rice dish originating from Cirebon, West Java, Indonesia. What makes it unique is its serving method — rice is wrapped in a teak leaf (daun jati), which imparts a subtle earthy aroma and naturally preserves the food.",
                "Nasi Jamblang adalah hidangan nasi tradisional yang berasal dari Cirebon, Jawa Barat, Indonesia. Yang membuatnya unik adalah cara penyajiannya — nasi dibungkus dengan daun jati, yang memberikan aroma tanah yang halus dan mengamankan makanan secara alami."
              )}
            </p>
            <p>
              {t(
                "Diners choose from a variety of side dishes — tofu, tempeh, fried fish, sambal, vegetables, and more — making every plate a personal composition. It's affordable, communal, and deeply rooted in Cirebonese identity.",
                "Pengunjung memilih dari berbagai lauk pauk — tahu, tempe, ikan goreng, sambal, sayuran, dan lainnya — menjadikan setiap piring sebagai komposisi personal. Harganya terjangkau, bersifat komunal, dan berakar kuat dalam identitas Cirebon."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Sustainability Angle */}
      <section className="bg-accent/50 py-10">
        <div className="max-w-3xl mx-auto px-4 fade-in-up stagger-4">
          <h2 className="editorial-heading text-xl md:text-2xl text-foreground mb-5">
            {t("A Sustainable Perspective", "Perspektif Berkelanjutan")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-xs text-muted-foreground">
            <div>
              <p className="text-foreground font-medium mb-1.5 font-body">
                {t("Natural Packaging", "Kemasan Alami")}
              </p>
              <p className="leading-relaxed">
                {t(
                  "Teak leaves replace plastic wrapping, reducing waste at the source.",
                  "Daun jati menggantikan pembungkus plastik, mengurangi sampah dari sumbernya."
                )}
              </p>
            </div>
            <div>
              <p className="text-foreground font-medium mb-1.5 font-body">
                {t("Local Sourcing", "Sumber Lokal")}
              </p>
              <p className="leading-relaxed">
                {t(
                  "Ingredients come from local markets, supporting small-scale farmers and reducing food miles.",
                  "Bahan-bahan berasal dari pasar lokal, mendukung petani kecil dan mengurangi jarak distribusi."
                )}
              </p>
            </div>
            <div>
              <p className="text-foreground font-medium mb-1.5 font-body">
                {t("Zero-Waste Culture", "Budaya Tanpa Limbah")}
              </p>
              <p className="leading-relaxed">
                {t(
                  "The communal serving style and biodegradable materials create minimal environmental impact.",
                  "Gaya penyajian komunal dan bahan yang mudah terurai menciptakan dampak lingkungan yang minimal."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-[10px] text-muted-foreground">
          {t(
            "An educational project exploring food, culture, and sustainability.",
            "Proyek edukasi yang mengeksplorasi makanan, budaya, dan keberlanjutan."
          )}
        </p>
      </footer>
    </main>
  );
};

export default Index;
