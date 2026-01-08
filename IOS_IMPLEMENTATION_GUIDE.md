# iOS App Implementation Guide - Quick Start

**Status:** ✅ Ready to implement  
**Backend Changes:** Minimal (1 new file + 1 line in server.py)

---

## Quick Answer

✅ **YES - Your backend is 100% compatible with iOS app**

**What you need:**
1. Add RevenueCat webhook endpoint (file already created: `backend/routes/revenucat_routes.py`)
2. Register route in `server.py` (one line)
3. Set environment variable: `REVENUECAT_WEBHOOK_SECRET`
4. Build iOS app using existing API endpoints

**All 150+ features work immediately** - no backend changes needed except payment webhook.

---

## Step 1: Backend Setup (5 minutes)

### 1.1 Register RevenueCat Route

Add this line to `backend/server.py` (around line 152, after other route imports):

```python
from routes.revenucat_routes import router as revenucat_router
api_router.include_router(revenucat_router, prefix="/revenucat", tags=["RevenueCat IAP"])
```

### 1.2 Set Environment Variable

Add to your Vercel environment variables:
```
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_from_revenucat
```

### 1.3 Update Product ID Mapping

Edit `backend/routes/revenucat_routes.py` line 20-25:

```python
REVENUECAT_PRODUCT_MAPPING = {
    "com.strattio.starter.monthly": "starter",      # Your actual App Store product ID
    "com.strattio.professional.monthly": "professional",
    "com.strattio.enterprise.monthly": "enterprise",
}
```

**That's it for backend!** ✅

---

## Step 2: RevenueCat Dashboard Setup

1. **Create RevenueCat Account:** https://www.revenuecat.com
2. **Create Project:** Add your iOS app
3. **Configure Products:**
   - Create products matching your tiers (starter, professional, enterprise)
   - Link to App Store Connect product IDs
4. **Set Webhook URL:**
   ```
   https://your-backend.vercel.app/api/revenucat/webhook/revenucat
   ```
5. **Get Webhook Secret:** Copy from RevenueCat dashboard → Settings → Webhooks

---

## Step 3: iOS App Implementation

### 3.1 Install RevenueCat SDK

```swift
// Package.swift or Podfile
dependencies: [
    .package(url: "https://github.com/RevenueCat/purchases-ios", from: "4.0.0")
]
```

### 3.2 Initialize RevenueCat

```swift
import RevenueCat

// In AppDelegate or App struct
Purchases.configure(withAPIKey: "your_revenucat_api_key")
```

### 3.3 Authentication Flow

```swift
// After user logs in via your API
func loginUser(email: String, password: String) async throws {
    // 1. Login to your backend
    let response = try await apiClient.login(email: email, password: password)
    let userId = response.user.id
    let accessToken = response.access_token
    
    // 2. Login to RevenueCat with your user ID
    let (customerInfo, error) = await Purchases.shared.logIn(userId)
    
    if let error = error {
        print("RevenueCat login error: \(error)")
    }
    
    // 3. Link RevenueCat user to backend
    if let customerInfo = customerInfo {
        try await apiClient.linkRevenueCatUser(
            revenucatUserId: customerInfo.originalAppUserId
        )
    }
}
```

### 3.4 Purchase Subscription

```swift
func purchaseSubscription(package: Package) async throws {
    // RevenueCat handles all IAP logic
    let (transaction, customerInfo, error) = await Purchases.shared.purchase(package: package)
    
    if let error = error {
        throw error
    }
    
    // RevenueCat webhook automatically updates your backend
    // Just refresh subscription status
    let subscription = try await apiClient.getCurrentSubscription()
    
    // Update UI based on subscription.tier
}
```

### 3.5 Check Subscription Status

```swift
func checkSubscription() async throws -> Subscription {
    // Use your existing API endpoint
    return try await apiClient.getCurrentSubscription()
}

// Or use RevenueCat directly (optional)
func checkRevenueCatStatus() async -> CustomerInfo? {
    return try? await Purchases.shared.customerInfo()
}
```

### 3.6 Feature Access Checking

```swift
func canExportPDF() async -> Bool {
    let subscription = try? await apiClient.getCurrentSubscription()
    return subscription?.tier != "free"
}

func canCreatePlan() async -> Bool {
    let subscription = try? await apiClient.getCurrentSubscription()
    guard let subscription = subscription else { return false }
    
    let usage = try? await apiClient.getUsageStats()
    return (usage?.plans_created_this_month ?? 0) < (subscription.plan_limit ?? 1)
}
```

---

## Step 4: API Client for iOS

Create an API client that uses your existing endpoints:

```swift
class StrattioAPI {
    let baseURL = "https://your-backend.vercel.app/api"
    var accessToken: String?
    
    // Authentication
    func login(email: String, password: String) async throws -> LoginResponse {
        // POST /api/auth/login
    }
    
    // Plans
    func getPlans() async throws -> [Plan] {
        // GET /api/plans
    }
    
    func createPlan(name: String, intakeData: [String: Any]) async throws -> Plan {
        // POST /api/plans
    }
    
    func generatePlan(planId: String) async throws {
        // POST /api/plans/{planId}/generate
    }
    
    // Subscriptions
    func getCurrentSubscription() async throws -> Subscription {
        // GET /api/subscriptions/current
    }
    
    func linkRevenueCatUser(revenucatUserId: String) async throws {
        // POST /api/revenucat/link
    }
    
    // All other endpoints work the same way
}
```

---

## Testing Checklist

### Backend Testing
- [ ] RevenueCat webhook receives test events
- [ ] Subscription tier updates correctly
- [ ] User mapping works
- [ ] Plan limits enforced correctly

### iOS Testing
- [ ] User can login
- [ ] RevenueCat user linked to backend
- [ ] Subscription purchase works
- [ ] Subscription status syncs to backend
- [ ] Feature access checks work
- [ ] Plan creation respects limits

---

## Architecture Diagram

```
iOS App                    Backend API                  Database
┌─────────┐               ┌──────────────┐            ┌─────────┐
│ RevenueCat│─────────────▶│ Webhook      │───────────▶│subscriptions│
│ SDK      │  Purchase     │ /revenucat/  │  Update    │ {tier:   │
│          │               │ webhook      │            │  "pro"}  │
└────┬─────┘               └──────────────┘            └─────────┘
     │                            ▲
     │                            │
     │  API Calls                  │
     │  (JWT Auth)                 │
     └────────────────────────────┘
     
All features work via existing API endpoints:
- /api/plans
- /api/sections  
- /api/financials
- /api/exports
- etc. (150+ endpoints)
```

---

## Key Points

1. **99% of backend unchanged** - Only payment webhook added
2. **Same database schema** - Both Stripe and RevenueCat update `subscription.tier`
3. **All features work** - iOS app uses same API endpoints as web
4. **Coexistence** - Web (Stripe) and iOS (RevenueCat) work together
5. **Single source of truth** - Database `subscription.tier` field

---

## Support

If you need help:
1. Check RevenueCat docs: https://docs.revenuecat.com
2. Test webhook with RevenueCat sandbox
3. Monitor webhook logs in backend
4. Check subscription status in database

---

**Estimated Time:**
- Backend setup: 5 minutes
- RevenueCat config: 30 minutes
- iOS app development: 4-6 weeks

**Status:** ✅ Ready to proceed!
