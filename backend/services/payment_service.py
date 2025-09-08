"""
Payment Service
Handles payment processing for billboard bookings using Paystack (Nigeria)
"""

import os
import httpx
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import HTTPException
from pydantic import BaseModel

class PaymentInitRequest(BaseModel):
    email: str
    amount: int  # Amount in kobo (NGN cents)
    booking_id: str
    callback_url: str
    metadata: Optional[Dict] = {}

class PaymentVerifyResponse(BaseModel):
    success: bool
    amount: int
    currency: str
    transaction_date: datetime
    reference: str
    gateway_response: str

class PaystackService:
    def __init__(self):
        self.secret_key = os.getenv("PAYSTACK_SECRET_KEY")
        self.public_key = os.getenv("PAYSTACK_PUBLIC_KEY") 
        self.base_url = "https://api.paystack.co"
        
        if not self.secret_key:
            print("⚠️  PAYSTACK_SECRET_KEY not found in environment")
            self.secret_key = "sk_test_placeholder"  # For development
    
    async def initialize_payment(self, payment_request: PaymentInitRequest) -> Dict[str, Any]:
        """Initialize payment with Paystack"""
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "email": payment_request.email,
            "amount": payment_request.amount,  # Amount in kobo
            "reference": f"adflow_{payment_request.booking_id}_{int(datetime.now().timestamp())}",
            "callback_url": payment_request.callback_url,
            "metadata": {
                "booking_id": payment_request.booking_id,
                **payment_request.metadata
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/transaction/initialize",
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )
                
            if response.status_code == 200:
                result = response.json()
                if result.get("status"):
                    return {
                        "success": True,
                        "authorization_url": result["data"]["authorization_url"],
                        "access_code": result["data"]["access_code"],
                        "reference": result["data"]["reference"]
                    }
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Paystack error: {result.get('message', 'Unknown error')}"
                    )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Paystack API error: {response.text}"
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Payment service unavailable: {str(e)}"
            )
    
    async def verify_payment(self, reference: str) -> PaymentVerifyResponse:
        """Verify payment with Paystack"""
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/transaction/verify/{reference}",
                    headers=headers,
                    timeout=30.0
                )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get("status"):
                    data = result["data"]
                    
                    return PaymentVerifyResponse(
                        success=data["status"] == "success",
                        amount=data["amount"],
                        currency=data["currency"],
                        transaction_date=datetime.fromisoformat(data["transaction_date"].replace("Z", "+00:00")),
                        reference=data["reference"],
                        gateway_response=data["gateway_response"]
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Verification failed: {result.get('message')}"
                    )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Verification API error: {response.text}"
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Payment verification service unavailable: {str(e)}"
            )

class PaymentService:
    def __init__(self):
        self.paystack = PaystackService()
    
    async def create_payment_intent(
        self,
        booking_id: str,
        amount_ngn: float,
        customer_email: str,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Create payment intent for billboard booking"""
        
        # Convert NGN to kobo (Paystack uses kobo)
        amount_kobo = int(amount_ngn * 100)
        
        payment_request = PaymentInitRequest(
            email=customer_email,
            amount=amount_kobo,
            booking_id=booking_id,
            callback_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/callback",
            metadata=metadata or {}
        )
        
        return await self.paystack.initialize_payment(payment_request)
    
    async def verify_payment_completion(self, reference: str) -> PaymentVerifyResponse:
        """Verify that payment was completed successfully"""
        return await self.paystack.verify_payment(reference)
    
    def calculate_platform_fee(self, amount: float, fee_percentage: float = 20.0) -> Dict[str, float]:
        """Calculate platform fees for billboard booking"""
        
        platform_fee = amount * (fee_percentage / 100)
        owner_payout = amount - platform_fee
        
        return {
            "subtotal": amount,
            "platform_fee": platform_fee,
            "total_amount": amount + platform_fee,
            "owner_payout": owner_payout
        }
    
    async def process_owner_payout(
        self,
        owner_account: Dict[str, str],
        amount_ngn: float,
        reference: str
    ) -> Dict[str, Any]:
        """Process payout to billboard owner (future implementation)"""
        
        # This would integrate with Paystack Transfer API
        # For now, we'll just log the payout request
        
        print(f"📤 Payout Request:")
        print(f"   Amount: ₦{amount_ngn:,.2f}")
        print(f"   Account: {owner_account.get('account_number', 'N/A')}")
        print(f"   Bank: {owner_account.get('bank_code', 'N/A')}")
        print(f"   Reference: {reference}")
        
        return {
            "success": True,
            "message": "Payout queued for processing",
            "reference": reference,
            "status": "pending"
        }

# Global payment service instance
payment_service = PaymentService()
