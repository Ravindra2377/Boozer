// ============================================================================
// BOOZER · MIDNIGHT GOLD & NEON LUXURY MOCK DATA
// Pilot: Hyderabad (Jubilee Hills & Banjara Hills Zone)
// ============================================================================

export const MOCK_RETAILER = {
  id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44",
  storeName: "Jubilee Hills Reserve Spirits",
  legalEntityName: "Apex Luxury Vintners & Retail Ltd.",
  licenceNumber: "TS/EXCISE/HYD/2026/0481",
  licenceState: "TELANGANA",
  exciseZone: "HYDERABAD_CENTRAL_ZONE_2",
  address: "Road No. 36, Jubilee Hills, Hyderabad",
  pincode: "500033",
  operatingHours: "10:00 AM – 10:00 PM",
  closesInMinutes: 120,
  isOpenNow: true,
  deliveryRadiusKm: 6.5,
  payoutAccount: "acc_rzp_route_89124",
  rating: 4.9,
  verifiedBadge: "Telangana Excise Licensed L-2"
};

export const MOCK_PRODUCTS = [
  {
    id: "prod-jd",
    name: "Jack Daniel's Old No. 7",
    brand: "Jack Daniel's",
    category: "WHISKY",
    abv: 40.0,
    volumeMl: 750,
    priceLegalMrp: 2999.00,
    stockQuantity: 28,
    isInStock: true,
    rating: 4.9,
    reviewsCount: 840,
    imageUrl: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=600&q=80",
    description: "Mellowed drop by drop through 10 feet of sugar maple charcoal and matured in handcrafted white oak barrels.",
    tastingNotes: "Caramel, vanilla, toasted oak, smooth charcoal finish",
    minAge: 21,
    featured: true
  },
  {
    id: "prod-heineken",
    name: "Heineken Premium Lager",
    brand: "Heineken",
    category: "BEER",
    abv: 5.0,
    volumeMl: 650,
    priceLegalMrp: 1499.00,
    stockQuantity: 42,
    isInStock: true,
    rating: 4.8,
    reviewsCount: 620,
    imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80",
    description: "Pure 100% barley malt, water, hops, and unique A-yeast brewed horizontally for signature clarity.",
    tastingNotes: "Clean, crisp, subtle fruit notes, balanced bitterness",
    minAge: 21,
    featured: true
  },
  {
    id: "prod-jw-black",
    name: "Johnnie Walker Black Label 12Y",
    brand: "Johnnie Walker",
    category: "WHISKY",
    abv: 40.0,
    volumeMl: 750,
    priceLegalMrp: 3450.00,
    stockQuantity: 20,
    isInStock: true,
    rating: 4.9,
    reviewsCount: 920,
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
    description: "An iconic blend of over 29 single malt and grain whiskies from the four corners of Scotland.",
    tastingNotes: "Sweet vanilla, dark fruits, creamy toffee, signature smoky finish",
    minAge: 21,
    featured: true
  },
  {
    id: "prod-bira",
    name: "Bira 91 White Craft Beer",
    brand: "Bira 91",
    category: "BEER",
    abv: 4.9,
    volumeMl: 330,
    priceLegalMrp: 180.00,
    stockQuantity: 60,
    isInStock: true,
    rating: 4.7,
    reviewsCount: 310,
    imageUrl: "https://images.unsplash.com/photo-1608270118837-17e909a80e1b?auto=format&fit=crop&w=600&q=80",
    description: "Low bitterness wheat beer crafted with citrus coriander seeds and Valencia orange peel.",
    tastingNotes: "Citrus, light spice, crisp finish",
    minAge: 21
  },
  {
    id: "prod-grey-goose",
    name: "Grey Goose French Vodka",
    brand: "Grey Goose",
    category: "VODKA",
    abv: 40.0,
    volumeMl: 750,
    priceLegalMrp: 3800.00,
    stockQuantity: 16,
    isInStock: true,
    rating: 4.9,
    reviewsCount: 420,
    imageUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80",
    description: "Distilled in Cognac, France, from soft winter wheat and limestone spring water.",
    tastingNotes: "Silky, delicate almond sweetness, crystal finish",
    minAge: 21
  },
  {
    id: "prod-stranger",
    name: "Stranger & Sons Goa Gin",
    brand: "Third Eye Distillery",
    category: "GIN",
    abv: 42.8,
    volumeMl: 750,
    priceLegalMrp: 2100.00,
    stockQuantity: 24,
    isInStock: true,
    rating: 4.9,
    reviewsCount: 240,
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    description: "Distilled with Indian botanicals including black pepper, coriander, and fresh citrus peels.",
    tastingNotes: "Warm spice, zesty citrus, nutmeg aromatics",
    minAge: 21
  },
  {
    id: "prod-sula",
    name: "Sula Rasa Cabernet Sauvignon",
    brand: "Sula Vineyards",
    category: "WINE",
    abv: 13.5,
    volumeMl: 750,
    priceLegalMrp: 1450.00,
    stockQuantity: 18,
    isInStock: true,
    rating: 4.8,
    reviewsCount: 195,
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80",
    description: "Oak-aged reserve red wine produced from Dindori estate with notes of dark berries.",
    tastingNotes: "Blackcurrant, toasted oak, velvety tannins",
    minAge: 21
  },
  {
    id: "prod-don-julio",
    name: "Don Julio Reposado Tequila",
    brand: "Don Julio",
    category: "TEQUILA",
    abv: 38.0,
    volumeMl: 750,
    priceLegalMrp: 5400.00,
    stockQuantity: 8,
    isInStock: true,
    rating: 5.0,
    reviewsCount: 115,
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
    description: "Aged for eight months in American white oak barrels, with an inviting golden hue.",
    tastingNotes: "Dark chocolate, cinnamon, rich vanilla, smooth agave",
    minAge: 21
  }
];

export const INITIAL_USER = {
  id: "usr-panvi-491",
  fullName: "Panvi",
  phone: "+91 98765 43210",
  dateOfBirth: "1997-10-27",
  calculatedAge: 29,
  kycStatus: "VERIFIED",
  kycProvider: "DIGILOCKER",
  maskedDocNumber: "DL-TS092015XXXX4819",
  documentType: "Driving Licence",
  city: "Hyderabad",
  deliveryAddress: "Villa 14, Silicon Meadows, Jubilee Hills, Hyderabad - 500033",
  activeRideCredit: 150.00
};

export const INITIAL_TRUSTED_CONTACTS = [
  {
    id: "tc-1",
    name: "Rahul Verma",
    phone: "+91 98765 00001",
    relationship: "Partner",
    isSosRecipient: true
  },
  {
    id: "tc-2",
    name: "Ananya Sen",
    phone: "+91 98765 00002",
    relationship: "Best Friend",
    isSosRecipient: true
  }
];

export const ORDER_STATE_MACHINE_STEPS = [
  { key: "CREATED", label: "Order Created", desc: "User verified & order submitted" },
  { key: "PAID", label: "Payment Captured", desc: "Razorpay ₹2,999 secured" },
  { key: "ACCEPTED", label: "Retailer Accepted", desc: "Jubilee Hills Reserve Spirits confirmed" },
  { key: "PACKED", label: "Packed & Sealed", desc: "Telangana Excise security seal applied" },
  { key: "DISPATCHED", label: "Dispatched", desc: "Handed over to Rohit Kumar (KA 01 AB 1234)" },
  { key: "ARRIVED", label: "Arrived at Door", desc: "Rider at Villa 14, Silicon Meadows" },
  { key: "AGE_CHECKED", label: "Door Age Verified", desc: "Digital OTP verified by rider" },
  { key: "DELIVERED", label: "Order Delivered", desc: "₹150 Safe Ride voucher activated!" }
];

export const MOCK_RIDE_PARTNERS = [
  {
    id: "uber",
    partner: "UBER",
    name: "Uber Premier",
    vehicleType: "Luxury Sedan (Camry / Dzire)",
    etaMinutes: 4,
    baseFare: 380,
    creditDiscount: 150,
    netPayable: 230,
    driver: "Manoj Reddy (4.9 ★)",
    vehicleNo: "TS 09 AB 4821",
    logoColor: "#000"
  },
  {
    id: "ola",
    partner: "OLA",
    name: "Ola Prime Sedan",
    vehicleType: "Premium Sedan (Free Wi-Fi)",
    etaMinutes: 6,
    baseFare: 360,
    creditDiscount: 150,
    netPayable: 210,
    driver: "Kishore Kumar (4.8 ★)",
    vehicleNo: "TS 08 CZ 9912",
    logoColor: "#1DB954"
  },
  {
    id: "rapido",
    partner: "RAPIDO",
    name: "Rapido Cab",
    vehicleType: "Quick City Transit",
    etaMinutes: 3,
    baseFare: 290,
    creditDiscount: 150,
    netPayable: 140,
    driver: "Suresh Paul (4.7 ★)",
    vehicleNo: "TS 07 ED 1104",
    logoColor: "#F9A825"
  }
];

export const MOCK_ADMIN_METRICS = {
  totalOrdersToday: 184,
  activeDeliveries: 22,
  kycPassRate: 95.8,
  rideRedemptionRate: 41.2,
  openSosIncidents: 0,
  grossMerchandiseValue: "₹5,14,200"
};

export const MOCK_FLAGGED_KYC = [
  {
    id: "kyc-flag-1",
    userFullName: "Vikramaditya Roy",
    phone: "+91 98112 44331",
    documentType: "Aadhaar Card",
    maskedId: "XXXX-XXXX-8812",
    calculatedAge: 23,
    flagReason: "Selfie liveness confidence 78% (Threshold 80%)",
    submittedAt: "12 mins ago",
    status: "PENDING_REVIEW"
  }
];

export const MOCK_AUDIT_LOGS = [
  {
    id: "aud-2041",
    actorRole: "RETAILER",
    action: "ORDER_STATUS_CHANGED",
    entity: "ORDER",
    entityId: "BZ-20261105-4819",
    details: "PACKED -> DISPATCHED (Rider assigned: Rohit Kumar)",
    timestamp: "21:44:12"
  },
  {
    id: "aud-2040",
    actorRole: "SYSTEM",
    action: "RAZORPAY_PAYMENT_CAPTURED",
    entity: "PAYMENT",
    entityId: "pay_HYD8a1K09fLk",
    details: "Amount: ₹2,999.00 (Order BZ-20261105-4819)",
    timestamp: "21:41:45"
  },
  {
    id: "aud-2039",
    actorRole: "CUSTOMER",
    action: "DIGILOCKER_KYC_VERIFIED",
    entity: "KYC_RECORD",
    entityId: "c0eebc99-9c0b",
    details: "Age 29 verified via Driving Licence DL-TS092015XXXX4819",
    timestamp: "21:38:30"
  }
];
