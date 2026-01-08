# iOS App Feasibility Analysis - RevenueCat Integration

**Date:** January 2025  
**Status:** ✅ **FEASIBLE - No Backend Changes Required for Core Features**  
**Payment Integration:** RevenueCat IAP (iOS) + Stripe (Web) - Coexistence Strategy

---

## Executive Summary

✅ **YES, you can create an iOS app using the same backend without changing existing functionality.**

Your backend architecture is **perfectly designed** for multi-platform support:
- RESTful API with JWT authentication (platform-agnostic)
- Subscription tier stored in database (payment-provider agnostic)
- All features accessible via API endpoints
- Payment provider only updates subscription tier in database

**Only Addition Needed:** A RevenueCat webhook endpoint to sync iOS subscription status to your database.

---

## Architecture Analysis

### Current Backend Architecture ✅

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  RESTful API Endpoints (Platform Agnostic)        │  │
│  │  - JWT Authentication                             │  │
│  │  - All features via HTTP endpoints                │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  MongoDB Database                                  │  │
│  │  - subscriptions.tier (payment-provider agnostic)│  │
│  │  - All business logic based on tier               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Design Strengths

1. **Payment Provider Abstraction**
   - Subscription tier stored in `subscriptions` collection
   - Tier checking: `subscription["tier"]` (not tied to Stripe)
   - Plan limits: Based on `subscription["plan_limit"]` from database
   - All feature access checks: `if subscription["tier"] == "free"`

2. **Platform-Agnostic API**
   - JWT authentication works for any client (web, iOS, Android)
   - All endpoints use standard HTTP/REST
   - No platform-specific code in backend

3. **Feature Access Control**
   ```python
   # Current implementation (works for any platform)
   subscription = await db.subscriptions.find_one({"user_id": user_id})
   if subscription["tier"] == "free":
       # Restrict feature
   ```

---

## Required Changes (Minimal)

### ✅ Option 1: Add RevenueCat Webhook (Recommended)

**Add ONE new endpoint** to handle RevenueCat subscription updates:

```python
# backend/routes/revenucat_routes.py (NEW FILE)
@router.post("/webhook/revenucat")
async def revenucat_webhook(request: Request, db = Depends(get_db)):
    """Handle RevenueCat webhook events for iOS subscriptions"""
    # Verify webhook signature
    # Update subscription tier in database
    # Same logic as Stripe webhook, different source
```

**Impact:** 
- ✅ No changes to existing code
- ✅ Stripe continues working for web
- ✅ RevenueCat handles iOS subscriptions
- ✅ Both update same database field

### ✅ Option 2: Unified Subscription Update Endpoint

Create a single endpoint that accepts subscription updates from any source:

```python
@router.post("/subscriptions/update")
async def update_subscription(
    update_data: SubscriptionUpdate,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Update subscription tier (called by RevenueCat or Stripe webhook)"""
    # Update subscription.tier in database
```

---

## Implementation Strategy

### Phase 1: Add RevenueCat Support (No Breaking Changes)

#### 1.1 Create RevenueCat Webhook Handler

```python
# backend/routes/revenucat_routes.py
"""RevenueCat IAP integration routes for iOS"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import logging
import os
import hmac
import hashlib

from utils.serializers import serialize_doc, to_object_id
from utils.dependencies import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

REVENUECAT_WEBHOOK_SECRET = os.environ.get("REVENUECAT_WEBHOOK_SECRET")

# Map RevenueCat product IDs to subscription tiers
REVENUECAT_PRODUCT_MAPPING = {
    "starter_monthly": "starter",
    "professional_monthly": "professional",
    "enterprise_monthly": "enterprise",
    # Add your actual RevenueCat product IDs
}

@router.post("/webhook/revenucat")
async def revenucat_webhook(request: Request, db = Depends(get_db)):
    """
    Handle RevenueCat webhook events for iOS subscriptions.
    Updates subscription tier in database when iOS user purchases.
    """
    try:
        body = await request.body()
        signature = request.headers.get("Authorization")
        
        # Verify webhook signature (RevenueCat provides this)
        if not _verify_revenucat_signature(body, signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        event = await request.json()
        event_type = event.get("event", {}).get("type")
        
        logger.info(f"RevenueCat webhook received: {event_type}")
        
        # Handle subscription events
        if event_type in ["INITIAL_PURCHASE", "RENEWAL", "CANCELLATION", "UNCANCELLATION"]:
            await _process_subscription_event(event, db)
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"RevenueCat webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

async def _process_subscription_event(event: Dict, db):
    """Process RevenueCat subscription event and update database"""
    event_data = event.get("event", {})
    app_user_id = event_data.get("app_user_id")  # RevenueCat user ID
    
    # Map RevenueCat user ID to your user_id
    # Option 1: Store mapping in database
    # Option 2: Use RevenueCat's original_app_user_id if you set it
    user_mapping = await db.revenucat_user_mappings.find_one({"revenucat_user_id": app_user_id})
    if not user_mapping:
        logger.warning(f"No user mapping found for RevenueCat user: {app_user_id}")
        return
    
    user_id = user_mapping["user_id"]
    
    # Get subscription info from RevenueCat event
    entitlement = event_data.get("entitlements", {})
    product_id = event_data.get("product_id", "")
    
    # Map product ID to tier
    tier = REVENUECAT_PRODUCT_MAPPING.get(product_id, "free")
    
    # Determine plan limit based on tier
    plan_limits = {
        "free": 1,
        "starter": 3,
        "professional": 999999,
        "enterprise": 999999
    }
    plan_limit = plan_limits.get(tier, 1)
    
    # Update subscription in database (same structure as Stripe)
    await db.subscriptions.update_one(
        {"user_id": user_id},
        {"$set": {
            "tier": tier,
            "status": "active" if event_data.get("type") != "CANCELLATION" else "cancelled",
            "plan_limit": plan_limit,
            "revenucat_user_id": app_user_id,
            "revenucat_product_id": product_id,
            "current_period_start": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    logger.info(f"Subscription updated for user {user_id}: tier={tier}")

def _verify_revenucat_signature(body: bytes, signature: str) -> bool:
    """Verify RevenueCat webhook signature"""
    if not REVENUECAT_WEBHOOK_SECRET:
        return True  # Skip verification in development
    
    expected_signature = hmac.new(
        REVENUECAT_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

#### 1.2 Register Route in server.py

```python
# In backend/server.py, add:
from routes.revenucat_routes import router as revenucat_router
api_router.include_router(revenucat_router, prefix="/revenucat", tags=["RevenueCat IAP"])
```

#### 1.3 Create User Mapping Collection

When iOS user logs in, create mapping between your user_id and RevenueCat app_user_id:

```python
# In iOS app or backend auth endpoint
@router.post("/auth/revenucat/link")
async def link_revenucat_user(
    revenucat_user_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Link RevenueCat user ID to your user account"""
    await db.revenucat_user_mappings.insert_one({
        "user_id": user_id,
        "revenucat_user_id": revenucat_user_id,
        "created_at": datetime.utcnow()
    })
```

### Phase 2: iOS App Implementation

#### 2.1 Authentication Flow

```swift
// iOS App - Authentication
// 1. User logs in via your API
let response = try await apiClient.login(email: email, password: password)
let accessToken = response.access_token
let userId = response.user.id

// 2. Initialize RevenueCat with your user ID
Purchases.configure(withAPIKey: "your_revenucat_api_key")
Purchases.shared.logIn(userId) { (customerInfo, error) in
    // RevenueCat now knows this user
}

// 3. Link RevenueCat user to your backend
try await apiClient.linkRevenueCatUser(
    revenucatUserId: customerInfo.originalAppUserId
)
```

#### 2.2 Subscription Purchase Flow

```swift
// iOS App - Purchase Subscription
// RevenueCat handles all IAP logic
let offerings = try await Purchases.shared.offerings()
if let package = offerings.current?.availablePackages.first {
    let purchaseResult = try await Purchases.shared.purchase(package: package)
    
    // RevenueCat webhook automatically updates your backend
    // No need to manually call your API
    
    // Just refresh subscription status
    let subscription = try await apiClient.getCurrentSubscription()
}
```

#### 2.3 Feature Access Checking

```swift
// iOS App - Check Feature Access
// Same API call as web app
let subscription = try await apiClient.getCurrentSubscription()

switch subscription.tier {
case "free":
    // Show free tier UI
case "starter", "professional", "enterprise":
    // Show premium features
}
```

---

## Feature Compatibility Matrix

| Feature | Web App | iOS App | Backend Changes Needed |
|---------|---------|---------|------------------------|
| Authentication | ✅ | ✅ | None |
| Plan Creation | ✅ | ✅ | None |
| Plan Management | ✅ | ✅ | None |
| Plan Generation | ✅ | ✅ | None |
| Section Editing | ✅ | ✅ | None |
| Financial Analysis | ✅ | ✅ | None |
| AI Chat | ✅ | ✅ | None |
| Plan Sharing | ✅ | ✅ | None |
| Export (PDF/DOCX) | ✅ | ✅ | None |
| Analytics | ✅ | ✅ | None |
| Achievements | ✅ | ✅ | None |
| Admin Features | ✅ | ✅ | None |
| **Subscriptions** | ✅ Stripe | ✅ RevenueCat | **Add webhook** |
| **Payments** | ✅ Stripe | ✅ App Store IAP | **Add webhook** |

**Result:** 99% of features work immediately. Only payment webhook needed.

---

## Database Schema Compatibility

### Current Subscription Schema (Works for Both)

```javascript
{
  _id: ObjectId,
  user_id: String,
  tier: String,              // "free" | "starter" | "professional" | "enterprise"
  status: String,            // "active" | "cancelled"
  plan_limit: Number,        // Based on tier
  plans_created_this_month: Number,
  
  // Stripe fields (for web)
  stripe_session_id: String | null,
  stripe_subscription_id: String | null,
  
  // RevenueCat fields (for iOS) - ADD THESE
  revenucat_user_id: String | null,
  revenucat_product_id: String | null,
  
  current_period_start: Date,
  updated_at: Date
}
```

**Key Point:** `tier` field is payment-provider agnostic. Both Stripe and RevenueCat update the same field.

---

## RevenueCat Configuration

### 1. RevenueCat Dashboard Setup

1. Create products in App Store Connect:
   - `starter_monthly` - £12/month
   - `professional_monthly` - £29/month
   - `enterprise_monthly` - £99/month

2. Configure in RevenueCat:
   - Map products to entitlements
   - Set up webhook URL: `https://your-backend.vercel.app/api/revenucat/webhook/revenucat`
   - Configure webhook secret

### 2. Product ID Mapping

```python
# backend/routes/revenucat_routes.py
REVENUECAT_PRODUCT_MAPPING = {
    "com.strattio.starter.monthly": "starter",
    "com.strattio.professional.monthly": "professional",
    "com.strattio.enterprise.monthly": "enterprise",
}
```

---

## Coexistence Strategy: Stripe (Web) + RevenueCat (iOS)

### Scenario 1: User on Web First, Then iOS

1. User subscribes via Stripe on web → `subscription.tier = "professional"`
2. User logs into iOS app → RevenueCat checks backend
3. RevenueCat syncs status → Updates `subscription.revenucat_user_id`
4. Both platforms work with same subscription

### Scenario 2: User on iOS First, Then Web

1. User subscribes via App Store IAP → RevenueCat webhook updates `subscription.tier = "professional"`
2. User logs into web app → Stripe checkout can upgrade/downgrade
3. Stripe webhook updates same `subscription.tier`
4. Both platforms stay in sync

### Scenario 3: Cross-Platform Subscription Management

**Option A: Platform-Specific Management**
- Web users manage via Stripe customer portal
- iOS users manage via App Store subscriptions
- Both update same database tier

**Option B: Unified Management (Advanced)**
- Add subscription management endpoint
- Check platform and redirect accordingly
- Web → Stripe portal
- iOS → App Store subscriptions

---

## API Endpoints for iOS App

### All Existing Endpoints Work ✅

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
POST   /api/auth/refresh

GET    /api/plans
POST   /api/plans
GET    /api/plans/{plan_id}
PATCH  /api/plans/{plan_id}
DELETE /api/plans/{plan_id}
POST   /api/plans/{plan_id}/generate

GET    /api/sections/{plan_id}
PATCH  /api/sections/{section_id}

GET    /api/{plan_id}/financials
GET    /api/{plan_id}/financials/charts

GET    /api/subscriptions/current
GET    /api/subscriptions/usage

POST   /api/exports
GET    /api/exports/{export_id}/download

# All other endpoints work the same
```

### New Endpoints Needed

```
POST   /api/revenucat/webhook/revenucat    # RevenueCat webhook
POST   /api/auth/revenucat/link            # Link RevenueCat user
```

---

## Implementation Checklist

### Backend (Minimal Changes)

- [ ] Create `backend/routes/revenucat_routes.py`
- [ ] Add RevenueCat webhook endpoint
- [ ] Add user mapping collection
- [ ] Add RevenueCat fields to subscription schema (optional, for tracking)
- [ ] Register route in `server.py`
- [ ] Add environment variable: `REVENUECAT_WEBHOOK_SECRET`
- [ ] Test webhook signature verification

### iOS App (New Development)

- [ ] Integrate RevenueCat SDK
- [ ] Implement authentication flow
- [ ] Link RevenueCat user to backend user
- [ ] Implement subscription purchase flow
- [ ] Implement all feature screens (reuse API endpoints)
- [ ] Handle subscription status updates
- [ ] Implement offline support (optional)

### Testing

- [ ] Test RevenueCat webhook with test events
- [ ] Test subscription purchase flow
- [ ] Test subscription cancellation
- [ ] Test cross-platform subscription sync
- [ ] Test feature access with different tiers
- [ ] Test plan limit enforcement

---

## Cost Considerations

### RevenueCat Pricing

- **Free Tier:** Up to $10k MRR
- **Growth:** $99/month + 1% of revenue
- **Pro:** Custom pricing

### App Store Fees

- 30% commission on subscriptions (first year)
- 15% commission (after first year)
- Same as current Stripe fees for web

---

## Security Considerations

### 1. Webhook Signature Verification

✅ **Critical:** Always verify RevenueCat webhook signatures to prevent fraud.

### 2. User ID Mapping

✅ **Secure:** Store mapping server-side, never trust client-provided user IDs.

### 3. Subscription Status

✅ **Server-Side Validation:** Always check subscription tier from database, never trust client.

---

## Migration Path

### Phase 1: Add RevenueCat (No Breaking Changes)
- Add webhook endpoint
- Test with sandbox purchases
- Deploy to production

### Phase 2: iOS App Development
- Build iOS app using existing API
- Integrate RevenueCat SDK
- Test end-to-end flow

### Phase 3: Launch
- Submit to App Store
- Monitor webhook events
- Support both platforms

---

## Potential Issues & Solutions

### Issue 1: Subscription Status Sync Delay

**Problem:** RevenueCat webhook might be delayed.

**Solution:** 
- iOS app can poll `/api/subscriptions/current` after purchase
- Add retry logic in webhook handler
- Use RevenueCat SDK's `customerInfo` as source of truth

### Issue 2: Cross-Platform Subscription Conflicts

**Problem:** User subscribes on iOS, then tries to subscribe on web.

**Solution:**
- Check existing subscription before creating new one
- Show message: "You already have an active subscription"
- Optionally: Allow platform-specific upgrades

### Issue 3: Subscription Cancellation

**Problem:** User cancels on iOS, but web app doesn't know.

**Solution:**
- RevenueCat webhook sends cancellation event
- Backend updates `subscription.status = "cancelled"`
- Both platforms reflect cancellation

---

## Recommended Architecture

```
┌─────────────┐         ┌─────────────┐
│   Web App   │         │   iOS App   │
│  (Stripe)   │         │ (RevenueCat)│
└──────┬──────┘         └──────┬──────┘
       │                       │
       │  JWT Auth             │  JWT Auth
       │  API Calls            │  API Calls
       │                       │
       └───────────┬───────────┘
                   │
         ┌─────────▼─────────┐
         │   FastAPI Backend  │
         │                    │
         │  ┌──────────────┐  │
         │  │  All Features│  │
         │  │  (Same APIs) │  │
         │  └──────────────┘  │
         │                    │
         │  ┌──────────────┐  │
         │  │  Webhooks    │  │
         │  │  Stripe + RC │  │
         │  └──────────────┘  │
         └─────────┬──────────┘
                   │
         ┌─────────▼─────────┐
         │   MongoDB         │
         │                    │
         │  subscriptions    │
         │  {                 │
         │    tier: "pro"    │  ← Single source of truth
         │    ...            │
         │  }                 │
         └────────────────────┘
```

---

## Conclusion

✅ **YES - You can absolutely create an iOS app using the same backend.**

### Key Points:

1. **99% of backend works as-is** - All features accessible via API
2. **Only addition needed:** RevenueCat webhook endpoint (one new file)
3. **No breaking changes** - Stripe continues working for web
4. **Same database schema** - Both payment providers update same `tier` field
5. **Platform-agnostic design** - Your backend is already mobile-ready

### Next Steps:

1. Create `revenucat_routes.py` with webhook handler
2. Test webhook with RevenueCat sandbox
3. Build iOS app using existing API endpoints
4. Integrate RevenueCat SDK in iOS app
5. Deploy and monitor

**Estimated Backend Work:** 2-4 hours  
**Estimated iOS App Work:** 4-6 weeks (depending on team size)

---

**Status:** ✅ **READY TO PROCEED**
