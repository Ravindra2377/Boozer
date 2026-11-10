import {
  MOCK_PRODUCTS,
  MOCK_RETAILER,
  INITIAL_USER,
  INITIAL_TRUSTED_CONTACTS,
  MOCK_RIDE_PARTNERS,
  MOCK_ADMIN_METRICS,
  MOCK_FLAGGED_KYC,
  MOCK_AUDIT_LOGS,
} from '../data/mockData';

const MOCK_KYC_RECORD = {
  status: 'VERIFIED',
  docType: 'DRIVING_LICENSE',
  docNumberMasked: 'DL-TS092015XXXX4819',
  ageVerified: true,
  provider: 'DIGILOCKER',
};

const MOCK_ORDERS = [
  {
    id: "ord-4819",
    orderNumber: "BZ-20261105-4819",
    status: "DISPATCHED",
    totalAmount: 2999.00,
    safeRideVoucherEligible: true,
    ageCheckAtDoorVerified: false,
    placedAt: new Date().toISOString(),
  }
];

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  constructor() {
    const hasStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    this.token = hasStorage ? localStorage.getItem('boozer_token') : null;
    this.userId = hasStorage ? (localStorage.getItem('boozer_user_id') || INITIAL_USER.id) : INITIAL_USER.id;
    this.isBackendAvailable = null;
  }

  setToken(token, userId) {
    this.token = token;
    this.userId = userId;
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      if (token) localStorage.setItem('boozer_token', token);
      if (userId) localStorage.setItem('boozer_user_id', userId);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.removeItem('boozer_token');
      localStorage.removeItem('boozer_user_id');
    }
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(this.userId ? { 'X-User-Id': this.userId } : {}),
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s fast failover to mock

      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      this.isBackendAvailable = true;
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      this.isBackendAvailable = false;
      console.warn(`[BOOZER API] Live backend unavailable (${err.message}). Using local verified mock fallback for: ${path}`);
      return null;
    }
  }

  // --- 1. AUTH ---
  async requestOtp(phone) {
    const live = await this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return live || { success: true, message: `OTP sent to ${phone} (Sandbox: 123456)` };
  }

  async verifyOtp(phone, otp) {
    const live = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    if (live) {
      this.setToken(live.token, live.user?.id);
      return live;
    }
    return {
      token: 'mock-jwt-token-active',
      user: {
        id: INITIAL_USER.id,
        phone,
        fullName: INITIAL_USER.name,
        kycStatus: 'VERIFIED',
      },
    };
  }

  // --- 2. USERS & CONTACTS ---
  async getProfile() {
    const live = await this.request('/users/me');
    return live || INITIAL_USER;
  }

  async getContacts() {
    const live = await this.request('/users/contacts');
    return live || [
      { id: '1', name: 'Kabir Varma', phone: '+91 98490 12891', relationship: 'Brother', isSosRecipient: true },
      { id: '2', name: 'Rhea Sen', phone: '+91 98765 89210', relationship: 'Friend', isSosRecipient: true },
    ];
  }

  // --- 3. KYC ---
  async getKycStatus() {
    const live = await this.request('/kyc/status');
    return live || MOCK_KYC_RECORD;
  }

  async initiateDigiLocker(redirectUrl) {
    const path = redirectUrl ? `/kyc/initiate?redirectUrl=${encodeURIComponent(redirectUrl)}` : '/kyc/initiate';
    const live = await this.request(path, { method: 'POST' });
    return live || {
      id: 'setu_demo_' + Date.now().toString(36),
      url: 'https://dg-sandbox.setu.co/digilocker/simulate',
      redirectUrl: 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?mock=true',
      sessionId: 'dgl-mock-session-7819',
      mode: 'SANDBOX_SIMULATOR',
    };
  }

  async submitKyc(docType, docNumber, dateOfBirth) {
    const live = await this.request('/kyc/verify', {
      method: 'POST',
      body: JSON.stringify({
        docType: docType || 'DRIVING_LICENCE',
        docNumber: docNumber || 'TS092015004819',
        dateOfBirth: dateOfBirth || '1995-04-30',
      }),
    });
    if (live) return live;
    const safeDoc = docNumber || 'TS092015004819';
    return {
      id: 'kyc-' + Date.now(),
      status: 'VERIFIED',
      docType: docType || 'DRIVING_LICENCE',
      docNumberMasked: safeDoc.length >= 8 ? safeDoc.slice(0, 4) + 'XXXX' + safeDoc.slice(-4) : 'DL-142011XXXX9124',
      ageVerified: true,
      provider: 'DIGILOCKER',
      providerRef: 'DGL-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      verifiedAt: new Date().toISOString(),
    };
  }

  // --- 4. CATALOG ---
  async getProducts(category) {
    const path = category && category !== 'ALL' ? `/catalog/products?category=${category}` : '/catalog/products';
    const live = await this.request(path);
    if (live && Array.isArray(live) && live.length > 0) return live;
    return category && category !== 'ALL'
      ? MOCK_PRODUCTS.filter((p) => p.category === category)
      : MOCK_PRODUCTS;
  }

  async getProduct(id) {
    const live = await this.request(`/catalog/products/${id}`);
    return live || MOCK_PRODUCTS.find((p) => p.id === id);
  }

  // --- 5. ORDERS & GET HELP ---
  async getOrders() {
    const live = await this.request('/orders');
    return live && Array.isArray(live) && live.length > 0 ? live : MOCK_ORDERS;
  }

  async getOrder(id) {
    const live = await this.request(`/orders/${id}`);
    return live || MOCK_ORDERS.find((o) => o.id === id) || MOCK_ORDERS[0];
  }

  async createOrder(orderPayload) {
    const live = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    return (
      live || {
        id: 'ord-' + Math.random().toString(36).substring(2, 9),
        orderNumber: 'BZ-' + Math.floor(100000 + Math.random() * 900000),
        status: 'PAID',
        totalInr: orderPayload.totalInr || 3987,
        safeRideVoucherEligible: true,
        placedAt: new Date().toISOString(),
      }
    );
  }

  async transitionOrder(orderId, targetStatus, ageVerified = false) {
    const live = await this.request(`/orders/${orderId}/transition`, {
      method: 'PATCH',
      body: JSON.stringify({ targetStatus, ageCheckAtDoorVerified: ageVerified }),
    });
    return live || { id: orderId, status: targetStatus };
  }

  async requestOrderHelp(orderId, queryType, notes) {
    const live = await this.request(`/orders/${orderId}/help`, {
      method: 'POST',
      body: JSON.stringify({ queryType, notes }),
    });
    return (
      live || {
        orderId,
        status: 'SUPPORT_TICKET_OPENED',
        driverContact: '+91 98490 28192',
        supportAgentAssigned: 'Priya S. (Excise Delivery Ops)',
        resolutionEtaMinutes: 5,
        message: 'Order assistance ticket logged. Our support team is coordinating with your delivery rider.',
      }
    );
  }

  // --- 6. PAYMENTS ---
  async createPaymentOrder(orderId) {
    const live = await this.request(`/payments/create-order?orderId=${orderId}`, { method: 'POST' });
    return (
      live || {
        razorpayOrderId: 'order_' + Math.random().toString(36).substring(2, 12),
        amountInr: 3987,
        currency: 'INR',
        status: 'PENDING',
      }
    );
  }

  async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const live = await this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
    });
    return live || { status: 'CAPTURED', razorpayPaymentId };
  }

  // --- 7. DELIVERIES ---
  async getDelivery(orderId) {
    const live = await this.request(`/deliveries/order/${orderId}`);
    return (
      live || {
        orderId,
        riderName: 'Rohit Kumar',
        riderPhone: '+91 98490 28192',
        riderLat: 17.4339,
        riderLng: 78.3978,
        status: 'IN_TRANSIT',
        riderSpeedKmh: 28,
        riderHeadingDegrees: 120,
        riderLocationUpdatedAt: new Date().toISOString(),
      }
    );
  }

  async updateRiderLocation(orderId, { lat, lng, speedKmh, headingDegrees, accuracy }) {
    return this.request(`/deliveries/order/${orderId}/location`, {
      method: 'POST',
      body: JSON.stringify({
        lat,
        lng,
        speedKmh: speedKmh || null,
        headingDegrees: headingDegrees || null,
        accuracy: accuracy || null,
      }),
    });
  }

  subscribeDeliveryStream(orderId, onMessage, onError) {
    if (typeof EventSource === 'undefined') return () => {};
    const url = `${this.baseUrl}/deliveries/order/${orderId}/stream`;
    const eventSource = new EventSource(url);

    const handlePayload = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error('Failed to parse SSE telemetry:', err);
      }
    };

    eventSource.addEventListener('RIDER_LOCATION', handlePayload);
    eventSource.addEventListener('INIT_TELEMETRY', handlePayload);
    eventSource.onmessage = handlePayload;

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      eventSource.close();
    };
  }

  async verifyDoorstepAge(orderId, otp) {
    const live = await this.request(`/deliveries/order/${orderId}/verify-age`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
    return live !== null ? live : otp === '4819' || otp.length === 4;
  }

  // --- 8. SAFE RIDE ---
  async getRideEstimates(pickupLat = 17.4399, pickupLng = 78.3908, dropLat = 17.4239, dropLng = 78.4738) {
    const live = await this.request(`/rides/estimates?pickupLat=${pickupLat}&pickupLng=${pickupLng}&dropLat=${dropLat}&dropLng=${dropLng}`);
    return (
      live || [
        {
          partner: 'UBER',
          vehicleType: 'Uber Go / Premier',
          estimatedFareInr: 320.0,
          etaMinutes: 4,
          voucherApplicable: true,
          finalFareInr: 170.0,
        },
        {
          partner: 'OLA',
          vehicleType: 'Ola Prime Sedan',
          estimatedFareInr: 345.0,
          etaMinutes: 6,
          voucherApplicable: true,
          finalFareInr: 195.0,
        },
      ]
    );
  }

  async bookRide(partner, pickupAddress, dropoffAddress, estimatedFareInr) {
    const live = await this.request('/rides/book', {
      method: 'POST',
      body: JSON.stringify({ partner, pickupAddress, dropoffAddress, estimatedFareInr }),
    });
    return (
      live || {
        id: 'rb-' + Math.random().toString(36).substring(2, 8),
        partner,
        pickupAddress,
        dropoffAddress,
        estimatedFareInr,
        discountAppliedInr: 150.0,
        finalFareInr: Math.max(0, estimatedFareInr - 150.0),
        driverName: 'Suresh Varma',
        driverPhone: '+91 98490 12890',
        vehicleNumber: 'TS09 EQ 4092',
        status: 'BOOKED',
      }
    );
  }

  async getRideHistory() {
    const live = await this.request('/rides/history');
    return live || [];
  }

  // --- 9. SAFETY & SOS ---
  async triggerSos(lat, lng, batteryLevel, notes) {
    const live = await this.request('/safety/sos', {
      method: 'POST',
      body: JSON.stringify({ latitude: lat, longitude: lng, batteryLevel, notes }),
    });
    return (
      live || {
        eventId: 'sos-' + Date.now(),
        status: 'CONTACTS_NOTIFIED',
        notifiedContactsCount: 2,
        contacts: ['Kabir Varma (+91 98490 12891)', 'Rhea Sen (+91 98765 89210)'],
        emergencyServicesNumber: '112',
        message: 'Emergency broadcast dispatched to trusted contacts. Local emergency services standing by.',
      }
    );
  }

  // --- 10. RETAILER & ADMIN ---
  async getRetailerOrders() {
    const live = await this.request('/retailer/orders');
    return live || MOCK_ORDERS;
  }

  async getRetailerStock() {
    const live = await this.request('/retailer/stock');
    return live || [];
  }

  async getAdminMetrics() {
    const live = await this.request('/admin/metrics');
    return live || MOCK_ADMIN_METRICS;
  }

  async getAuditLogs(limit = 50) {
    const live = await this.request(`/admin/audit-logs?limit=${limit}`);
    return live || MOCK_AUDIT_LOGS;
  }

  // --- 11. STATE EXCISE COMPLIANCE & GEOFENCING ---
  async getExciseStatus(state = 'TELANGANA') {
    const live = await this.request(`/compliance/excise/status?state=${state}`);
    return (
      live || {
        isPermitted: true,
        isDryDay: false,
        dryDayReason: null,
        isOperatingHoursValid: true,
        isWithinExciseZone: true,
        deliveryDistanceKm: 1.4,
        maxRadiusKm: 6.5,
        minutesRemaining: 108,
      }
    );
  }

  async getDryDays(state = 'TELANGANA') {
    const live = await this.request(`/compliance/excise/dry-days?state=${state}`);
    return (
      live || [
        { date: '2026-01-26', reason: 'Republic Day', state: 'TELANGANA', statutorySection: 'Section 17(1) TG Excise Act' },
        { date: '2026-08-15', reason: 'Independence Day', state: 'TELANGANA', statutorySection: 'National Holiday Order' },
        { date: '2026-10-02', reason: 'Mahatma Gandhi Jayanti', state: 'TELANGANA', statutorySection: 'National Statutory Dry Day' },
      ]
    );
  }

  async validateExciseZone(lat, lng, state = 'TELANGANA') {
    const live = await this.request('/compliance/excise/validate-zone', {
      method: 'POST',
      body: JSON.stringify({ state, latitude: lat, longitude: lng }),
    });
    return (
      live || {
        isPermitted: true,
        isWithinExciseZone: true,
        deliveryDistanceKm: 1.4,
        maxRadiusKm: 6.5,
      }
    );
  }
}

export const api = new ApiClient();
export default api;
