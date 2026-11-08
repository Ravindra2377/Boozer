// ============================================================================
// BOOZER · MAP COORDINATES & WAYPOINTS
// High-precision geographic coordinates for Telangana (Hyderabad) & Delhi Pilot
// ============================================================================

export const HYDERABAD_DELIVERY_DATA = {
  city: "Hyderabad",
  store: {
    name: "Jubilee Hills Reserve Spirits",
    licence: "TS/EXCISE/HYD/2026/0481",
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    coords: [17.4325, 78.4070],
    deliveryRadiusKm: 6.5
  },
  customer: {
    name: "Panvi (Verified Recipient)",
    address: "Villa 14, Silicon Meadows, Jubilee Hills, Hyderabad",
    coords: [17.4210, 78.4230],
    doorstepOtp: "8492"
  },
  routeWaypoints: [
    [17.4325, 78.4070], // Jubilee Hills Rd 36 Store Origin
    [17.4318, 78.4082], // Towards Rd 36 Metro Station
    [17.4302, 78.4110], // Jubilee Hills Check Post Junction
    [17.4280, 78.4145], // KBR Park Peripheral Ring Road
    [17.4255, 78.4180], // Road No. 10 Avenue
    [17.4230, 78.4208], // Silicon Meadows North Gate
    [17.4210, 78.4230]  // Villa 14 Doorstep Destination
  ],
  safeRide: {
    pickup: {
      label: "Jubilee Hills Club / Social Bar",
      address: "Road No. 36, Jubilee Hills, Hyderabad",
      coords: [17.4350, 78.4020]
    },
    dropoff: {
      label: "Home (Villa 14)",
      address: "Villa 14, Silicon Meadows, Jubilee Hills",
      coords: [17.4210, 78.4230]
    },
    routeWaypoints: [
      [17.4350, 78.4020],
      [17.4335, 78.4050],
      [17.4302, 78.4110],
      [17.4280, 78.4145],
      [17.4255, 78.4180],
      [17.4230, 78.4208],
      [17.4210, 78.4230]
    ],
    nearbyCabs: [
      {
        id: "uber",
        partner: "UBER",
        name: "Uber Premier",
        driver: "Manoj Reddy",
        vehicle: "TS 09 AB 4821",
        rating: 4.9,
        etaMinutes: 4,
        coords: [17.4372, 78.4048],
        approachPath: [
          [17.4372, 78.4048],
          [17.4360, 78.4035],
          [17.4350, 78.4020]
        ]
      },
      {
        id: "ola",
        partner: "OLA",
        name: "Ola Prime Sedan",
        driver: "Kishore Kumar",
        vehicle: "TS 08 CZ 9912",
        rating: 4.8,
        etaMinutes: 6,
        coords: [17.4338, 78.3990],
        approachPath: [
          [17.4338, 78.3990],
          [17.4345, 78.4005],
          [17.4350, 78.4020]
        ]
      },
      {
        id: "rapido",
        partner: "RAPIDO",
        name: "Rapido Cab",
        driver: "Sunil Rao",
        vehicle: "TS 07 EA 1184",
        rating: 4.7,
        etaMinutes: 3,
        coords: [17.4322, 78.4055],
        approachPath: [
          [17.4322, 78.4055],
          [17.4340, 78.4030],
          [17.4350, 78.4020]
        ]
      }
    ]
  }
};

export const DELHI_DELIVERY_DATA = {
  city: "Delhi",
  store: {
    name: "Connaught Place Premium Vintners",
    licence: "L-2/EXCISE/DL/2026/0491",
    address: "Block B, Inner Circle, Connaught Place, New Delhi",
    coords: [28.6328, 77.2197],
    deliveryRadiusKm: 6.5
  },
  customer: {
    name: "Rohit Sharma",
    address: "Flat 402, Barakhamba Towers, Connaught Place",
    coords: [28.6280, 77.2270],
    doorstepOtp: "8492"
  },
  routeWaypoints: [
    [28.6328, 77.2197],
    [28.6315, 77.2215],
    [28.6300, 77.2240],
    [28.6280, 77.2270]
  ],
  safeRide: {
    pickup: {
      label: "Connaught Place Barakhamba Towers",
      address: "Flat 402, Barakhamba Towers, CP",
      coords: [28.6280, 77.2270]
    },
    dropoff: {
      label: "Home (Sector 44 Noida)",
      address: "House 24, Sector 44, Noida",
      coords: [28.5480, 77.3390]
    },
    routeWaypoints: [
      [28.6280, 77.2270],
      [28.6180, 77.2400],
      [28.5850, 77.2800],
      [28.5600, 77.3100],
      [28.5480, 77.3390]
    ],
    nearbyCabs: [
      {
        id: "uber",
        partner: "UBER",
        name: "Uber Premier",
        driver: "Rajesh Kumar",
        vehicle: "DL 01 AB 4821",
        rating: 4.9,
        etaMinutes: 4,
        coords: [28.6305, 77.2245],
        approachPath: [
          [28.6305, 77.2245],
          [28.6290, 77.2260],
          [28.6280, 77.2270]
        ]
      },
      {
        id: "ola",
        partner: "OLA",
        name: "Ola Prime Sedan",
        driver: "Amit Singh",
        vehicle: "DL 03 CD 9912",
        rating: 4.8,
        etaMinutes: 6,
        coords: [28.6260, 77.2290],
        approachPath: [
          [28.6260, 77.2290],
          [28.6270, 77.2280],
          [28.6280, 77.2270]
        ]
      },
      {
        id: "rapido",
        partner: "RAPIDO",
        name: "Rapido Cab",
        driver: "Deepak Verma",
        vehicle: "DL 05 EF 1184",
        rating: 4.7,
        etaMinutes: 3,
        coords: [28.6295, 77.2220],
        approachPath: [
          [28.6295, 77.2220],
          [28.6285, 77.2250],
          [28.6280, 77.2270]
        ]
      }
    ]
  }
};

/**
 * Returns the active map dataset based on the current user or retailer city.
 */
export function getMapDataForCity(city) {
  if (city && city.toLowerCase().includes("delhi")) {
    return DELHI_DELIVERY_DATA;
  }
  return HYDERABAD_DELIVERY_DATA;
}
