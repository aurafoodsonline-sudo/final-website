// Starter content written into an EMPTY database the first time the site starts.
// After that, everything here is edited from the admin panel — changing this file does not
// change a live site that already has data.

export const SEED_CATEGORIES = [
    ["red-chili-powder", "Red Chili Powder", "لال مرچ پاؤڈر"],
    ["turmeric-powder", "Turmeric Powder", "ہلدی پاؤڈر"],
    ["coriander-powder", "Coriander Powder", "دھنیا پاؤڈر"],
    ["garam-masala", "Garam Masala", "گرم مصالحہ"],
    ["premium-blends", "Premium Blends", "پریمیم بلینڈز"],
    ["salt-range", "Salt Range", "نمک رینج"],
  ];

export const SEED_PRODUCTS = [
    {
      slug: "kunri-red-chili", sku: "AURA-001", cat: "Red Chili Powder",
      nameEn: "Kunri Red Chili Powder (Pisi Lal Mirch)", nameUr: "کنری لال مرچ پاؤڈر (پسی لال مرچ)",
      taglineEn: "Hand-picked from Sindh", taglineUr: "سندھ سے دستی چنی گئی",
      descriptionEn: "Pure red chili powder sourced from Kunri, Sindh — the chili capital of Asia. Vibrant red color, rich aroma, and authentic heat. Stone-ground to preserve essential oils. No additives, no preservatives, no artificial colors.",
      descriptionUr: "کنری، سندھ سے حاصل کی گئی خالص لال مرچ پاؤڈر — ایشیا کا مرچ کا دارالحکومت۔ شاندار سرخ رنگ، بھرپور خوشبو اور اصل تیزی۔ قدرتی تیل برقرار رکھنے کے لیے پتھر پر پسی گئی۔ کوئی ملاوٹ، پریزرویٹو یا مصنوعی رنگ شامل نہیں۔",
      ingredientsEn: "100% Pure Red Chili (Capsicum annuum)", ingredientsUr: "100% خالص لال مرچ",
      usageEn: "Ideal for curries, BBQ marinades, and everyday cooking. Add 1 tsp per serving for perfect heat.", usageUr: "سالن، بار بی کیو میرینیڈ اور روزمرہ کھانوں کے لیے بہترین۔ فی سرونگ ایک چائے کا چمچ استعمال کریں۔",
      weightLabel: "200g", price: 199, image: "/images/products/product01.jpeg",
      bestSeller: 1, newArrival: 0, featured: 1, wholesalePrice: 850,
    },
    {
      slug: "golden-turmeric", sku: "AURA-002", cat: "Turmeric Powder",
      nameEn: "Golden Turmeric Powder (Pisi Haldi)", nameUr: "گولڈن ہلدی پاؤڈر (پسی ہلدی)",
      taglineEn: "Stone-ground pure turmeric", taglineUr: "پتھر پر پسی خالص ہلدی",
      descriptionEn: "High-curcumin turmeric powder stone-ground from premium Pakistani roots. Golden-yellow color with earthy aroma. Naturally anti-inflammatory and packed with antioxidants.",
      descriptionUr: "پاکستانی معیاری جڑوں سے پتھر پر پسی گئی اعلیٰ کرکیومن ہلدی پاؤڈر۔ سنہری زرد رنگ اور مٹی جیسی خوشبو۔",
      ingredientsEn: "100% Pure Turmeric Root (Curcuma longa)", ingredientsUr: "100% خالص ہلدی کی جڑ",
      usageEn: "Use in curries, milk (haldi doodh), and wellness drinks. Add 1/2 tsp daily.", usageUr: "سالن، ہلدی دودھ اور صحت کے مشروبات میں استعمال کریں۔ روزانہ آدھا چائے کا چمچ استعمال کریں۔",
      weightLabel: "200g", price: 180, image: "/images/products/product02.jpeg",
      bestSeller: 0, newArrival: 0, featured: 1, wholesalePrice: 780,
    },
    {
      slug: "fresh-coriander", sku: "AURA-003", cat: "Coriander Powder",
      nameEn: "Fresh Coriander Powder (Pisa Dhaniya)", nameUr: "تازہ دھنیا پاؤڈر (پسا دھنیا)",
      taglineEn: "Aromatic & finely milled", taglineUr: "خوشبودار اور باریک پسا ہوا",
      descriptionEn: "Finely ground coriander powder from select Pakistani farms. Citrusy aroma with mild, warming flavor. Freshly ground in small batches.",
      descriptionUr: "منتخب پاکستانی کھیتوں سے باریک پسا ہوا دھنیا پاؤڈر۔ لیموں جیسی خوشبو اور نرم ذائقہ۔",
      ingredientsEn: "100% Pure Coriander Seeds (Coriandrum sativum)", ingredientsUr: "100% خالص دھنیا کے بیج",
      usageEn: "Essential for dals, curries, and spice blends. Toast lightly before use for enhanced flavor.", usageUr: "دال، سالن اور مصالحوں کے لیے ضروری۔ ذائقہ بڑھانے کے لیے ہلکا سا بھون لیں۔",
      weightLabel: "200g", price: 160, image: "/images/products/product03.jpeg",
      bestSeller: 0, newArrival: 1, featured: 1, wholesalePrice: 690,
    },
    {
      slug: "black-pepper-powder", sku: "AURA-004", cat: "Premium Blends",
      nameEn: "Black Pepper Powder (Pisi Kali Mirch)", nameUr: "کالی مرچ پاؤڈر (پسی کالی مرچ)",
      taglineEn: "Freshly ground, bold & pungent", taglineUr: "تازہ پسی، تیز اور خوشبودار",
      descriptionEn: "Premium black pepper powder from carefully selected peppercorns. Bold, pungent aroma with a sharp kick. No fillers or additives.",
      descriptionUr: "احتیاط سے منتخب کی گئی کالی مرچ سے تیار پریمیم پاؤڈر۔ تیز خوشبو اور کڑک ذائقہ۔",
      ingredientsEn: "100% Pure Black Pepper (Piper nigrum)", ingredientsUr: "100% خالص کالی مرچ",
      usageEn: "Use as a table spice or in cooking. Add 1/4 tsp per serving.", usageUr: "کھانے کی میز پر یا پکانے میں استعمال کریں۔ فی سرونگ چوتھائی چائے کا چمچ استعمال کریں۔",
      weightLabel: "100g", price: 190, image: "/images/products/product09.jpeg",
      bestSeller: 0, newArrival: 1, featured: 1, wholesalePrice: 820,
    },
    {
      slug: "chaat-masala", sku: "AURA-005", cat: "Premium Blends",
      nameEn: "Tangy Chaat Masala", nameUr: "چٹ پٹا چاٹ مصالحہ",
      taglineEn: "Street-style zing", taglineUr: "سٹریٹ سٹائل ذائقہ",
      descriptionEn: "Zesty, tangy masala that brings authentic street food flavor to your home. Perfect for fruits, salads, yogurt, and snacks.",
      descriptionUr: "چٹ پٹا مصالحہ جو گھر میں اصل سٹریٹ فوڈ کا ذائقہ لاتا ہے۔ پھل، سلاد، دہی اور ناشتے کے لیے بہترین۔",
      ingredientsEn: "Cumin, Coriander, Mango Powder (Amchur), Black Salt, Red Chili, Ginger, Mint, Black Pepper, Citric Acid",
      ingredientsUr: "زیرہ، دھنیا، آملی پاؤڈر، کالا نمک، لال مرچ، ادرک، پودینہ، کالی مرچ",
      usageEn: "Sprinkle on fruit chaat, salads, yogurt, or grilled corn and roasted nuts.", usageUr: "فروٹ چاٹ، سلاد، دہی یا گرل شدہ مکئی اور بھنے ہوئے میوہ جات پر چھڑکیں۔",
      weightLabel: "100g", price: 140, image: "/images/products/product05.jpeg",
      bestSeller: 1, newArrival: 0, featured: 1, wholesalePrice: 600,
    },
    {
      slug: "pink-salt", sku: "AURA-006", cat: "Salt Range",
      nameEn: "Himalayan Pink Salt (Gulabi Namak)", nameUr: "ہمالیائی گلابی نمک",
      taglineEn: "Pure, mineral-rich rock salt", taglineUr: "خالص، معدنیات سے بھرپور نمک",
      descriptionEn: "Premium Himalayan pink salt mined from the Khewra Salt Mine. Rich in trace minerals including potassium, magnesium, and calcium. Chemical-free and unrefined.",
      descriptionUr: "کھیوڑہ نمک کان سے حاصل کیا گیا اعلیٰ ہمالیائی گلابی نمک۔ پوٹاشیم، میگنیشیم اور کیلشیم سے بھرپور۔",
      ingredientsEn: "100% Natural Himalayan Pink Salt", ingredientsUr: "100% قدرتی ہمالیائی گلابی نمک",
      usageEn: "Use as a finishing salt, in cooking, or in salt grinders. Replace regular table salt.", usageUr: "کھانے پکانے یا فنشنگ نمک کے طور پر استعمال کریں۔",
      weightLabel: "200g", price: 120, image: "/images/products/product06.jpeg",
      bestSeller: 0, newArrival: 0, featured: 0, wholesalePrice: 520,
    },
    {
      slug: "rock-salt", sku: "AURA-007", cat: "Salt Range",
      nameEn: "Rock Salt (Kala Namak)", nameUr: "کالا نمک",
      taglineEn: "Authentic sulfurous mineral salt", taglineUr: "اصل گندھک والا معدنی نمک",
      descriptionEn: "Traditional black mineral salt with characteristic sulfurous aroma. A staple in chaat, raita, and chutneys.",
      descriptionUr: "روایتی کالا معدنی نمک جس میں گندھک جیسی مخصوص خوشبو ہے۔ چاٹ، رائتہ اور چٹنی میں بنیادی جزو۔",
      ingredientsEn: "100% Natural Black Mineral Salt", ingredientsUr: "100% قدرتی کالا معدنی نمک",
      usageEn: "Crush before use. Essential for chaat masala, fruit salads, raita, and chutneys.", usageUr: "استعمال سے پہلے پیس لیں۔ چاٹ مصالحہ، فروٹ سلاد، رائتہ اور چٹنی کے لیے ضروری۔",
      weightLabel: "200g", price: 110, image: "/images/products/product07.jpeg",
      bestSeller: 0, newArrival: 0, featured: 0, wholesalePrice: 480,
    },
    {
      slug: "royal-garam-masala", sku: "AURA-008", cat: "Garam Masala",
      nameEn: "Royal Garam Masala", nameUr: "رائل گرم مصالحہ",
      taglineEn: "Heritage 14-spice blend", taglineUr: "روایتی 14 مصالحوں کا امتزاج",
      descriptionEn: "Our signature blend of 14 hand-roasted and stone-ground spices. Each batch is slow-roasted to unlock deep, complex flavors. No preservatives or artificial colors.",
      descriptionUr: "ہمارا خاص امتزاج جو 14 ہاتھ سے بھنے اور پتھر پر پسے مصالحوں پر مشتمل ہے۔ ہر بیچ آہستہ آہستہ بھونا جاتا ہے۔",
      ingredientsEn: "Cardamom, Cinnamon, Cloves, Cumin, Nutmeg, Mace, Black Pepper, Bay Leaf, Star Anise, Fennel, Coriander, Ginger, White Pepper",
      ingredientsUr: "الائچی، دار چینی، لونگ، زیرہ، جوز پھل، کالی مرچ، تیج پات، ستارہ سونف، سونف، دھنیا، ادرک",
      usageEn: "Add at the end of cooking for maximum aroma. Perfect for biryani, curries, korma, and lentil dishes.", usageUr: "زیادہ خوشبو کے لیے کھانا پکانے کے آخر میں شامل کریں۔ بریانی، سالن، قورمہ اور دال کے لیے بہترین۔",
      weightLabel: "100g", price: 250, image: "/images/products/product08.jpeg",
      bestSeller: 1, newArrival: 0, featured: 1, wholesalePrice: 1080,
    },
  ];

export const SEED_SUPPLIERS = [
  { name: "Kunri Farms Co-operative", contact: "+92 300 1234567", address: "Kunri, Umerkot, Sindh", suppliedMaterials: "Red Chili, Turmeric", paymentType: "credit", notes: "Primary chili & turmeric supplier." },
  { name: "Khewra Salt Traders", contact: "+92 301 7654321", address: "Khewra, Punjab", suppliedMaterials: "Pink Salt, Rock Salt", paymentType: "cash", notes: "Salt range supplier." },
];

export const SEED_RAW_MATERIALS = ["Red Chilli", "Turmeric", "Coriander", "Black Pepper", "Cumin", "Rock Salt", "Pink Salt"];

// Business details, social links and delivery — all editable in Admin → Settings.
export const SEED_SETTINGS: [string, string][] = [
  ["site_name", "Aura Foods"],
  ["tagline", "Crafted for Pure Taste"],
  ["phone", "+92 301 2730116"],
  ["whatsapp", "923012730116"],
  ["email", "aurafoodsonline@gmail.com"],
  ["city", "Karachi"],
  ["address", "Karachi, Pakistan"],
  ["instagram", "https://instagram.com/aurafoodsonline"],
  ["facebook", "https://facebook.com/share/1Ctuc2U2rj/"],
  ["tiktok", "https://tiktok.com/@aurafoodsonline"],
  ["youtube", ""],
  ["daraz", "https://daraz.pk/shop/d-mall-23/"],
  ["partner_farms", "50"],
  ["delivery_charge", "150"],
  ["free_delivery_from", "1500"],
  ["whatsapp_automation_enabled", "true"],
  ["whatsapp_template", "Hi {{customer_name}}, thank you for your order #{{order_number}} from Aura Foods!"],
];

type Pair = [string, string];
type Bilingual = { en: Pair; ur: Pair };
type Tri = { en: [string, string, string]; ur: [string, string, string] };

export const SEED_WHY: Bilingual[] = [
  { en: ["100% Organic", "Sourced from trusted Pakistani farms without synthetic chemicals."], ur: ["100% آرگینک", "قابلِ اعتماد پاکستانی کھیتوں سے حاصل شدہ، کیمیکل سے پاک۔"] },
  { en: ["No Preservatives", "Nothing artificial added. Ever. Just pure spice."], ur: ["کوئی پریزرویٹو نہیں", "کبھی بھی مصنوعی چیز شامل نہیں۔ صرف خالص مصالحہ۔"] },
  { en: ["No Artificial Colors", "Pure pigment comes from the spice itself."], ur: ["کوئی مصنوعی رنگ نہیں", "خالص رنگ مصالحے سے ہی آتا ہے۔"] },
  { en: ["Hygienically Packed", "Sealed in food-grade facilities with strict quality control."], ur: ["حفظان صحت کے ساتھ پیک", "فوڈ گریڈ سہولیات میں سختی سے پیک شدہ۔"] },
  { en: ["Fast Delivery", "Across Pakistan in 2-4 business days. Track your order."], ur: ["تیز ڈیلیوری", "پاکستان بھر میں 2-4 دنوں میں۔ آرڈر ٹریک کریں۔"] },
  { en: ["Fresh Aroma", "Ground in small batches weekly to preserve essential oils."], ur: ["تازہ خوشبو", "ہر ہفتے چھوٹے بیچوں میں پیسا جاتا ہے۔"] },
];

export const SEED_TESTIMONIALS: Tri[] = [
  { en: ["Ayesha K.", "Karachi", "The Kunri chili is unreal — the colour, the aroma, exactly what my mother used to buy from the village."], ur: ["عائشہ ک.", "کراچی", "کنری کی مرچ بے مثال ہے — رنگ، خوشبو، بالکل ویسی جیسی امی گاؤں سے خریدتی تھیں۔"] },
  { en: ["Bilal R.", "Lahore", "Switched my whole pantry to Aura. The garam masala makes a difference you can smell from the next room."], ur: ["بلال ر.", "لاہور", "اپنا سارا پینٹری آورا پر شفٹ کر دیا۔ گرم مصالحہ کی خوشبو دور سے آتی ہے۔"] },
  { en: ["Sana M.", "Islamabad", "Beautifully packed, super fresh, and delivered in two days."], ur: ["ثناء م.", "اسلام آباد", "خوبصورت پیکنگ، بہت تازہ، اور دو دن میں ڈیلیوری۔"] },
];

export const SEED_VALUES: Bilingual[] = [
  { en: ["100% Organic", "Sourced from trusted Pakistani farms without synthetic chemicals."], ur: ["100% آرگینک", "قابلِ اعتماد پاکستانی کھیتوں سے، کیمیکل سے پاک۔"] },
  { en: ["No Preservatives", "Nothing artificial added. Ever."], ur: ["کوئی پریزرویٹو نہیں", "کبھی مصنوعی چیز شامل نہیں۔"] },
  { en: ["Hygienically Packed", "Sealed in food-grade facilities."], ur: ["حفظان صحت کے ساتھ پیک", "فوڈ گریڈ سہولیات میں پیک شدہ۔"] },
];

export const SEED_BLOG_POSTS: (Bilingual & { slug: string; category: string; read: string })[] = [
  { slug: "turmeric-benefits", category: "Wellness", read: "4 min", en: ["The Health Benefits of Daily Turmeric", "Why a daily pinch of golden turmeric has been a household staple for generations."], ur: ["روزانہ ہلدی کے صحت کے فوائد", "روزانہ ایک چٹکی سنہری ہلدی نسلوں سے گھروں کا حصہ کیوں رہی ہے۔"] },
  { slug: "bbq-spices", category: "Cooking", read: "6 min", en: ["Best Spices for the Perfect BBQ Night", "The blends that turn an ordinary grill night into something people remember."], ur: ["بہترین بار بی کیو نائٹ کے مصالحے", "وہ امتزاج جو عام گرل نائٹ کو یادگار بنا دیتے ہیں۔"] },
  { slug: "spice-heritage", category: "Heritage", read: "5 min", en: ["Inside Our Spice Heritage", "How Aura Foods traces every spice back to the farms and mills we trust."], ur: ["ہماری مصالحہ وراثت کی جھلک", "آورا فوڈز ہر مصالحے کو قابلِ اعتماد فارمز اور چکیوں تک کیسے ٹریس کرتا ہے۔"] },
];

export const SEED_FAQS: Bilingual[] = [
  { en: ["How is delivery calculated?", "{delivery_rule} The exact total is always shown at checkout before you order."], ur: ["ڈیلیوری کیسے شمار ہوتی ہے؟", "{delivery_rule} آرڈر سے پہلے چیک آؤٹ پر مکمل رقم دکھائی جاتی ہے۔"] },
  { en: ["Can I track my order?", "Yes. Use the Track Order page with your order reference and phone number."], ur: ["کیا میں اپنا آرڈر ٹریک کر سکتا ہوں؟", "جی ہاں۔ آرڈر نمبر اور فون نمبر کے ساتھ ٹریک آرڈر صفحہ استعمال کریں۔"] },
  { en: ["Can food products be returned?", "Returns are reviewed for unopened, damaged, or incorrectly supplied products per our return policy."], ur: ["کیا کھانے کی مصنوعات واپس کی جا سکتی ہیں؟", "غیر کھلی، خراب یا غلط بھیجی گئی مصنوعات کی واپسی کا جائزہ ہماری پالیسی کے تحت لیا جاتا ہے۔"] },
  { en: ["How do I request support?", "Use the Support page, or message us on WhatsApp with your order number."], ur: ["سپورٹ کیسے حاصل کروں؟", "سپورٹ صفحہ استعمال کریں، یا اپنے آرڈر نمبر کے ساتھ واٹس ایپ پر پیغام بھیجیں۔"] },
  { en: ["How should spices be stored?", "Keep spices sealed, dry, and away from sunlight, heat, and moisture."], ur: ["مصالحوں کو کیسے محفوظ رکھا جائے؟", "مصالحوں کو بند، خشک اور سورج کی روشنی، حرارت اور نمی سے دور رکھیں۔"] },
];

export const SEED_PAGES: Record<string, Bilingual> = {
  "privacy-policy": {
    en: ["Privacy Policy", "Aura Foods collects only the information needed to process and deliver your order (name, phone, address, email). We do not sell customer data to third parties."],
    ur: ["پرائیویسی پالیسی", "آورا فوڈز صرف آپ کا آرڈر مکمل کرنے کے لیے درکار معلومات جمع کرتا ہے (نام، فون، پتہ، ای میل)۔ ہم صارف کا ڈیٹا فروخت نہیں کرتے۔"],
  },
  "return-policy": {
    en: ["Return & Refund Policy", "Unopened, damaged, or incorrectly supplied items are eligible for review within 3 days of delivery. Contact support with your order number."],
    ur: ["واپسی اور رقم کی واپسی کی پالیسی", "غیر کھلی، خراب یا غلط بھیجی گئی اشیاء ڈیلیوری کے 3 دن کے اندر جائزے کے لیے اہل ہیں۔"],
  },
  "shipping-policy": {
    en: ["Shipping Policy", "We deliver across Pakistan, usually within 2-4 business days. {delivery_rule} The exact total is shown at checkout."],
    ur: ["شپنگ پالیسی", "ہم پاکستان بھر میں عام طور پر 2 سے 4 کاروباری دنوں میں ڈیلیوری کرتے ہیں۔ {delivery_rule}"],
  },
  "terms": {
    en: ["Terms & Conditions", "By placing an order with Aura Foods you agree to our order confirmation, payment, and delivery processes as described on this site."],
    ur: ["شرائط و ضوابط", "آورا فوڈز کے ساتھ آرڈر دے کر آپ ہماری آرڈر کنفرمیشن، ادائیگی اور ڈیلیوری کی شرائط سے اتفاق کرتے ہیں۔"],
  },
};
