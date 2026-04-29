export interface UnitStimulus {
  id: number;
  titleEn: string;
  titleId: string;
  themeEn: string;
  themeId: string;
  introductionEn: string;
  introductionId: string;
  tableData?: {
    headersEn: string[];
    headersId: string[];
    rows: Array<Array<{en: string, id: string}>>;
    source: string;
  };
}

export interface UnitMeta {
  id: number;
  title: string;
  subtitle: string;
  themeEn: string;
  themeId: string;
  imageUrl?: string;
  videoUrl?: string;
}

export const defaultUnitMeta: Record<number, UnitMeta> = {
  1: {
    id: 1,
    title: "Unit 1",
    subtitle: "Nasi Jamblang (Teak Leaf Food Packaging)",
    themeEn: "Nasi Jamblang traditionally uses teak leaves as natural food packaging. Teak leaves are biodegradable and decompose naturally in the environment, reducing plastic waste. This practice reflects sustainable packaging based on natural resources and illustrates how traditional practices support environmentally friendly consumption and waste reduction within ecosystems.",
    themeId: "Nasi Jamblang secara tradisional menggunakan daun jati sebagai pembungkus makanan alami. Daun jati bersifat biodegradable dan terurai secara alami di lingkungan, sehingga mengurangi limbah plastik. Praktik ini mencerminkan kemasan berkelanjutan berbasis sumber daya alam serta menunjukkan bagaimana praktik tradisional mendukung konsumsi ramah lingkungan dan pengurangan limbah dalam ekosistem.",
    imageUrl: "/images/unit1.png",
    videoUrl: "/videos/unit1-nasi-jamblang.mp4",
  },
  2: {
    id: 2,
    title: "Unit 2",
    subtitle: "Shrimp Paste Production (Terasi Cirebon)",
    themeEn: "Shrimp paste is produced from rebon shrimp harvested from coastal marine ecosystems. Its production depends on the sustainability of shrimp populations and healthy marine ecosystems. Sustainable fishing practices are therefore essential to maintain marine biodiversity and ensure long-term availability of fishery resources.",
    themeId: "Terasi dibuat dari udang rebon yang ditangkap dari ekosistem laut pesisir. Produksinya bergantung pada keberlanjutan populasi udang dan kesehatan ekosistem laut. Oleh karena itu, praktik perikanan berkelanjutan sangat penting untuk menjaga keanekaragaman hayati laut dan memastikan ketersediaan sumber daya perikanan dalam jangka panjang.",
    imageUrl: "/images/unit2.jpg",
    videoUrl: "/videos/unit2-terasi.mp4",
  },
  3: {
    id: 3,
    title: "Unit 3",
    subtitle: "Empal Gentong (Clay Pot Cooking)",
    themeEn: "Empal Gentong is traditionally cooked in clay pots made from natural soil materials. Clay is a natural resource that can return to the environment without producing harmful waste. Clay cookware also retains and distributes heat efficiently, which may reduce energy consumption during cooking. This reflects sustainable use of natural geological materials and traditional energy-efficient cooking practices.",
    themeId: "Empal Gentong secara tradisional dimasak menggunakan gentong tanah liat yang terbuat dari bahan tanah alami. Tanah liat merupakan sumber daya alam yang dapat kembali ke lingkungan tanpa menimbulkan bahaya. Wadah tanah liat juga mampu menahan dan mendistribusikan panas secara efisien, sehingga mengurangi konsumsi energi saat memasak. Hal ini mencerminkan penggunaan bahan ekologis alami dan praktik memasak yang hemat energi secara tradisional.",
    imageUrl: "/images/unit3.png",
    videoUrl: "/videos/unit3-empal-gentong.mp4",
  },
  4: {
    id: 4,
    title: "Unit 4",
    subtitle: "Kerupuk Melarat (Sand-Frying Technique)",
    themeEn: "Kerupuk Melarat is fried using heated sand instead of cooking oil. This traditional technique reduces the need for large amounts of oil and allows the sand to be reused multiple times. The method demonstrates efficient resource utilization in local food processing systems, reducing waste and promoting sustainability in traditional food production.",
    themeId: "Kerupuk Melarat digoreng menggunakan pasir panas, bukan minyak. Teknik tradisional ini mengurangi kebutuhan minyak dalam jumlah besar dan memungkinkan pasir digunakan kembali berkalikali. Metode ini menunjukkan pemanfaatan sumber daya yang efisien dalam sistem pengolahan pangan lokal, mengurangi limbah, dan mendukung keberlanjutan produksi pangan tradisional.",
    imageUrl: "/images/unit4.png",
    videoUrl: "/videos/unit4-kerupuk-melarat.mp4",
  },
  5: {
    id: 5,
    title: "Unit 5",
    subtitle: "Tape Ketan Bakung (Fermented Glutinous Rice with Leaf Packaging)",
    themeEn: "Tape Ketan Bakung is made from glutinous rice through a traditional fermentation process, which reflects the use of biological processes (microorganisms) in food production. The product is wrapped in natural leaves (commonly banana or similar leaves), which are biodegradable and reduce plastic waste. This practice demonstrates sustainable food processing and eco-friendly packaging, as well as efficient use of agricultural resources. Additionally, fermentation extends shelf life, reducing food waste and supporting sustainability in local food systems.",
    themeId: "Tape Ketan Bakung dibuat dari beras ketan melalui proses fermentasi tradisional yang melibatkan mikroorganisme dalam produksi pangan. Produk ini dibungkus dengan daun alami (biasanya daun pisang atau daun sejenis) yang dapat terurai secara hayati dan mengurangi limbah plastik. Praktik ini mencerminkan pengolahan pangan berkelanjutan dan kemasan ramah lingkungan, serta pemanfaatan sumber daya pertanian secara efisien. Selain itu, fermentasi juga memperpanjang masa simpan, mengurangi limbah pangan, dan mendukung keberlanjutan sistem pangan lokal.",
    imageUrl: "/images/unit5.png",
    videoUrl: "/videos/unit5-tape-ketan.mp4",
  },
  6: {
    id: 6,
    title: "Unit 6",
    subtitle: "Mangrove Ecosystem (Coastal Protection)",
    themeEn: "Mangrove forests serve as coastal protection against erosion, carbon sinks, and habitats for diverse species. They also support fisheries and maintain coastal ecosystem balance. Mangrove conservation is therefore essential for biodiversity protection, climate change mitigation, and sustainable coastal ecosystems.",
    themeId: "Hutan mangrove berfungsi sebagai perlindungan pesisir dari erosi, penyerap karbon (carbon sink), serta habitat bagi berbagai spesies. Mangrove juga mendukung perikanan dan menjaga keseimbangan ekosistem pesisir. Oleh karena itu, konservasi mangrove sangat penting untuk perlindungan keanekaragaman hayati, mitigasi perubahan iklim, dan keberlanjutan ekosistem pesisir.",
    imageUrl: "/images/unit7.jpg",
    videoUrl: "/videos/unit6-mangrove.mp4",
  },
  7: {
    id: 7,
    title: "Unit 7",
    subtitle: "Nadran (Sea Thanksgiving Ritual)",
    themeEn: "Nadran is a traditional ritual expressing gratitude for marine resources. The practice reflects the cultural relationship between coastal communities and the sea and may foster awareness about sustainable fishing practices and marine ecosystem conservation.",
    themeId: "Nadran merupakan ritual tradisional sebagai ungkapan rasa syukur atas sumber daya laut. Praktik ini mencerminkan hubungan budaya antara masyarakat pesisir dan laut, serta dapat meningkatkan kesadaran terhadap praktik perikanan berkelanjutan dan konservasi ekosistem laut.",
    imageUrl: "/images/unit7.jpg",
    videoUrl: "/videos/unit7-nadran.mp4",
  },
  8: {
    id: 8,
    title: "Unit 8",
    subtitle: "Rattan Craft Industry (Rotan Plered)",
    themeEn: "Rattan is a non-timber forest product harvested from forest ecosystems. Sustainable rattan harvesting supports local livelihoods while maintaining forest biodiversity and ecological balance when managed responsibly.",
    themeId: "Rotan merupakan hasil hutan bukan kayu yang dipanen dari ekosistem hutan. Pemanenan rotan secara berkelanjutan dapat mendukung mata pencaharian masyarakat lokal sekaligus menjaga keanekaragaman hayati hutan dan keseimbangan ekologi jika dikelola dengan baik.",
    imageUrl: "/images/unit8.jpg",
    videoUrl: "/videos/unit8-rattan.mp4",
  },
  9: {
    id: 9,
    title: "Unit 9",
    subtitle: "Batik Trusmi (Traditional Batik Industry)",
    themeEn: "Batik production involves dyeing processes that use water and chemical or natural dyes. Without proper treatment, wastewater can pollute aquatic ecosystems. The adoption of natural dyes and environmentally friendly production technologies can reduce environmental pollution and support sustainable craft industries.",
    themeId: "Produksi batik melibatkan proses pewarnaan yang menggunakan air serta zat pewarna kimia atau alami. Tanpa pengolahan yang tepat, limbah cair dapat mencemari ekosistem perairan. Penggunaan pewarna alami dan teknologi produksi ramah lingkungan dapat mengurangi pencemaran serta mendukung industri kerajinan yang berkelanjutan.",
    imageUrl: "/images/unit9.jpg",
    videoUrl: "/videos/unit9-batik.mp4",
  },
  10: {
    id: 10,
    title: "Unit 10",
    subtitle: "Tahu Gejrot (Sustainable Local Food Systems)",
    themeEn: "Tahu gejrot uses tofu as a plant-based protein source, which generally requires fewer natural resources and produces lower environmental pressure than many animal-based foods. Its preparation also reflects the use of locally available ingredients and small-scale food processing, supporting more sustainable local food systems.",
    themeId: "Tahu gejrot menggunakan tahu sebagai sumber protein nabati, yang umumnya membutuhkan lebih sedikit sumber daya alam dan menghasilkan tekanan lingkungan yang lebih rendah dibandingkan banyak pangan berbasis hewani. Proses pembuatannya juga mencerminkan penggunaan bahan-bahan lokal yang tersedia serta pengolahan pangan skala kecil, sehingga mendukung sistem pangan lokal yang lebih berkelanjutan.",
    imageUrl: "/images/unit10.jpg",
    videoUrl: "/videos/unit10-tahu-gejrot.mp4",
  },
};

export const getUnitMeta = (unit: number): UnitMeta => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(`admin_unit_meta_${unit}`) : null;
  if (saved) return JSON.parse(saved);
  return defaultUnitMeta[unit] || { id: unit, title: `Unit ${unit}`, subtitle: "", themeEn: "", themeId: "" };
};

export const getUnitStimulus = (unit: number): UnitStimulus => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(`admin_unit_stimulus_${unit}`) : null;
  if (saved) return JSON.parse(saved);
  return {
    id: unit,
    titleEn: "",
    titleId: "",
    themeEn: "",
    themeId: "",
    introductionEn: "",
    introductionId: "",
  };
};

export interface SiteConfig {
  appTitle: string;
  appSubtitle: string;
  footerText: string;
}

export const defaultSiteConfig: SiteConfig = {
  appTitle: "Assessing Science Literacy through Cirebon Culture",
  appSubtitle: "Cirebon Heritage Assessment",
  footerText: "© 2026 Assessing Science Literacy through Cirebon Culture. All rights reserved.",
};

export const getSiteConfig = (): SiteConfig => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('admin_site_config') : null;
  if (saved) return JSON.parse(saved);
  return defaultSiteConfig;
};
