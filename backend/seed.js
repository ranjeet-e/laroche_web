require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

const menuItems = [
  // ---------- SANDWICHES ----------
  {
    name: 'Bun Maska',
    category: 'Sandwiches',
    price: 25,
    imageUrl: '/menu-items/1_1_bun_maska_plain.png',
    variants: [
      { label: 'Plain', price: 25 },
      { label: 'Toast', price: 30 },
      { label: 'Jam', price: 40 },
    ],
  },
  {
    name: 'Bread Butter',
    category: 'Sandwiches',
    price: 25,
    imageUrl: '/menu-items/1_4_bread_butter_plain.png',
    variants: [
      { label: 'Plain', price: 25 },
      { label: 'Toast', price: 30 },
      { label: 'Jam', price: 40 },
    ],
  },
  {
    name: 'Vegetable Sandwich',
    category: 'Sandwiches',
    price: 50,
    imageUrl: '/menu-items/2_2_veg_sandwich_plain.png',
    variants: [
      { label: 'Plain', price: 50 },
      { label: 'Grill', price: 60 },
    ],
  },
  {
    name: 'Vegetable Cheese Sandwich',
    category: 'Sandwiches',
    price: 80,
    imageUrl: '/menu-items/2_4_veg_cheese_sandwich_plain.png',
    variants: [
      { label: 'Plain', price: 80 },
      { label: 'Toast', price: 90 },
    ],
  },
  {
    name: 'Vegetable Sandwich (Jain)',
    category: 'Sandwiches',
    price: 55,
    imageUrl: '/menu-items/3_1_jain_veg_sandwich_plain.png',
    variants: [
      { label: 'Plain', price: 55 },
      { label: 'Grill', price: 65 },
    ],
  },
  {
    name: 'Vegetable Cheese Sandwich (Jain)',
    category: 'Sandwiches',
    price: 90,
    imageUrl: '/menu-items/3_3_jain_veg_cheese_sandwich_plain.png',
    variants: [
      { label: 'Plain', price: 90 },
      { label: 'Toast', price: 100 },
    ],
  },
  { name: 'Bombay Toasty', category: 'Sandwiches', price: 70, imageUrl: '/menu-items/4_1_bombay_toasty.png' },
  { name: 'Paneer Tikka Toast', category: 'Sandwiches', price: 99, imageUrl: '/menu-items/4_2_paneer_tikka_toast.png' },
  { name: 'Chocolate Hazelnut', category: 'Sandwiches', price: 60, imageUrl: '/menu-items/4_3_chocolate_hazelnut.png' },

  // ---------- FLATBREAD PIZZA 8 INCH ----------
  { name: 'Plain Margherita', category: 'Flatbread Pizza', price: 99, imageUrl: '/menu-items/1_plain_margherita.png' },
  { name: 'Corn & Capsicum', category: 'Flatbread Pizza', price: 120, imageUrl: '/menu-items/2_corn_and_capsicum.png' },
  { name: 'Fiama', category: 'Flatbread Pizza', price: 110, imageUrl: '/menu-items/3_fiama.png' },
  { name: 'Tandoori Paneer', category: 'Flatbread Pizza', price: 130, imageUrl: '/menu-items/4_tandoori_paneer.png' },

  // ---------- QUICK BITES & CAFÉ SNACKS ----------
  { name: 'Loaded Nachos', category: 'Quick Bites & Café Snacks', price: 99, imageUrl: '/menu-items/1_loaded_nachos.png' },
  { name: 'French Fries', category: 'Quick Bites & Café Snacks', price: 60, imageUrl: '/menu-items/2_french_fries.png' },
  { name: 'Peri Peri Fries', category: 'Quick Bites & Café Snacks', price: 75, imageUrl: '/menu-items/3_peri_peri_fries.png' },
  {
    name: 'Plain Garlic Bread/Cheese',
    category: 'Quick Bites & Café Snacks',
    price: 50,
    imageUrl: '/menu-items/4_garlic_bread.png',
    variants: [
      { label: 'Plain', price: 50 },
      { label: 'Cheese', price: 80 },
    ],
  },
  { name: 'Chilli Cheese Toast', category: 'Quick Bites & Café Snacks', price: 80, imageUrl: '/menu-items/5_chilli_cheese_toast.png' },
  { name: 'Mexican Loaded Fries', category: 'Quick Bites & Café Snacks', price: 99, imageUrl: '/menu-items/7_mexican_loaded_fries.png' },

  // ---------- CHAT COUNTER ----------
  { name: 'Sev Puri', category: 'Chat Counter', price: 50, imageUrl: '/menu-items/sev_puri.jpg' },
  { name: 'Dahi Puri', category: 'Chat Counter', price: 60, imageUrl: '/menu-items/dahi_puri.png' },

  // ---------- ADD ONS ----------
  { name: 'Cheese', category: 'Add-ons', price: 20, imageUrl: '/menu-items/1_cheese.png' },
  { name: 'Mayonnaise', category: 'Add-ons', price: 20, imageUrl: '/menu-items/2_mayonnaise.png' },
  { name: 'Paneer', category: 'Add-ons', price: 30, imageUrl: '/menu-items/3_paneer.png' },
  { name: 'Brown Bread', category: 'Add-ons', price: 10, imageUrl: '/menu-items/4_brown_bread.png' },
  { name: 'Schewan Sauce', category: 'Add-ons', price: 20, imageUrl: '/menu-items/5_schezwan_sauce.png' },

  // ---------- MAGGIE ----------
  { name: 'Plain Maggie', category: 'Maggie', price: 50, imageUrl: '/menu-items/8_plain_maggi.png' },
  { name: 'Masala Maggie', category: 'Maggie', price: 70, imageUrl: '/menu-items/9_masala_maggi.png' },
  { name: 'Chilli Garlic Maggie', category: 'Maggie', price: 80, imageUrl: '/menu-items/10_chilli_garlic_maggi.png' },
  { name: 'Cheese Chilli Maggie', category: 'Maggie', price: 80, imageUrl: '/menu-items/11_cheese_chilli_maggi.png' },

  // ---------- PASTA ----------
  { name: 'Creamy Alfredo Pasta', category: 'Pasta', price: 130, imageUrl: '/menu-items/12_creamy_alfredo_pasta.png' },
  { name: 'Pasta Arrabiata', category: 'Pasta', price: 110, imageUrl: '/menu-items/13_pasta_arrabiata.png' },
  { name: 'Pink Sauce Pasta', category: 'Pasta', price: 130, imageUrl: '/menu-items/14_pink_sauce_pasta.png' },
  {
    name: 'Jain Pasta',
    category: 'Pasta',
    price: 150,
    imageUrl: '/menu-items/16_jain_pasta_red.png',
    variants: [
      { label: 'Red', price: 150 },
      { label: 'White', price: 150 },
      { label: 'Pink', price: 150 },
    ],
  },

  // ---------- MOCKTAILS & COOLERS ----------
  { name: 'Watermelon Juice', category: 'Mocktails & Coolers', price: 60, imageUrl: '/menu-items/1_watermelon_juice.png' },
  { name: 'Kokam Sarbat', category: 'Mocktails & Coolers', price: 30, imageUrl: '/menu-items/2_kokam_sarbat.png' },
  { name: 'Mosambi Juice', category: 'Mocktails & Coolers', price: 80, imageUrl: '/menu-items/3_mosambi_juice.png' },
  { name: 'Pineapple Juice', category: 'Mocktails & Coolers', price: 80, imageUrl: '/menu-items/4_pineapple_juice.png' },
  { name: 'Virgin Mojito', category: 'Mocktails & Coolers', price: 50, imageUrl: '/menu-items/5_virgin_mojito.png' },
  { name: 'Banana Shake', category: 'Mocktails & Coolers', price: 80, imageUrl: '/menu-items/6_banana_shake.png' },

  // ---------- COLD BEVERAGES ----------
  {
    name: 'Flavoured Cold Coffee',
    category: 'Cold Beverages',
    price: 80,
    imageUrl: '/menu-items/8_flavoured_cold_coffee.png',
    variants: [
      { label: 'Hazelnut', price: 80 },
      { label: 'Caramel', price: 80 },
      { label: 'Chocolate Cookie', price: 80 },
    ],
  },
  { name: 'Cold Chocolate', category: 'Cold Beverages', price: 70, imageUrl: '/menu-items/9_cold_chocolate.png' },
  { name: 'Lassi', category: 'Cold Beverages', price: 40, imageUrl: '/menu-items/10_lassi.png' },
  { name: 'Chass', category: 'Cold Beverages', price: 30, imageUrl: '/menu-items/11_chaas.png' },
  { name: 'Oreo Shake', category: 'Cold Beverages', price: 99, imageUrl: '/menu-items/12_oreo_shake.png' },
  { name: 'Belgian Chocolate Shake', category: 'Cold Beverages', price: 99, imageUrl: '/menu-items/13_belgian_chocolate_shake.png' },
  { name: 'Cold Coffee Frappe', category: 'Cold Beverages', price: 80, imageUrl: '/menu-items/7_cold_coffee_frappe.png' },
  { name: 'KitKat Shake', category: 'Cold Beverages', price: 99, imageUrl: '/menu-items/14_kitkat_shake.png' },
  { name: 'Caramel Frappe', category: 'Cold Beverages', price: 99, imageUrl: '/menu-items/15_caramel_frappe.png' },
  { name: 'Nutella Hazelnut Shake', category: 'Cold Beverages', price: 99, imageUrl: '/menu-items/16_nutella_hazelnut_shake.png' },
  {
    name: 'Ice Tea',
    category: 'Cold Beverages',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    variants: [
      { label: 'Peach', price: 50 },
      { label: 'Lemon', price: 50 },
    ],
  },

  // ---------- WAFFLES ----------
  { name: 'Plain Waffle', category: 'Waffles', price: 79, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80' },
  { name: 'Chocolate Waffle', category: 'Waffles', price: 99, imageUrl: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Nutella Waffle', category: 'Waffles', price: 120, imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&auto=format&fit=crop&q=80' },

  // ---------- HOT BEVERAGES ----------
  {
    name: 'Tea',
    category: 'Hot Beverages',
    price: 12,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80',
    variants: [
      { label: 'Masala', price: 12 },
      { label: 'Cardmom', price: 12 },
      { label: 'Lemongrass', price: 12 },
      { label: 'Lemon', price: 20 },
      { label: 'Green', price: 20 },
    ],
  },
  { name: 'Cappuccino - 120ml', category: 'Hot Beverages', price: 35, imageUrl: '/menu-items/1_cappuccino_120ml.png' },
  { name: 'Cafelatte - 120ml', category: 'Hot Beverages', price: 30, imageUrl: '/menu-items/2_cafelatte_120ml.png' },
  { name: 'Espresso/Black Coffee - 120ml', category: 'Hot Beverages', price: 25, imageUrl: '/menu-items/3_espresso_black_coffee_120ml.png' },
  { name: 'Americano', category: 'Hot Beverages', price: 25, imageUrl: '/menu-items/4_americano.png' },
  { name: 'Hot Chocolate - 150ml', category: 'Hot Beverages', price: 50, imageUrl: '/menu-items/5_hot_chocolate_150ml.png' },
  { name: 'Café Mocha - 150ml', category: 'Hot Beverages', price: 60, imageUrl: '/menu-items/6_cafe_mocha_150ml.png' },
  { name: 'Hot Soups', category: 'Hot Beverages', price: 40, imageUrl: '/menu-items/7_hot_soup_tomato.png' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items.');

    await MenuItem.insertMany(menuItems);
    console.log(`Seeded ${menuItems.length} menu items successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
