import "./init";
import { db } from "./index";
import { categories, products, suppliers, rawMaterials, adminUsers, settings, orders, orderItems } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) {
    console.log("Already seeded — skipping.");
    return;
  }

  const cats = [
    ["red-chili-powder", "Red Chili Powder", "لال مرچ پاؤڈر"],
    ["turmeric-powder", "Turmeric Powder", "ہلدی پاؤڈر"],
    ["coriander-powder", "Coriander Powder", "دھنیا پاؤڈر"],
    ["garam-masala", "Garam Masala", "گرم مصالحہ"],
    ["premium-blends", "Premium Blends", "پریمیم بلینڈز"],
    ["salt-range", "Salt Range", "نمک رینج"],
  ];
  const catIds: Record<string, number> = {};
  for (let i = 0; i < cats.length; i++) {
    const [slug, en, ur] = cats[i];
    const [row] = await db
      .insert(categories)
      .values({ slug, nameEn: en, nameUr: ur, sortOrder: i, image: `/images/category_${i + 1}.jpg` })
      .returning();
    catIds[en] = row.id;
  }

  const prods = [
    {
      slug: "kunri-red-chili", sku: "AURA-001", cat: "Red Chili Powder",
      nameEn: "Kunri Red Chili Powder (Pisi Lal Mirch)", nameUr: "کنری لال مرچ پاؤڈر (پسی لال مرچ)",
      taglineEn: "Hand-picked from Sindh", taglineUr: "سندھ سے دستی چنی گئی",
      descriptionEn: "Pure red chili powder sourced from Kunri, Sindh — the chili capital of Asia. Vibrant red color, rich aroma, and authentic heat. Stone-ground to preserve essential oils. No additives, no preservatives, no artificial colors.",
      descriptionUr: "کنری، سندھ سے حاصل کی گئی خالص لال مرچ پاؤڈر — ایشیا کا مرچ کا دارالحکومت۔ شاندار سرخ رنگ، بھرپور خوشبو اور اصل تیزی۔ قدرتی تیل برقرار رکھنے کے لیے پتھر پر پسی گئی۔ کوئی ملاوٹ، پریزرویٹو یا مصنوعی رنگ شامل نہیں۔",
      ingredientsEn: "100% Pure Red Chili (Capsicum annuum)", ingredientsUr: "100% خالص لال مرچ",
      usageEn: "Ideal for curries, BBQ marinades, and everyday cooking. Add 1 tsp per serving for perfect heat.", usageUr: "سالن، بار بی کیو میرینیڈ اور روزمرہ کھانوں کے لیے بہترین۔ فی سرونگ ایک چائے کا چمچ استعمال کریں۔",
      weightLabel: "200g", price: 199, oldPrice: 249, image: "/images/products/product01.jpeg",
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
      weightLabel: "200g", price: 180, oldPrice: 220, image: "/images/products/product02.jpeg",
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
      weightLabel: "200g", price: 160, oldPrice: 190, image: "/images/products/product03.jpeg",
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
      weightLabel: "100g", price: 190, oldPrice: 230, image: "/images/products/product09.jpeg",
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
      weightLabel: "100g", price: 140, oldPrice: 170, image: "/images/products/product05.jpeg",
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
      weightLabel: "200g", price: 120, oldPrice: 150, image: "/images/products/product06.jpeg",
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
      weightLabel: "200g", price: 110, oldPrice: 140, image: "/images/products/product07.jpeg",
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
      weightLabel: "100g", price: 250, oldPrice: 300, image: "/images/products/product08.jpeg",
      bestSeller: 1, newArrival: 0, featured: 1, wholesalePrice: 1080,
    },
  ];

  for (const p of prods) {
    await db.insert(products).values({
      slug: p.slug, sku: p.sku, categoryId: catIds[p.cat],
      nameEn: p.nameEn, nameUr: p.nameUr,
      taglineEn: p.taglineEn, taglineUr: p.taglineUr,
      descriptionEn: p.descriptionEn, descriptionUr: p.descriptionUr,
      ingredientsEn: p.ingredientsEn, ingredientsUr: p.ingredientsUr,
      usageEn: p.usageEn, usageUr: p.usageUr,
      weightLabel: p.weightLabel, price: p.price, oldPrice: p.oldPrice, image: p.image,
      bestSeller: p.bestSeller, newArrival: p.newArrival, featured: p.featured,
      wholesaleEligible: 1, wholesalePrice: p.wholesalePrice,
      websiteStockStatus: "available", internalStockQty: 0,
      metaTitleEn: `${p.nameEn} | Aura Foods`, metaTitleUr: `${p.nameUr} | آورا فوڈز`,
      metaDescriptionEn: p.taglineEn, metaDescriptionUr: p.taglineUr,
      imageAltEn: p.nameEn, imageAltUr: p.nameUr,
    });
  }

  // Reference suppliers / raw materials (starter records, real ledgers entered by staff)
  const [supplier1] = await db.insert(suppliers).values({
    name: "Kunri Farms Co-operative", contact: "+92 300 1234567", address: "Kunri, Umerkot, Sindh",
    suppliedMaterials: "Red Chili, Turmeric", paymentType: "credit", notes: "Primary chili & turmeric supplier.",
  }).returning();
  await db.insert(suppliers).values({
    name: "Khewra Salt Traders", contact: "+92 301 7654321", address: "Khewra, Punjab",
    suppliedMaterials: "Pink Salt, Rock Salt", paymentType: "cash", notes: "Salt range supplier.",
  });

  for (const name of ["Red Chilli", "Turmeric", "Coriander", "Black Pepper", "Cumin", "Rock Salt", "Pink Salt"]) {
    await db.insert(rawMaterials).values({ name, unit: "kg", stockQty: 0 });
  }

  const passwordHash = await bcrypt.hash("AuraAdmin@2026", 10);
  await db.insert(adminUsers).values({ username: "admin", passwordHash, name: "Aura Foods Admin" });

  const siteSettings: [string, string][] = [
    ["site_name", "Aura Foods"],
    ["tagline", "Crafted for Pure Taste"],
    ["phone", "+92 301 2730116"],
    ["whatsapp", "923012730116"],
    ["email", "aurafoodsonline@gmail.com"],
    ["city", "Karachi"],
    ["instagram", "https://instagram.com/aurafoodsonline"],
    ["facebook", "https://facebook.com/share/1Ctuc2U2rj/"],
    ["tiktok", "https://tiktok.com/@aurafoodsonline"],
    ["daraz", "https://daraz.pk/shop/d-mall-23/"],
    ["whatsapp_automation_enabled", "true"],
    ["whatsapp_template", "Hi {{customer_name}}, thank you for your order #{{order_number}} from Aura Foods!\n\n{{items}}\nSubtotal: Rs. {{subtotal}}\nDelivery: Rs. {{delivery_charges}}\nTotal: Rs. {{total}}\nPayment: {{payment_method}}\nDeliver to: {{address}}\nDate: {{order_date}}\n\nReply YES to confirm or NO to cancel."],
  ];
  for (const [key, value] of siteSettings) {
    await db.insert(settings).values({ key, value });
  }

  console.log("Seed complete. Admin login: admin / AuraAdmin@2026");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
