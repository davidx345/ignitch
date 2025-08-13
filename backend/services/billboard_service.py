import stripe
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from fastapi import HTTPException, status
from geopy.distance import geodesic
import json

from models import (
    Billboard, BillboardOwner, BillboardBooking, 
    BillboardReview, BillboardAnalytics, User
)
from schemas.billboard_schemas import (
    BillboardCreate, BillboardUpdate, BillboardSearchFilters,
    BillboardBookingCreate, BookingQuote, BillboardOwnerOnboarding
)

class BillboardService:
    def __init__(self, db: Session):
        self.db = db
        stripe.api_key = "sk_test_..."  # Set from environment variable
    
    # Billboard Owner Operations
    async def create_billboard_owner(self, user_id: str, owner_data: BillboardOwnerOnboarding) -> BillboardOwner:
        """Create a new billboard owner profile"""
        
        # Check if user already has a billboard owner profile
        existing_owner = self.db.query(BillboardOwner).filter(
            BillboardOwner.user_id == user_id
        ).first()
        
        if existing_owner:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has a billboard owner profile"
            )
        
        # Create Stripe Connect account
        stripe_account = await self._create_stripe_connect_account(owner_data)
        
        billboard_owner = BillboardOwner(
            user_id=user_id,
            company_name=owner_data.company_name,
            contact_person=owner_data.contact_person,
            phone=owner_data.phone,
            email=owner_data.email,
            address=owner_data.address,
            business_license=owner_data.business_license,
            tax_id=owner_data.tax_id,
            stripe_account_id=stripe_account.id,
            status="pending"
        )
        
        self.db.add(billboard_owner)
        self.db.commit()
        self.db.refresh(billboard_owner)
        
        return billboard_owner
    
    async def _create_stripe_connect_account(self, owner_data: BillboardOwnerOnboarding) -> stripe.Account:
        """Create Stripe Connect account for billboard owner"""
        try:
            account = stripe.Account.create(
                type="express",
                email=owner_data.email,
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                },
                business_profile={
                    "name": owner_data.company_name,
                    "support_phone": owner_data.phone,
                    "url": "https://yourdomain.com",
                }
            )
            return account
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create Stripe account: {str(e)}"
            )
    
    def get_onboarding_progress(self, user_id: str) -> Dict[str, Any]:
        """Get billboard owner onboarding progress"""
        owner = self.db.query(BillboardOwner).filter(
            BillboardOwner.user_id == user_id
        ).first()
        
        if not owner:
            return {
                "profile_completed": False,
                "bank_details_added": False,
                "first_billboard_created": False,
                "stripe_connected": False,
                "verification_completed": False,
                "overall_progress": 0
            }
        
        # Check Stripe account status
        stripe_connected = False
        if owner.stripe_account_id:
            try:
                account = stripe.Account.retrieve(owner.stripe_account_id)
                stripe_connected = account.details_submitted
            except:
                pass
        
        # Check if first billboard exists
        first_billboard = self.db.query(Billboard).filter(
            Billboard.owner_id == owner.id
        ).first() is not None
        
        progress = {
            "profile_completed": True,
            "bank_details_added": owner.bank_account_details is not None,
            "first_billboard_created": first_billboard,
            "stripe_connected": stripe_connected,
            "verification_completed": owner.status == "approved",
            "overall_progress": 0
        }
        
        # Calculate overall progress
        completed_steps = sum([1 for step in progress.values() if isinstance(step, bool) and step])
        progress["overall_progress"] = (completed_steps / 5) * 100
        
        return progress
    
    # Billboard Operations
    async def create_billboard(self, owner_id: str, billboard_data: BillboardCreate) -> Billboard:
        """Create a new billboard listing"""
        
        # Verify owner exists and is approved
        owner = self.db.query(BillboardOwner).filter(
            BillboardOwner.id == owner_id,
            BillboardOwner.status == "approved"
        ).first()
        
        if not owner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Billboard owner not found or not approved"
            )
        
        # Geocode address if needed (placeholder for geocoding service)
        lat, lng = await self._geocode_address(
            f"{billboard_data.address}, {billboard_data.city}, {billboard_data.state}"
        )
        
        billboard = Billboard(
            owner_id=owner_id,
            name=billboard_data.name,
            description=billboard_data.description,
            address=billboard_data.address,
            city=billboard_data.city,
            state=billboard_data.state,
            zip_code=billboard_data.zip_code,
            country=billboard_data.country,
            latitude=lat or billboard_data.latitude,
            longitude=lng or billboard_data.longitude,
            width_feet=billboard_data.width_feet,
            height_feet=billboard_data.height_feet,
            billboard_type=billboard_data.billboard_type,
            orientation=billboard_data.orientation,
            illuminated=billboard_data.illuminated,
            double_sided=billboard_data.double_sided,
            daily_rate=billboard_data.daily_rate,
            weekly_rate=billboard_data.weekly_rate,
            monthly_rate=billboard_data.monthly_rate,
            minimum_booking_days=billboard_data.minimum_booking_days,
            daily_impressions=billboard_data.daily_impressions,
            traffic_count=billboard_data.traffic_count,
            demographics=billboard_data.demographics,
            photos=billboard_data.photos,
            location_photos=billboard_data.location_photos,
            specs_document=billboard_data.specs_document,
            requires_approval=billboard_data.requires_approval,
            content_restrictions=billboard_data.content_restrictions,
            blackout_dates=[date.isoformat() for date in billboard_data.blackout_dates] if billboard_data.blackout_dates else []
        )
        
        self.db.add(billboard)
        self.db.commit()
        self.db.refresh(billboard)
        
        return billboard
    
    async def _geocode_address(self, address: str) -> tuple[Optional[float], Optional[float]]:
        """Geocode address to get latitude and longitude"""
        # Placeholder for geocoding service (Google Maps, Mapbox, etc.)
        # In production, use actual geocoding service
        return None, None
    
    def search_billboards(self, filters: BillboardSearchFilters, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Search billboards with filters"""
        query = self.db.query(Billboard).filter(Billboard.is_active == True)
        
        # Apply filters
        if filters.city:
            query = query.filter(Billboard.city.ilike(f"%{filters.city}%"))
        
        if filters.state:
            query = query.filter(Billboard.state.ilike(f"%{filters.state}%"))
        
        if filters.min_daily_rate:
            query = query.filter(Billboard.daily_rate >= filters.min_daily_rate)
        
        if filters.max_daily_rate:
            query = query.filter(Billboard.daily_rate <= filters.max_daily_rate)
        
        if filters.billboard_type:
            query = query.filter(Billboard.billboard_type == filters.billboard_type)
        
        if filters.min_impressions:
            query = query.filter(Billboard.daily_impressions >= filters.min_impressions)
        
        if filters.illuminated is not None:
            query = query.filter(Billboard.illuminated == filters.illuminated)
        
        # Date availability filter
        if filters.available_from and filters.available_to:
            # Check for booking conflicts
            conflicting_bookings = self.db.query(BillboardBooking).filter(
                and_(
                    BillboardBooking.status.in_(["approved", "active"]),
                    or_(
                        and_(
                            BillboardBooking.start_date <= filters.available_from,
                            BillboardBooking.end_date >= filters.available_from
                        ),
                        and_(
                            BillboardBooking.start_date <= filters.available_to,
                            BillboardBooking.end_date >= filters.available_to
                        ),
                        and_(
                            BillboardBooking.start_date >= filters.available_from,
                            BillboardBooking.end_date <= filters.available_to
                        )
                    )
                )
            ).subquery()
            
            query = query.filter(
                ~Billboard.id.in_(
                    self.db.query(conflicting_bookings.c.billboard_id)
                )
            )
        
        # Geographic distance filter
        if filters.max_distance_miles and filters.latitude and filters.longitude:
            # Note: This is a simplified distance calculation
            # In production, use PostGIS or similar for accurate geographic queries
            lat_range = filters.max_distance_miles / 69.0  # Rough miles to degrees
            lng_range = filters.max_distance_miles / 54.6  # Rough miles to degrees
            
            query = query.filter(
                and_(
                    Billboard.latitude.between(
                        filters.latitude - lat_range,
                        filters.latitude + lat_range
                    ),
                    Billboard.longitude.between(
                        filters.longitude - lng_range,
                        filters.longitude + lng_range
                    )
                )
            )
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        billboards = query.offset(offset).limit(per_page).all()
        
        # Calculate additional fields for each billboard
        for billboard in billboards:
            # Average rating
            avg_rating = self.db.query(func.avg(BillboardReview.rating)).filter(
                BillboardReview.billboard_id == billboard.id
            ).scalar()
            billboard.average_rating = round(avg_rating, 1) if avg_rating else None
            
            # Total reviews
            billboard.total_reviews = self.db.query(BillboardReview).filter(
                BillboardReview.billboard_id == billboard.id
            ).count()
        
        return {
            "billboards": billboards,
            "total_count": total_count,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_count + per_page - 1) // per_page
        }
    
    # Booking Operations
    async def create_booking_quote(self, booking_data: BillboardBookingCreate) -> BookingQuote:
        """Generate a booking quote"""
        billboard = self.db.query(Billboard).filter(
            Billboard.id == booking_data.billboard_id,
            Billboard.is_active == True
        ).first()
        
        if not billboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Billboard not found"
            )
        
        # Calculate total days
        total_days = (booking_data.end_date - booking_data.start_date).days
        
        if total_days < billboard.minimum_booking_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum booking period is {billboard.minimum_booking_days} days"
            )
        
        # Check availability
        conflicts = []
        available = True
        
        # Check existing bookings
        existing_bookings = self.db.query(BillboardBooking).filter(
            and_(
                BillboardBooking.billboard_id == booking_data.billboard_id,
                BillboardBooking.status.in_(["pending", "approved", "active"]),
                or_(
                    and_(
                        BillboardBooking.start_date <= booking_data.start_date,
                        BillboardBooking.end_date >= booking_data.start_date
                    ),
                    and_(
                        BillboardBooking.start_date <= booking_data.end_date,
                        BillboardBooking.end_date >= booking_data.end_date
                    ),
                    and_(
                        BillboardBooking.start_date >= booking_data.start_date,
                        BillboardBooking.end_date <= booking_data.end_date
                    )
                )
            )
        ).all()
        
        if existing_bookings:
            available = False
            conflicts = [f"Booking conflict from {booking.start_date} to {booking.end_date}" 
                        for booking in existing_bookings]
        
        # Check blackout dates
        if billboard.blackout_dates:
            blackout_dates = [datetime.fromisoformat(date_str).date() 
                            for date_str in billboard.blackout_dates]
            current_date = booking_data.start_date
            while current_date <= booking_data.end_date:
                if current_date in blackout_dates:
                    available = False
                    conflicts.append(f"Blackout date: {current_date}")
                current_date += timedelta(days=1)
        
        # Calculate pricing
        if total_days >= 28:  # Monthly rate
            daily_rate = billboard.monthly_rate / 30
        elif total_days >= 7:  # Weekly rate
            daily_rate = billboard.weekly_rate / 7
        else:  # Daily rate
            daily_rate = billboard.daily_rate
        
        subtotal = daily_rate * total_days
        platform_fee = subtotal * 0.12  # 12% platform fee
        total_amount = subtotal + platform_fee
        
        return BookingQuote(
            billboard_id=booking_data.billboard_id,
            start_date=booking_data.start_date,
            end_date=booking_data.end_date,
            total_days=total_days,
            daily_rate=daily_rate,
            subtotal=subtotal,
            platform_fee=platform_fee,
            total_amount=total_amount,
            available=available,
            conflicts=conflicts
        )
    
    async def create_booking(self, user_id: str, booking_data: BillboardBookingCreate) -> BillboardBooking:
        """Create a new billboard booking"""
        
        # Generate quote first to validate and get pricing
        quote = await self.create_booking_quote(booking_data)
        
        if not quote.available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Billboard not available for selected dates: {', '.join(quote.conflicts)}"
            )
        
        booking = BillboardBooking(
            user_id=user_id,
            billboard_id=booking_data.billboard_id,
            start_date=booking_data.start_date,
            end_date=booking_data.end_date,
            total_days=quote.total_days,
            content_title=booking_data.content_title,
            content_description=booking_data.content_description,
            creative_urls=booking_data.creative_urls,
            daily_rate=quote.daily_rate,
            subtotal=quote.subtotal,
            platform_fee=quote.platform_fee,
            total_amount=quote.total_amount,
            special_requests=booking_data.special_requests,
            status="pending"
        )
        
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        
        return booking
    
    # Payment Operations
    async def create_payment_intent(self, booking_id: str, user_id: str) -> Dict[str, Any]:
        """Create Stripe payment intent for booking"""
        booking = self.db.query(BillboardBooking).filter(
            and_(
                BillboardBooking.id == booking_id,
                BillboardBooking.user_id == user_id,
                BillboardBooking.status == "pending"
            )
        ).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Get billboard owner's Stripe account
        billboard = self.db.query(Billboard).filter(
            Billboard.id == booking.billboard_id
        ).first()
        
        owner = self.db.query(BillboardOwner).filter(
            BillboardOwner.id == billboard.owner_id
        ).first()
        
        try:
            # Create payment intent with Stripe Connect
            payment_intent = stripe.PaymentIntent.create(
                amount=int(booking.total_amount * 100),  # Amount in cents
                currency='usd',
                application_fee_amount=int(booking.platform_fee * 100),
                transfer_data={
                    'destination': owner.stripe_account_id,
                },
                metadata={
                    'booking_id': booking_id,
                    'billboard_id': booking.billboard_id,
                    'user_id': user_id
                }
            )
            
            # Update booking with payment intent
            booking.payment_intent_id = payment_intent.id
            self.db.commit()
            
            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id,
                "amount": booking.total_amount,
                "currency": "usd"
            }
            
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment setup failed: {str(e)}"
            )
    
    async def confirm_payment(self, payment_intent_id: str) -> BillboardBooking:
        """Confirm payment and update booking status"""
        booking = self.db.query(BillboardBooking).filter(
            BillboardBooking.payment_intent_id == payment_intent_id
        ).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        try:
            # Retrieve payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status == "succeeded":
                booking.payment_status = "paid"
                booking.status = "approved"  # Auto-approve after payment
                self.db.commit()
                
                # Send notifications (implement notification service)
                await self._send_booking_notifications(booking)
                
            elif payment_intent.status == "payment_failed":
                booking.payment_status = "failed"
                self.db.commit()
                
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment confirmation failed: {str(e)}"
            )
        
        return booking
    
    async def _send_booking_notifications(self, booking: BillboardBooking):
        """Send notifications for new booking"""
        # Placeholder for notification service
        # Send email to billboard owner
        # Send confirmation to customer
        # Send admin notification if needed
        pass
    
    # Analytics and Reporting
    def get_billboard_analytics(self, billboard_id: str, start_date: date, end_date: date) -> List[BillboardAnalytics]:
        """Get analytics for a specific billboard"""
        return self.db.query(BillboardAnalytics).filter(
            and_(
                BillboardAnalytics.billboard_id == billboard_id,
                BillboardAnalytics.date >= start_date,
                BillboardAnalytics.date <= end_date
            )
        ).all()
    
    def get_owner_dashboard_stats(self, owner_id: str) -> Dict[str, Any]:
        """Get dashboard statistics for billboard owner"""
        
        # Get all billboards for owner
        billboards = self.db.query(Billboard).filter(
            Billboard.owner_id == owner_id
        ).all()
        
        billboard_ids = [b.id for b in billboards]
        
        # Get booking statistics
        total_bookings = self.db.query(BillboardBooking).filter(
            BillboardBooking.billboard_id.in_(billboard_ids)
        ).count()
        
        active_bookings = self.db.query(BillboardBooking).filter(
            and_(
                BillboardBooking.billboard_id.in_(billboard_ids),
                BillboardBooking.status == "active"
            )
        ).count()
        
        # Calculate revenue (last 30 days)
        thirty_days_ago = date.today() - timedelta(days=30)
        recent_revenue = self.db.query(func.sum(BillboardBooking.subtotal)).filter(
            and_(
                BillboardBooking.billboard_id.in_(billboard_ids),
                BillboardBooking.payment_status == "paid",
                BillboardBooking.created_at >= thirty_days_ago
            )
        ).scalar() or 0
        
        # Average rating
        avg_rating = self.db.query(func.avg(BillboardReview.rating)).filter(
            BillboardReview.billboard_id.in_(billboard_ids)
        ).scalar()
        
        return {
            "total_billboards": len(billboards),
            "active_billboards": len([b for b in billboards if b.is_active]),
            "total_bookings": total_bookings,
            "active_bookings": active_bookings,
            "revenue_last_30_days": float(recent_revenue),
            "average_rating": round(avg_rating, 1) if avg_rating else None,
            "total_reviews": self.db.query(BillboardReview).filter(
                BillboardReview.billboard_id.in_(billboard_ids)
            ).count()
        }
