# BOOZER · REST API Specification & Contract Reference
**Version:** 1.0.0 (MVP)  
**Base URL (Local):** `http://localhost:8080/api/v1`  
**Base URL (Staging):** `https://staging-api.boozerapp.in/api/v1`  
**Security Scheme:** HTTP Bearer JWT (`Authorization: Bearer <token>`)

---

## 1. Authentication Module (`/auth`)

### 1.1 Request Mobile OTP
Dispatches a 6-digit OTP to the provided Indian phone number with strict Redis rate-limiting (maximum 3 requests per 10 minutes).

- **Method & Route:** `POST /auth/request-otp`
- **Request Body:**
```json
{
  "phone": "+919876543210"
}
```
- **Response `200 OK`:**
```json
{
  "requestId": "otp_req_78b2a19c",
  "expiresInSeconds": 180,
  "message": "OTP sent successfully"
}
```

### 1.2 Verify Mobile OTP
Validates the OTP and returns short-lived access JWT (15 mins) and long-lived refresh JWT (7 days).

- **Method & Route:** `POST /auth/verify-otp`
- **Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "482194",
  "requestId": "otp_req_78b2a19c"
}
```
- **Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "phone": "+919876543210",
    "fullName": "Rohit Sharma",
    "dateOfBirth": "1995-04-30",
    "kycStatus": "VERIFIED"
  }
}
```

---

## 2. KYC & Age Verification Module (`/kyc`)

> **DPDP Act 2023 Rule:** Raw documents (unredacted Aadhaar, voter cards) are never retained. Only the masked token, age result, and cryptographic signature hash are stored.

### 2.1 Initiate DigiLocker Age Check
- **Method & Route:** `POST /kyc/initiate`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "sessionId": "kyc_sess_09124",
  "redirectUrl": "https://digilocker.meripehchan.gov.in/public/oauth2/1/authorize?client_id=BOOZER&response_type=code&scope=openid"
}
```

### 2.2 Check KYC Status
- **Method & Route:** `GET /kyc/status`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "kycStatus": "VERIFIED",
  "ageVerified": true,
  "calculatedAge": 31,
  "maskedId": "DL-142011XXXX9124",
  "verifiedAt": "2026-11-04T16:30:00Z"
}
```

---

## 3. Catalog & Licensed Retailers (`/catalog`)

### 3.1 Get Nearby Licensed Retailers
Returns licensed stores operating within state excise limits and delivering to the user's coordinates.

- **Method & Route:** `GET /catalog/retailers?lat=28.6328&lng=77.2197`
- **Response `200 OK`:**
```json
[
  {
    "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44",
    "storeName": "Connaught Place Premium Vintners",
    "licenceNumber": "L-2/EXCISE/DL/2026/0491",
    "city": "New Delhi",
    "operatingHours": "10:00 AM - 10:00 PM",
    "isOpenNow": true,
    "distanceKm": 1.4,
    "deliveryRadiusKm": 6.5
  }
]
```

### 3.2 Get Retailer Products (Legal MRP Enforced)
- **Method & Route:** `GET /catalog/retailers/{retailerId}/products?category=BEER`
- **Response `200 OK`:**
```json
[
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f61",
    "name": "Bira 91 White Craft Beer",
    "brand": "Bira 91",
    "category": "BEER",
    "abv": 4.90,
    "volumeMl": 330,
    "legalMrp": 180.00,
    "stockQuantity": 48,
    "isInStock": true,
    "imageUrl": "https://images.unsplash.com/photo-1608270118837-17e909a80e1b?w=600"
  }
]
```

---

## 4. Orders & State Machine (`/orders`)

Order State Machine:
`CREATED → PAID → ACCEPTED → PACKED → DISPATCHED → ARRIVED → AGE_CHECKED → DELIVERED`

### 4.1 Create Order
- **Method & Route:** `POST /orders`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "retailerId": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44",
  "deliveryAddressLine1": "Flat 402, Barakhamba Towers, Connaught Place",
  "deliveryCity": "New Delhi",
  "deliveryPincode": "110001",
  "deliveryLat": 28.6315,
  "deliveryLng": 77.2210,
  "items": [
    {
      "productId": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f61",
      "quantity": 2
    },
    {
      "productId": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f63",
      "quantity": 1
    }
  ]
}
```
- **Response `201 Created`:**
```json
{
  "id": "99eebc99-9c0b-4ef8-bb6d-6bb9bd380999",
  "orderNumber": "BZ-20261104-1849",
  "status": "CREATED",
  "subtotalAmount": 1810.00,
  "deliveryFee": 50.00,
  "packagingFee": 20.00,
  "taxAmount": 0.00,
  "totalAmount": 1880.00,
  "ageCheckAtDoorRequired": true,
  "ageCheckAtDoorVerified": false,
  "createdAt": "2026-11-04T22:00:00Z"
}
```

### 4.2 Doorstep Age Check Confirmation (Rider Flow)
The delivery rider scans physical government ID or inputs user's digital OTP at the door.

- **Method & Route:** `POST /orders/{orderId}/confirm-door-age`
- **Request Body:**
```json
{
  "verificationMethod": "DIGITAL_OTP",
  "riderConfirmationCode": "8492"
}
```
- **Response `200 OK`:**
```json
{
  "orderId": "99eebc99-9c0b-4ef8-bb6d-6bb9bd380999",
  "status": "AGE_CHECKED",
  "ageCheckAtDoorVerified": true,
  "message": "Doorstep age verification successful. Ready for DELIVERED state."
}
```

---

## 5. Payments Module (`/payments`)

### 5.1 Initialize Razorpay Order
- **Method & Route:** `POST /payments/create-razorpay-order`
- **Request Body:**
```json
{
  "orderId": "99eebc99-9c0b-4ef8-bb6d-6bb9bd380999"
}
```
- **Response `200 OK`:**
```json
{
  "razorpayOrderId": "order_NX8a1K09fLk",
  "amount": 1880.00,
  "currency": "INR",
  "keyId": "rzp_test_placeholder"
}
```

---

## 6. Safe Ride & Credit Module (`/rides`)

Every delivered alcohol order automatically issues a **Safe Ride Credit** (capped at ₹150, valid 24h).

### 6.1 Get Active Ride Credits
- **Method & Route:** `GET /rides/credits`
- **Response `200 OK`:**
```json
[
  {
    "id": "77eebc99-9c0b-4ef8-bb6d-6bb9bd380777",
    "orderId": "99eebc99-9c0b-4ef8-bb6d-6bb9bd380999",
    "creditCode": "SAFERIDE-1849A",
    "creditAmount": 150.00,
    "isRedeemed": false,
    "expiresAt": "2026-11-05T22:00:00Z"
  }
]
```

### 6.2 Estimate Ride Fares with Applied Credit
- **Method & Route:** `POST /rides/estimate`
- **Request Body:**
```json
{
  "pickupLat": 28.6315,
  "pickupLng": 77.2210,
  "dropoffLat": 28.5355,
  "dropoffLng": 77.3910
}
```
- **Response `200 OK`:**
```json
[
  {
    "partner": "UBER",
    "vehicleType": "Uber Premier / Go",
    "estimatedTotalFare": 380.00,
    "creditDiscountApplied": 150.00,
    "netPayableFare": 230.00,
    "etaMinutes": 4,
    "deepLinkUrl": "https://m.uber.com/ul/?action=setPickup&..."
  },
  {
    "partner": "OLA",
    "vehicleType": "Ola Prime / Mini",
    "estimatedTotalFare": 360.00,
    "creditDiscountApplied": 150.00,
    "netPayableFare": 210.00,
    "etaMinutes": 6,
    "deepLinkUrl": "ola://ride?lat=28.6315&lng=77.2210..."
  }
]
```

---

## 7. Safety Centre & SOS Module (`/safety`)

### 7.1 Immediate SOS Alert Trigger
When user holds the persistent SOS button on tracking or ride screens for 3 seconds:

- **Method & Route:** `POST /safety/sos/trigger`
- **Request Body:**
```json
{
  "lat": 28.6315,
  "lng": 77.2210,
  "orderId": "99eebc99-9c0b-4ef8-bb6d-6bb9bd380999",
  "reason": "User pressed and held emergency SOS button"
}
```
- **Response `201 Created`:**
```json
{
  "id": "55eebc99-9c0b-4ef8-bb6d-6bb9bd380555",
  "eventType": "SOS_TRIGGERED",
  "status": "CONTACTS_NOTIFIED",
  "contactsNotifiedCount": 2,
  "emergencyDispatchNotified": false,
  "createdAt": "2026-11-04T22:05:00Z",
  "message": "Emergency alerts dispatched to Pooja Sharma and Karan Verma with live GPS location"
}
```

---

## 8. Retailer Portal (`/retailer-portal`)

### 8.1 Incoming Order Queue
- **Method & Route:** `GET /retailer-portal/orders`
- **Response `200 OK`:** Returns list of orders in `PAID`, `ACCEPTED`, and `PACKED` states for store handling.

### 8.2 Update Status (Accept / Pack / Dispatch)
- **Method & Route:** `PUT /retailer-portal/orders/{orderId}/status`
- **Request Body:**
```json
{
  "nextState": "PACKED"
}
```

### 8.3 Stock Toggle
- **Method & Route:** `PUT /retailer-portal/inventory/stock`
- **Request Body:**
```json
{
  "productId": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f61",
  "quantity": 0
}
```

---

## 9. Admin & Compliance Portal (`/admin`)

### 9.1 Dashboard Metrics
- **Method & Route:** `GET /admin/dashboard`
- **Response `200 OK`:**
```json
{
  "totalOrdersToday": 142,
  "activeDeliveries": 18,
  "kycVerificationSuccessRate": 94.2,
  "rideCreditsRedeemedPercentage": 38.5,
  "openSafetyIncidents": 0
}
```

### 9.2 Immutable Audit Trail Query
- **Method & Route:** `GET /admin/audit-logs?limit=10`
- **Response `200 OK`:**
```json
[
  {
    "id": 1042,
    "actorRole": "ADMIN",
    "action": "ORDER_REFUNDED",
    "entity": "ORDER",
    "entityId": "99eebc99-9c0b-4ef8-bb6d-6bb9bd380999",
    "timestamp": "2026-11-04T22:08:12Z"
  }
]
```
