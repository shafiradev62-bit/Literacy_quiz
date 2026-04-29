export interface ExamQuestion {
  id: number;
  type: "mcq" | "checkbox" | "open";
  question: string;
  questionIdn?: string;
  options?: string[];
  optionsIdn?: string[];
  correct?: string | string[];
  mediaUrl?: string;
  mediaType?: "image" | "video";
  explanation?: string;
  explanationIdn?: string;
}

// ── UNIT 1 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit1: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "What characteristic of teak leaves makes them suitable for food packaging?",
    questionIdn: "Karakteristik apa dari daun jati yang membuatnya cocok digunakan sebagai kemasan makanan?",
    options: [
      "They are waterproof and synthetic",
      "They contain natural compounds that help preserve food",
      "They are cheaper than all other materials",
      "They can only be used once",
    ],
    optionsIdn: [
      "Kedap air dan bersifat sintetis",
      "Mengandung senyawa alami yang membantu mengawetkan makanan",
      "Lebih murah dibandingkan semua bahan lainnya",
      "Hanya dapat digunakan satu kali",
    ],
    correct: "They contain natural compounds that help preserve food",
  },
  {
    id: 2,
    type: "checkbox",
    question: "Rani wants to investigate how effective teak leaves are in preserving food compared to plastic. Which variable should she measure?",
    questionIdn: "Rani ingin menyelidiki seberapa efektif daun jati dalam menjaga kualitas makanan dibandingkan plastik. Variabel manakah yang sebaiknya ia ukur?",
    options: [
      "Temperature of storage",
      "Time taken for food to spoil",
      "Color of the packaging",
      "Type of food used",
    ],
    optionsIdn: [
      "Suhu penyimpanan",
      "Waktu yang dibutuhkan makanan untuk basi",
      "Warna kemasan",
      "Jenis makanan yang digunakan",
    ],
    correct: [
      "Time taken for food to spoil",
      "Temperature of storage",
      "Type of food used",
    ],
  },
  {
    id: 3,
    type: "open",
    question: "Based on the data, explain why teak leaves are considered more environmentally sustainable than plastic.",
    questionIdn: "Berdasarkan data yang tersedia, jelaskan mengapa daun jati dianggap lebih berkelanjutan secara lingkungan dibandingkan plastik!",
  },
  {
    id: 4,
    type: "mcq",
    question: "A vendor claims that plastic is better because it is more durable.\nBased on the information about environmental impacts of different packaging materials, which statement best evaluates this claim?",
    questionIdn: "Seorang pedagang berpendapat bahwa plastik lebih baik digunakan sebagai kemasan karena lebih tahan lama.\nBerdasarkan informasi tentang dampak lingkungan dari berbagai jenis bahan kemasan, pernyataan manakah yang paling tepat untuk mengevaluasi pendapat tersebut?",
    options: [
      "Durability is beneficial but increases environmental impact",
      "Plastic is always better because it lasts longer",
      "Teak leaves are harmful because they decompose quickly",
      "Durability has no effect on sustainability",
    ],
    optionsIdn: [
      "Daya tahan memang menguntungkan, tetapi meningkatkan dampak lingkungan",
      "Plastik selalu lebih baik karena dapat digunakan lebih lama",
      "Daun jati berbahaya karena mudah terurai",
      "Daya tahan tidak berpengaruh terhadap keberlanjutan",
    ],
    correct: "Durability is beneficial but increases environmental impact",
  },
  {
    id: 5,
    type: "open",
    question: "If you were a policymaker, which packaging option would you recommend for sustainable food practices? Explain your reasoning.",
    questionIdn: "Jika Anda adalah seorang pembuat kebijakan, jenis kemasan manakah yang akan Anda rekomendasikan untuk praktik pangan berkelanjutan? Jelaskan alasan Anda!",
  },
];

// ── UNIT 2 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit2: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "A producer uses low salt and poor hygiene during fermentation. Which outcome is most likely?",
    questionIdn: "Seorang produsen menggunakan kadar garam rendah dan kebersihan yang buruk selama proses fermentasi. Hasil apa yang paling mungkin terjadi?",
    options: [
      "Lower microbial risk and higher safety",
      "Higher microbial risk and lower safety",
      "No change in product quality",
      "Higher shrimp population in the sea",
    ],
    optionsIdn: [
      "Risiko mikroba lebih rendah dan keamanan lebih tinggi",
      "Risiko mikroba lebih tinggi dan keamanan lebih rendah",
      "Tidak ada perubahan pada kualitas produk",
      "Populasi udang di laut meningkat",
    ],
    correct: "Higher microbial risk and lower safety",
  },
  {
    id: 2,
    type: "mcq",
    question: "Run the simulation. If salt level is reduced while hygiene remains poor, what happens to safety risk?",
    questionIdn: "Jalankan simulasi. Jika kadar garam dikurangi sementara kebersihan tetap buruk, apa yang terjadi pada risiko keamanan?",
    options: [
      "Safety risk decreases",
      "Safety risk increases",
      "Safety risk stays exactly the same",
      "Salt has no role in fermentation",
    ],
    optionsIdn: [
      "Risiko keamanan menurun",
      "Risiko keamanan meningkat",
      "Risiko keamanan tetap sama persis",
      "Garam tidak berperan dalam fermentasi",
    ],
    correct: "Safety risk increases",
  },
  {
    id: 3,
    type: "open",
    question: "Explain why the simulated result changes when drying time is shorter.",
    questionIdn: "Jelaskan mengapa hasil simulasi berubah ketika waktu pengeringan lebih singkat.",
  },
  {
    id: 4,
    type: "open",
    question: "What is the highest hygiene level that still keeps safety risk high when salt is very low? Use the simulation to support your answer.",
    questionIdn: "Tingkat kebersihan tertinggi apa yang masih membuat risiko keamanan tetap tinggi ketika kadar garam sangat rendah? Gunakan simulasi untuk mendukung jawabanmu.",
  },
  {
    id: 5,
    type: "open",
    question: "If you were a policymaker, which combination of production practices would you recommend for safe and sustainable terasi production? Explain your reasoning.",
    questionIdn: "Jika kamu adalah seorang pembuat kebijakan, kombinasi praktik produksi seperti apa yang akan kamu rekomendasikan untuk menghasilkan terasi yang aman dan berkelanjutan? Jelaskan alasanmu.",
  },
];

// ── UNIT 3 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit3: ExamQuestion[] = [
  {
    id: 1,
    type: "open",
    question: "You are asked to investigate the most energy-efficient way to cook Empal Gentong.\n\nUse the simulation to determine:\nWhich combination of pot type, pot thickness, and heat input produces the highest energy efficiency?\n\nRecord your data and write your answer based on the results.",
    questionIdn: "Kamu diminta untuk menyelidiki cara memasak Empal Gentong yang paling efisien secara energi.\n\nGunakan simulasi untuk menentukan:\nKombinasi jenis wadah, ketebalan wadah, dan besar panas yang menghasilkan efisiensi energi tertinggi.\n\nCatat data dan tuliskan jawaban berdasarkan hasil simulasi.",
  },
  {
    id: 2,
    type: "mcq",
    question: "A chef uses:\n• A metal pot\n• Thin pot thickness\n• High heat input\n\nWhat is the most likely outcome?",
    questionIdn: "Seorang koki menggunakan:\n• Panci logam\n• Ketebalan tipis\n• Panas tinggi\n\nApa hasil yang paling mungkin terjadi?",
    options: [
      "High heat retention and low energy use",
      "Low heat retention and high energy use",
      "No difference compared to clay pot",
      "Only cooking time is affected",
    ],
    optionsIdn: [
      "Retensi panas tinggi dan energi rendah",
      "Retensi panas rendah dan energi tinggi",
      "Tidak ada perbedaan dengan tanah liat",
      "Hanya waktu memasak yang berubah",
    ],
    correct: "Low heat retention and high energy use",
  },
  {
    id: 3,
    type: "checkbox",
    question: "When the thickness of a clay pot increases, heat retention also increases.\nWhich TWO statements best explain this phenomenon?",
    questionIdn: "Ketika ketebalan wadah tanah liat meningkat, retensi panas juga meningkat.\nManakah DUA pernyataan yang paling tepat menjelaskan fenomena ini?",
    options: [
      "Thicker walls store more heat energy",
      "Heat loss to the environment is reduced",
      "Clay becomes more conductive when thicker",
      "More heat escapes through the surface",
      "Thermal mass of the pot increases",
    ],
    optionsIdn: [
      "Dinding yang lebih tebal menyimpan lebih banyak energi panas",
      "Kehilangan panas ke lingkungan berkurang",
      "Tanah liat menjadi lebih konduktif saat lebih tebal",
      "Lebih banyak panas keluar melalui permukaan",
      "Massa termal wadah meningkat",
    ],
    correct: [
      "Thicker walls store more heat energy",
      "Heat loss to the environment is reduced",
    ],
  },
  {
    id: 4,
    type: "checkbox",
    question: "Based on the simulation, which TWO conditions can still result in low energy efficiency even when using a clay pot?",
    questionIdn: "PILIH 2. Berdasarkan simulasi, kondisi mana yang tetap dapat menyebabkan efisiensi energi rendah meskipun menggunakan wadah tanah liat?",
    options: [
      "Very high heat input",
      "Very thin pot wall",
      "Moderate heat input",
      "Excessive water volume",
      "Proper thickness and moderate heat",
    ],
    optionsIdn: [
      "Panas sangat tinggi",
      "Dinding wadah sangat tipis",
      "Panas sedang",
      "Volume air terlalu banyak",
      "Ketebalan optimal dan panas sedang",
    ],
    correct: [
      "Very high heat input",
      "Very thin pot wall",
    ],
  },
  {
    id: 5,
    type: "open",
    question: "If you were a policymaker promoting sustainable cooking practices:\nWould you recommend using clay pots instead of metal pots?\n\nExplain your reasoning based on:\n• energy efficiency\n• environmental impact\n• sustainability",
    questionIdn: "Jika kamu seorang pembuat kebijakan yang ingin mendorong praktik memasak berkelanjutan:\nApakah kamu akan merekomendasikan penggunaan wadah tanah liat dibandingkan panci logam?\n\nJelaskan alasanmu berdasarkan:\n• efisiensi energi\n• dampak lingkungan\n• keberlanjutan",
  },
];

// ── UNIT 4 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit4: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "Run the simulation using:\n• Frying medium: Oil\n• Temperature: 180°C\n• Frying time: 2 minutes\n\nWhat is the main outcome?",
    questionIdn: "Jalankan simulasi menggunakan:\n• Media penggorengan: Minyak\n• Suhu: 180°C\n• Waktu penggorengan: 2 menit\n\nApa hasil utamanya?",
    options: [
      "Low oil absorption",
      "High oil absorption",
      "No energy use",
      "No effect on sustainability",
    ],
    optionsIdn: [
      "Penyerapan minyak rendah",
      "Penyerapan minyak tinggi",
      "Tidak ada penggunaan energi",
      "Tidak berpengaruh terhadap keberlanjutan",
    ],
    correct: "High oil absorption",
  },
  {
    id: 2,
    type: "mcq",
    question: "Run two simulations with the same temperature and time:\n1. Medium = Oil\n2. Medium = Sand\n\nCompare the results. What conclusion can you make?",
    questionIdn: "Jalankan dua simulasi dengan suhu dan waktu yang sama:\n1. Media = Minyak\n2. Media = Pasir\n\nBandingkan hasilnya. Kesimpulan apa yang dapat kamu buat?",
    options: [
      "Sand increases oil absorption",
      "Sand reduces oil absorption",
      "There is no difference",
      "Oil is more sustainable",
    ],
    optionsIdn: [
      "Pasir meningkatkan penyerapan minyak",
      "Pasir mengurangi penyerapan minyak",
      "Tidak ada perbedaan",
      "Minyak lebih berkelanjutan",
    ],
    correct: "Sand reduces oil absorption",
  },
  {
    id: 3,
    type: "checkbox",
    question: "When sand is used instead of oil, oil absorption decreases.\nWhich TWO statements best explain this scientifically?",
    questionIdn: "Ketika pasir digunakan sebagai pengganti minyak, penyerapan minyak berkurang.\nManakah DUA pernyataan yang paling tepat menjelaskan hal ini secara ilmiah?",
    options: [
      "Sand does not contain oil",
      "Heat is transferred without oil penetration",
      "Sand increases fat content in food",
      "Oil diffuses into food during frying",
      "There is no contact between food and medium",
    ],
    optionsIdn: [
      "Pasir tidak mengandung minyak",
      "Panas berpindah tanpa penetrasi minyak",
      "Pasir meningkatkan kandungan lemak makanan",
      "Minyak berdifusi ke dalam makanan saat menggoreng",
      "Tidak ada kontak antara makanan dan medium",
    ],
    correct: [
      "Sand does not contain oil",
      "Heat is transferred without oil penetration",
    ],
  },
  {
    id: 4,
    type: "checkbox",
    question: "Based on the simulation, which TWO conditions can produce high crispiness with low or medium energy use?",
    questionIdn: "PILIH 2. Berdasarkan simulasi, kondisi mana yang dapat menghasilkan kerenyahan tinggi dengan penggunaan energi rendah atau sedang?",
    options: [
      "Sand medium with moderate temperature",
      "Oil medium with high temperature",
      "Sand medium with appropriate time",
      "Oil medium with long frying time",
      "Sand medium with extremely high temperature",
    ],
    optionsIdn: [
      "Media pasir dengan suhu sedang",
      "Media minyak dengan suhu tinggi",
      "Media pasir dengan waktu yang sesuai",
      "Media minyak dengan waktu penggorengan lama",
      "Media pasir dengan suhu sangat tinggi",
    ],
    correct: [
      "Sand medium with moderate temperature",
      "Sand medium with appropriate time",
    ],
  },
  {
    id: 5,
    type: "open",
    question: "You are designing a sustainable food production system.\nWould you recommend sand frying instead of oil frying?\n\nExplain your answer using:\n• health\n• energy use\n• sustainability\n\nWriting guide: A strong answer should compare sand and oil frying in terms of health, energy use, and sustainability, then make a clear recommendation.",
    questionIdn: "Kamu sedang merancang sistem produksi pangan yang berkelanjutan.\nApakah kamu akan merekomendasikan penggorengan dengan pasir dibandingkan penggorengan dengan minyak?\n\nJelaskan jawabanmu dengan menggunakan:\n• kesehatan\n• penggunaan energi\n• keberlanjutan\n\nPanduan Penulisan: Jawaban yang kuat harus membandingkan penggorengan dengan pasir dan minyak dalam hal kesehatan, penggunaan energi, dan keberlanjutan, lalu memberikan rekomendasi yang jelas.",
  },
];

// ── UNIT 5 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit5: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "A student runs the simulation with these conditions:\n• Time: 48 hours\n• Temperature: 30°C\n• Packaging: Banana leaf\n• Starter: Good\n\nWhat is the main characteristic of the tape ketan produced?",
    questionIdn: "Seorang siswa menjalankan simulasi dengan kondisi berikut:\n• Waktu: 48 jam\n• Suhu: 30°C\n• Kemasan: daun pisang\n• Starter (ragi): baik\n\nApa karakteristik utama tape ketan yang dihasilkan?",
    options: [
      "Very low sugar and no aroma",
      "Sweet taste with slight alcohol",
      "Very sour and spoiled",
      "No fermentation occurs",
    ],
    optionsIdn: [
      "Kadar gula sangat rendah dan tidak beraroma",
      "Rasa manis dengan sedikit kandungan alkohol",
      "Sangat asam dan rusak",
      "Tidak terjadi fermentasi",
    ],
    correct: "Sweet taste with slight alcohol",
  },
  {
    id: 2,
    type: "mcq",
    question: "Run two simulations with the same time, temperature, and starter quality, but use different packaging:\n1. Banana leaf\n2. Plastic\n\nWhat is the effect of using banana leaf packaging?",
    questionIdn: "Jalankan dua simulasi dengan waktu, suhu, dan kualitas starter yang sama, tetapi gunakan jenis kemasan yang berbeda:\n1. Daun pisang\n2. Plastik\n\nApa pengaruh penggunaan kemasan daun pisang?",
    options: [
      "It increases plastic waste",
      "It stops fermentation",
      "It improves sustainability and can support preferred quality",
      "It always lowers sweetness to zero",
    ],
    optionsIdn: [
      "Meningkatkan limbah plastik",
      "Menghentikan proses fermentasi",
      "Meningkatkan keberlanjutan dan dapat mendukung kualitas yang lebih disukai",
      "Selalu menurunkan rasa manis menjadi nol",
    ],
    correct: "It improves sustainability and can support preferred quality",
  },
  {
    id: 3,
    type: "checkbox",
    question: "Compare the simulation at 48 hours and 72 hours with all other variables the same.\nWhich TWO statements best explain what happens as fermentation time increases?",
    questionIdn: "Bandingkan simulasi pada 48 jam dan 72 jam dengan variabel lain tetap sama.\nManakah DUA pernyataan yang paling tepat menjelaskan perubahan yang terjadi?",
    options: [
      "Sugar is converted into alcohol and acids",
      "Sweetness decreases over time",
      "Sweetness always increases",
      "Microorganisms stop working after 48 hours",
      "Acidity increases due to fermentation",
    ],
    optionsIdn: [
      "Gula diubah menjadi alkohol dan asam",
      "Rasa manis menurun seiring waktu",
      "Rasa manis selalu meningkat",
      "Mikroorganisme berhenti bekerja setelah 48 jam",
      "Keasaman meningkat akibat fermentasi",
    ],
    correct: [
      "Sugar is converted into alcohol and acids",
      "Sweetness decreases over time",
    ],
  },
  {
    id: 4,
    type: "checkbox",
    question: "Based on the simulation, which TWO conditions produce good taste, medium acidity, and longer shelf life?",
    questionIdn: "Berdasarkan simulasi, pilih dua kondisi mana yang menghasilkan: rasa baik, keasaman sedang, daya simpan lebih lama",
    options: [
      "48 hours, 30°C, banana leaf, good starter",
      "72 hours, 35°C, plastic, poor starter",
      "48 hours, 30°C, plastic, good starter",
      "24 hours, 25°C, plastic, poor starter",
      "72 hours, 30°C, banana leaf, good starter",
    ],
    optionsIdn: [
      "48 jam, 30°C, daun pisang, starter baik",
      "72 jam, 35°C, plastik, starter buruk",
      "48 jam, 30°C, plastik, starter baik",
      "24 jam, 25°C, plastik, starter buruk",
      "72 jam, 30°C, daun pisang, starter baik",
    ],
    correct: [
      "48 hours, 30°C, banana leaf, good starter",
      "72 hours, 30°C, banana leaf, good starter",
    ],
  },
  {
    id: 5,
    type: "open",
    question: "A producer wants to make tape ketan that is:\n• environmentally friendly\n• good quality\n• longer-lasting\n\nShould the producer use banana leaf or plastic packaging?\n\nWriting guide: A strong answer should compare banana leaf and plastic in terms of biodegradability, food quality, and waste reduction, then make a clear recommendation.",
    questionIdn: "Seorang produsen ingin membuat tape ketan yang:\n• ramah lingkungan\n• berkualitas baik\n• lebih tahan lama\n\nApakah produsen sebaiknya menggunakan kemasan daun pisang atau plastik?\n\nPanduan Penulisan: Jawaban yang baik harus membandingkan daun pisang dan plastik dalam hal biodegradabilitas (kemampuan terurai), kualitas pangan, dan pengurangan limbah, kemudian memberikan rekomendasi yang jelas.",
  },
];

export const examQuestionsUnit6: ExamQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "Mangrove forests can protect coastal areas from erosion. Which statement best explains how mangroves reduce coastal erosion?",
    questionIdn: "Hutan mangrove dapat melindungi wilayah pesisir dari abrasi. Pernyataan manakah yang paling tepat menjelaskan bagaimana mangrove mengurangi abrasi pantai?",
    options: [
      "Mangroves increase seawater temperature, making waves weaker.",
      "Mangrove roots trap sediment and reduce wave energy before it reaches the shore.",
      "Mangroves increase salinity so that the coastline becomes harder.",
      "Mangroves speed up the movement of coastal water away from the land.",
    ],
    optionsIdn: [
      "Mangrove meningkatkan suhu air laut sehingga gelombang menjadi lebih lemah.",
      "Akar mangrove menjebak sedimen dan mengurangi energi gelombang sebelum mencapai pantai.",
      "Mangrove meningkatkan salinitas sehingga garis pantai menjadi lebih keras.",
      "Mangrove mempercepat pergerakan air pesisir menjauh dari daratan.",
    ],
    correct: "Mangrove roots trap sediment and reduce wave energy before it reaches the shore.",
  },
  {
    id: 2,
    type: "mcq",
    question: "A student changes the simulation from 70% mangrove cover to 20% mangrove cover, while wave strength and other variables remain the same. What change is most likely to happen?",
    questionIdn: "Seorang siswa mengubah simulasi dari 70% tutupan mangrove menjadi 20% tutupan mangrove, sementara kekuatan gelombang dan variabel lainnya tetap sama. Perubahan apa yang paling mungkin terjadi?",
    options: [
      "Coastal erosion decreases and biodiversity increases.",
      "Flood risk increases and fish production may decrease.",
      "Carbon storage increases because fewer trees are present.",
      "There is no major change because waves are the only important factor.",
    ],
    optionsIdn: [
      "Abrasi pantai berkurang dan keanekaragaman hayati meningkat.",
      "Risiko banjir meningkat dan produksi ikan dapat menurun.",
      "Penyimpanan karbon meningkat karena jumlah pohon lebih sedikit.",
      "Tidak ada perubahan besar karena gelombang adalah satu-satunya faktor penting.",
    ],
    correct: "Flood risk increases and fish production may decrease.",
  },
  {
    id: 3,
    type: "checkbox",
    question: "What are the TWO most accurate scientific explanations of how mangrove coverage affects fish production?",
    questionIdn: "Manakah DUA penjelasan ilmiah yang paling tepat tentang hubungan tutupan mangrove dan produksi ikan?",
    options: [
      "Mangroves provide nursery grounds for juvenile fish",
      "Mangroves reduce wave energy, allowing fish to reproduce safely",
      "Mangroves increase ocean temperature to support fish growth",
      "Mangroves act as a food source and habitat for marine organisms",
      "Mangroves prevent all predators from entering coastal areas",
    ],
    optionsIdn: [
      "Mangrove menyediakan tempat pembesaran (nursery ground) bagi ikan muda",
      "Mangrove mengurangi energi gelombang sehingga ikan dapat berkembang biak dengan aman",
      "Mangrove meningkatkan suhu laut untuk mendukung pertumbuhan ikan",
      "Mangrove menjadi sumber makanan dan habitat bagi organisme laut",
      "Mangrove mencegah semua predator masuk ke wilayah pesisir",
    ],
    correct: [
      "Mangroves provide nursery grounds for juvenile fish",
      "Mangroves act as a food source and habitat for marine organisms",
    ],
  },
  {
    id: 4,
    type: "checkbox",
    question: "A coastal community converts mangrove areas into ponds and housing.\nWhich TWO impacts are most likely in the short and long term?",
    questionIdn: "Sebuah komunitas pesisir mengalihfungsikan mangrove menjadi tambak dan perumahan.\nManakah DUA dampak yang paling mungkin terjadi dalam jangka pendek dan panjang?",
    options: [
      "Reduced abrasion and increased biodiversity",
      "Increased flood risk and coastal erosion",
      "Increased fish production due to more open water",
      "Decreased biodiversity and loss of ecosystem services",
      "Increased carbon storage due to land conversion",
    ],
    optionsIdn: [
      "Abrasi berkurang dan keanekaragaman hayati meningkat",
      "Risiko banjir dan abrasi meningkat",
      "Produksi ikan meningkat karena perairan lebih terbuka",
      "Keanekaragaman hayati menurun dan jasa ekosistem hilang",
      "Penyimpanan karbon meningkat akibat alih fungsi lahan",
    ],
    correct: [
      "Increased flood risk and coastal erosion",
      "Decreased biodiversity and loss of ecosystem services",
    ],
  },
  {
    id: 5,
    type: "open",
    question: "The local government in Cirebon wants to reduce coastal erosion. Based on the information and your simulation results, recommend the best policy action.\n\nYour answer should include:\n• one main strategy\n• a scientific reason\n• a long-term effect on the coastal ecosystem\n\nA strong recommendation may include mangrove restoration, limiting high-impact land conversion, and protecting coastal habitat. It should justify the decision using scientific evidence such as lower erosion, lower flood risk, higher fish production, and greater carbon storage.",
    questionIdn: "Pemerintah daerah di Cirebon ingin mengurangi abrasi pantai. Berdasarkan informasi yang tersedia dan hasil simulasimu, rekomendasikan tindakan kebijakan yang paling tepat.\n\nJawabanmu harus memuat:\n• satu strategi utama\n• satu alasan ilmiah\n• satu dampak jangka panjang terhadap ekosistem pesisir\n\nPanduan jawaban: Rekomendasi yang kuat dapat mencakup restorasi mangrove, pembatasan alih fungsi lahan yang berdampak tinggi, dan perlindungan habitat pesisir. Jawaban juga perlu didukung bukti ilmiah, seperti abrasi yang lebih rendah, risiko banjir yang menurun, produksi ikan yang meningkat, dan penyimpanan karbon yang lebih besar.",
  },
];

// ── UNIT 7 ──────────────────────────────────────────────────────────────────
export const examQuestionsUnit7: ExamQuestion[] = [
  {
    id: 1,
    type: "open",
    question: "Researchers want to understand how social and environmental factors influence marine sustainability in coastal Cirebon.\n\nMatch each factor with its most direct effect.\n\nFactors:\n1. High fishing intensity\n2. High community awareness\n3. Good waste management\n4. Strong conservation efforts\n\nEffects:\nA. Reduces fish population\nB. Reduces overfishing behavior\nC. Improves water quality\nD. Increases marine biodiversity\n\nInstructions:\nWrite the correct matches between each factor and its effect (for example: 1–A, 2–B, etc.).",
    questionIdn: "Para peneliti ingin memahami bagaimana faktor sosial dan lingkungan memengaruhi keberlanjutan laut di wilayah pesisir Cirebon.\n\nPasangkan setiap faktor berikut dengan dampak utamanya yang paling tepat.\n\nFaktor:\n1. Intensitas penangkapan ikan tinggi\n2. Kesadaran masyarakat tinggi\n3. Pengelolaan limbah yang baik\n4. Upaya konservasi yang kuat\n\nDampak:\nA. Mengurangi populasi ikan\nB. Mengurangi perilaku penangkapan berlebih (overfishing)\nC. Meningkatkan kualitas air\nD. Meningkatkan keanekaragaman hayati laut\n\nPetunjuk:\nTuliskan pasangan yang sesuai antara faktor dan dampaknya (misalnya: 1-A, 2-B, dan seterusnya).",
  },
  {
    id: 2,
    type: "mcq",
    question: "A student sets the simulation as follows:\n• Fishing intensity: High\n• Community awareness: Low\n• Waste management: Poor\n\nThe result shows that fish population decreases strongly. Which factor most directly caused the decrease in fish population?",
    questionIdn: "Seorang siswa mengatur simulasi sebagai berikut:\n• Intensitas penangkapan ikan: Tinggi\n• Kesadaran masyarakat: Rendah\n• Pengelolaan limbah: Buruk\n\nHasil menunjukkan bahwa populasi ikan menurun secara signifikan. Faktor manakah yang paling langsung menyebabkan penurunan populasi ikan?",
    options: [
      "Poor waste management",
      "High fishing intensity",
      "Cultural traditions",
      "Water entering from the sea",
    ],
    optionsIdn: [
      "Pengelolaan limbah yang buruk",
      "Intensitas penangkapan ikan yang tinggi",
      "Tradisi budaya",
      "Air yang masuk dari laut",
    ],
    correct: "High fishing intensity",
  },
  {
    id: 3,
    type: "mcq",
    question: "In another simulation, increasing community awareness leads to improved fish population over time. Why does increasing community awareness improve fish population?",
    questionIdn: "Dalam simulasi lain, peningkatan kesadaran masyarakat menyebabkan populasi ikan meningkat seiring waktu. Mengapa peningkatan kesadaran masyarakat dapat meningkatkan populasi ikan?",
    options: [
      "It directly increases fish reproduction without changing human behavior.",
      "It reduces overfishing behavior and supports more responsible use of marine resources.",
      "It raises salinity so fish can live longer.",
      "It removes all predators from the ecosystem.",
    ],
    optionsIdn: [
      "Hal ini secara langsung meningkatkan reproduksi ikan tanpa mengubah perilaku manusia.",
      "Hal ini mengurangi perilaku penangkapan berlebih (overfishing) dan mendukung pemanfaatan sumber daya laut yang lebih bertanggung jawab.",
      "Hal ini meningkatkan salinitas sehingga ikan dapat hidup lebih lama.",
      "Hal ini menghilangkan semua predator dari ekosistem.",
    ],
    correct: "It reduces overfishing behavior and supports more responsible use of marine resources.",
  },
  {
    id: 4,
    type: "mcq",
    question: "Two coastal communities show different results:\n\nCommunity A:\n• Fishing: High\n• Awareness: Low\n• Result: Fish decline\n\nCommunity B:\n• Fishing: Medium\n• Awareness: High\n• Result: Fish stable\n\nWhich conclusion best explains the difference?",
    questionIdn: "Dua komunitas pesisir menunjukkan hasil yang berbeda:\n\nKomunitas A:\n• Penangkapan Ikan: Tinggi\n• Kesadaran: Rendah\n• Hasil: Populasi ikan menurun\n\nKomunitas B:\n• Penangkapan Ikan: Sedang\n• Kesadaran: Tinggi\n• Hasil: Populasi ikan stabil\n\nBerdasarkan data tersebut, kesimpulan manakah yang paling tepat untuk menjelaskan perbedaan tersebut?",
    options: [
      "Fishing intensity has no effect on fish population.",
      "Cultural awareness can influence fishing behavior and marine sustainability.",
      "Marine ecosystems are controlled only by natural factors.",
      "Community traditions cannot affect the environment.",
    ],
    optionsIdn: [
      "Intensitas penangkapan ikan tidak berpengaruh terhadap populasi ikan.",
      "Kesadaran budaya dapat memengaruhi perilaku penangkapan ikan dan keberlanjutan laut.",
      "Ekosistem laut hanya dikendalikan oleh faktor alam.",
      "Tradisi masyarakat tidak dapat memengaruhi lingkungan.",
    ],
    correct: "Cultural awareness can influence fishing behavior and marine sustainability.",
  },
  {
    id: 5,
    type: "open",
    question: "The local government in Cirebon wants to improve marine sustainability. Write a short policy recommendation based on evidence from the simulation.\n\nYour recommendation should consider:\n• fishing intensity\n• community awareness\n• waste management\n• conservation efforts\n\nWriting guide: A strong answer should propose at least one specific policy action and explain how it would improve marine sustainability based on simulation evidence.",
    questionIdn: "Pemerintah daerah di Cirebon ingin meningkatkan keberlanjutan laut. Tuliskan rekomendasi kebijakan singkat berdasarkan bukti dari simulasi.\n\nRekomendasi Anda harus mempertimbangkan:\n• intensitas penangkapan ikan\n• kesadaran masyarakat\n• pengelolaan limbah\n• upaya konservasi\n\nPanduan Penulisan: Jawaban yang baik harus mengusulkan setidaknya satu tindakan kebijakan spesifik dan menjelaskan bagaimana tindakan tersebut akan meningkatkan keberlanjutan laut berdasarkan bukti simulasi.",
  },
];

export const examQuestionsUnit8: ExamQuestion[] = [];
export const examQuestionsUnit9: ExamQuestion[] = [];
export const examQuestionsUnit10: ExamQuestion[] = [];

export const getQuestionsForUnit = (unit: number): ExamQuestion[] => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(`admin_questions_unit_${unit}`) : null;
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse admin questions", e);
    }
  }

  const baseQuestions: Record<number, ExamQuestion[]> = {
    1: examQuestionsUnit1,
    2: examQuestionsUnit2,
    3: examQuestionsUnit3,
    4: examQuestionsUnit4,
    5: examQuestionsUnit5,
    6: examQuestionsUnit6,
    7: examQuestionsUnit7,
    8: examQuestionsUnit8,
    9: examQuestionsUnit9,
    10: examQuestionsUnit10,
  };

  return baseQuestions[unit] || [];
};

export const examQuestions = examQuestionsUnit2;
