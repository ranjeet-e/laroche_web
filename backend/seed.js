require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');

// Fallback images for categories/items not individually covered
const categoryFallback = {
  'Add-ons': 'https://images.unsplash.com/photo-1631206753348-db44968fd440?w=400&q=80',
};

const menuItems = [
  // ---------- SANDWICHES ----------
  {
    name: 'Bun Maska',
    category: 'Sandwiches',
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80',
    variants: [
      { label: 'Plain', price: 50 },
      { label: 'Grill', price: 60 },
    ],
  },
  {
    name: 'Vegetable Cheese Sandwich',
    category: 'Sandwiches',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&q=80',
    variants: [
      { label: 'Plain', price: 80 },
      { label: 'Toast', price: 90 },
    ],
  },
  {
    name: 'Vegetable Sandwich (Jain)',
    category: 'Sandwiches',
    price: 55,
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=80',
    variants: [
      { label: 'Plain', price: 55 },
      { label: 'Grill', price: 65 },
    ],
  },
  {
    name: 'Vegetable Cheese Sandwich (Jain)',
    category: 'Sandwiches',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=80',
    variants: [
      { label: 'Plain', price: 90 },
      { label: 'Toast', price: 100 },
    ],
  },
  { name: 'Bombay Toasty', category: 'Sandwiches', price: 70, imageUrl: 'https://images.unsplash.com/photo-1603046891726-36bfd957e0bf?w=400&q=80' },
  { name: 'Paneer Tikka Toast', category: 'Sandwiches', price: 99, imageUrl: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400&q=80' },
  { name: 'Chocolate Hazelnut', category: 'Sandwiches', price: 60, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },

  // ---------- FLATBREAD PIZZA 8 INCH ----------
  { name: 'Plain Margherita', category: 'Flatbread Pizza', price: 99, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80' },
  { name: 'Corn & Capsicum', category: 'Flatbread Pizza', price: 120, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' },
  { name: 'Fiama', category: 'Flatbread Pizza', price: 110, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
  { name: 'Tandoori Paneer', category: 'Flatbread Pizza', price: 130, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },

  // ---------- QUICK BITES & CAFÉ SNACKS ----------
  { name: 'Loaded Nachos', category: 'Quick Bites & Café Snacks', price: 99, imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80' },
  { name: 'French Fries', category: 'Quick Bites & Café Snacks', price: 60, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&q=80' },
  { name: 'Peri Peri Fries', category: 'Quick Bites & Café Snacks', price: 75, imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&q=80' },
  {
    name: 'Plain Garlic Bread/Cheese',
    category: 'Quick Bites & Café Snacks',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&q=80',
    variants: [
      { label: 'Plain', price: 50 },
      { label: 'Cheese', price: 80 },
    ],
  },
  { name: 'Chilli Cheese Toast', category: 'Quick Bites & Café Snacks', price: 80, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80' },
  { name: 'Mexican Loaded Fries', category: 'Quick Bites & Café Snacks', price: 99, imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&q=80' },

  // ---------- CHAT COUNTER ----------
  { name: 'Sev Puri', category: 'Chat Counter', price: 50, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { name: 'Dahi Puri', category: 'Chat Counter', price: 60, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80' },

  // ---------- ADD ONS ----------
  { name: 'Cheese', category: 'Add-ons', price: 20, imageUrl: categoryFallback['Add-ons'] },
  { name: 'Mayonnaise', category: 'Add-ons', price: 20, imageUrl: categoryFallback['Add-ons'] },
  { name: 'Paneer', category: 'Add-ons', price: 30, imageUrl: categoryFallback['Add-ons'] },
  { name: 'Brown Bread', category: 'Add-ons', price: 10, imageUrl: categoryFallback['Add-ons'] },
  { name: 'Schewan Sauce', category: 'Add-ons', price: 20, imageUrl: categoryFallback['Add-ons'] },

  // ---------- MAGGIE ----------
  { name: 'Plain Maggie', category: 'Maggie', price: 50, imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80' },
  { name: 'Masala Maggie', category: 'Maggie', price: 70, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
  { name: 'Chilli Garlic Maggie', category: 'Maggie', price: 80, imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
  { name: 'Cheese Chilli Maggie', category: 'Maggie', price: 80, imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80' },

  // ---------- PASTA ----------
  { name: 'Creamy Alfredo Pasta', category: 'Pasta', price: 130, imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&q=80' },
  { name: 'Pasta Arrabiata', category: 'Pasta', price: 110, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281286?w=400&q=80' },
  { name: 'Pink Sauce Pasta', category: 'Pasta', price: 130, imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80' },
  {
    name: 'Jain Pasta',
    category: 'Pasta',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b280806d?w=400&q=80',
    variants: [
      { label: 'Red', price: 150 },
      { label: 'White', price: 150 },
      { label: 'Pink', price: 150 },
    ],
  },

  // ---------- MOCKTAILS & COOLERS ----------
  { name: 'Watermelon Juice', category: 'Mocktails & Coolers', price: 60, imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400&q=80' },
  { name: 'Kokam Sarbat', category: 'Mocktails & Coolers', price: 30, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80' },
  { name: 'Mosambi Juice', category: 'Mocktails & Coolers', price: 80, imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80' },
  { name: 'Pineapple Juice', category: 'Mocktails & Coolers', price: 80, imageUrl: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&q=80' },
  { name: 'Virgin Mojito', category: 'Mocktails & Coolers', price: 50, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80' },
  { name: 'Banana Shake', category: 'Mocktails & Coolers', price: 80, imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80' },

  // ---------- COLD BEVERAGES ----------
  {
    name: 'Flavoured Cold Coffee',
    category: 'Cold Beverages',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80',
    variants: [
      { label: 'Hazelnut', price: 80 },
      { label: 'Caramel', price: 80 },
      { label: 'Chocolate Cookie', price: 80 },
    ],
  },
  { name: 'Cold Chocolate', category: 'Cold Beverages', price: 70, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80' },
  { name: 'Lassi', category: 'Cold Beverages', price: 40, imageUrl: 'https://images.unsplash.com/photo-1528733918455-5a59687cedf0?w=400&q=80' },
  { name: 'Chass', category: 'Cold Beverages', price: 30, imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&q=80' },
  { name: 'Oreo Shake', category: 'Cold Beverages', price: 99, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80' },
  { name: 'Belgian Chocolate Shake', category: 'Cold Beverages', price: 99, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80' },
  { name: 'Cold Coffee Frappe', category: 'Cold Beverages', price: 80, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
  { name: 'KitKat Shake', category: 'Cold Beverages', price: 99, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
  { name: 'Caramel Frappe', category: 'Cold Beverages', price: 99, imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80' },
  { name: 'Nutella Hazelnut Shake', category: 'Cold Beverages', price: 99, imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&q=80' },
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
  { name: 'Plain Waffle', category: 'Waffles', price: 79, imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80' },
  { name: 'Chocolate Waffle', category: 'Waffles', price: 99, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&q=80' },
  { name: 'Nutella Waffle', category: 'Waffles', price: 120, imageUrl: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=400&q=80' },

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
  { name: 'Cappuccino - 120ml', category: 'Hot Beverages', price: 35, imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80' },
  { name: 'Cafelatte - 120ml', category: 'Hot Beverages', price: 30, imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80' },
  { name: 'Espresso/Black Coffee - 120ml', category: 'Hot Beverages', price: 25, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80' },
  { name: 'Americano', category: 'Hot Beverages', price: 25, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80' },
  { name: 'Hot Chocolate - 150ml', category: 'Hot Beverages', price: 50, imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&q=80' },
  { name: 'Café Mocha - 150ml', category: 'Hot Beverages', price: 60, imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&q=80' },
  { name: 'Hot Soups', category: 'Hot Beverages', price: 40, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' },
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