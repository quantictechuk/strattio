"""Compatibility layer for Stripe Checkout using native stripe package"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict
import stripe


@dataclass
class CheckoutSessionRequest:
    amount: float
    currency: str
    success_url: str
    cancel_url: str
    metadata: Dict[str, str] = field(default_factory=dict)
    payment_methods: List[str] = field(default_factory=lambda: ["card"])


@dataclass
class CheckoutSessionResponse:
    session_id: str
    url: str
    status: str = "open"


@dataclass
class CheckoutStatusResponse:
    session_id: str
    status: str
    payment_status: str
    amount_total: int
    currency: str
    metadata: Dict[str, str] = field(default_factory=dict)


@dataclass
class WebhookResponse:
    event_type: str
    event_id: str
    session_id: str
    payment_status: str


class StripeCheckout:
    """Stripe Checkout wrapper compatible with emergentintegrations interface"""
    
    def __init__(self, api_key: str, webhook_url: str = ""):
        self.api_key = api_key
        self.webhook_url = webhook_url
        stripe.api_key = api_key
    
    async def create_checkout_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        """Create a Stripe checkout session"""
        # Convert amount to cents (Stripe uses smallest currency unit)
        amount_cents = int(request.amount * 100)
        
        session = stripe.checkout.Session.create(
            payment_method_types=request.payment_methods,
            line_items=[{
                "price_data": {
                    "currency": request.currency,
                    "product_data": {
                        "name": f"Strattio Subscription - {request.metadata.get('tier', 'Plan').title()}",
                    },
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata=request.metadata,
        )
        
        return CheckoutSessionResponse(
            session_id=session.id,
            url=session.url,
            status=session.status
        )
    
    async def get_checkout_status(self, session_id: str) -> CheckoutStatusResponse:
        """Get the status of a checkout session"""
        session = stripe.checkout.Session.retrieve(session_id)
        
        return CheckoutStatusResponse(
            session_id=session.id,
            status=session.status,
            payment_status=session.payment_status or "unpaid",
            amount_total=session.amount_total or 0,
            currency=session.currency or "gbp",
            metadata=dict(session.metadata) if session.metadata else {}
        )
    
    async def handle_webhook(self, payload: bytes, signature: str) -> WebhookResponse:
        """Handle a Stripe webhook event"""
        webhook_secret = stripe.webhook_secret if hasattr(stripe, 'webhook_secret') else None
        
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
        else:
            import json
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
        
        session_id = ""
        payment_status = "unknown"
        
        if event.type == "checkout.session.completed":
            session = event.data.object
            session_id = session.id
            payment_status = session.payment_status or "paid"
        
        return WebhookResponse(
            event_type=event.type,
            event_id=event.id,
            session_id=session_id,
            payment_status=payment_status
        )
