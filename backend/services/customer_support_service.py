"""
Customer Support System
Comprehensive support ticket management and help system
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from enum import Enum
from dataclasses import dataclass

from database import get_db
from models import User, Campaign, Booking, Billboard

class TicketStatus(Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_FOR_CUSTOMER = "waiting_for_customer"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TicketCategory(Enum):
    TECHNICAL_ISSUE = "technical_issue"
    BILLING_QUESTION = "billing_question"
    CAMPAIGN_SUPPORT = "campaign_support"
    BILLBOARD_ISSUE = "billboard_issue"
    ACCOUNT_HELP = "account_help"
    FEATURE_REQUEST = "feature_request"
    BUG_REPORT = "bug_report"
    GENERAL_INQUIRY = "general_inquiry"

@dataclass
class SupportTicket:
    id: str
    user_id: int
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    subject: str
    description: str
    created_at: datetime
    updated_at: datetime
    assigned_to: Optional[str] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    messages: List[Dict[str, Any]] = None

    def __post_init__(self):
        if self.messages is None:
            self.messages = []

class CustomerSupportService:
    """Service for managing customer support tickets and help system"""
    
    def __init__(self):
        self.tickets: List[SupportTicket] = []
        self.ticket_id_counter = 1
        self.support_agents = [
            "agent_john", "agent_sarah", "agent_mike", "agent_lisa"
        ]
        
        # Support response time SLAs (in hours)
        self.sla_targets = {
            TicketPriority.URGENT: 1,
            TicketPriority.HIGH: 4,
            TicketPriority.MEDIUM: 12,
            TicketPriority.LOW: 24
        }
        
        # Initialize FAQ and help content
        self.faq_content = self._initialize_faq()
        self.help_articles = self._initialize_help_articles()
    
    def create_ticket(
        self,
        user_id: int,
        category: TicketCategory,
        subject: str,
        description: str,
        priority: Optional[TicketPriority] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new support ticket"""
        
        try:
            # Auto-determine priority if not specified
            if priority is None:
                priority = self._determine_priority(category, description)
            
            # Generate ticket ID
            ticket_id = f"TICKET_{self.ticket_id_counter:06d}"
            self.ticket_id_counter += 1
            
            # Create ticket
            ticket = SupportTicket(
                id=ticket_id,
                user_id=user_id,
                category=category,
                priority=priority,
                status=TicketStatus.OPEN,
                subject=subject,
                description=description,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                metadata=metadata or {}
            )
            
            # Auto-assign to agent based on category and workload
            assigned_agent = self._auto_assign_agent(category)
            if assigned_agent:
                ticket.assigned_to = assigned_agent
                ticket.status = TicketStatus.IN_PROGRESS
            
            # Add initial message
            ticket.messages = [{
                "id": 1,
                "sender_type": "customer",
                "sender_id": str(user_id),
                "message": description,
                "timestamp": datetime.utcnow().isoformat(),
                "attachments": []
            }]
            
            self.tickets.append(ticket)
            
            # Send confirmation notification
            self._send_ticket_confirmation(ticket)
            
            return {
                "success": True,
                "ticket_id": ticket_id,
                "status": ticket.status.value,
                "priority": ticket.priority.value,
                "assigned_to": ticket.assigned_to,
                "estimated_response_time": f"{self.sla_targets[priority]} hours",
                "message": "Ticket created successfully. You will receive email updates on progress."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create ticket: {str(e)}"
            }
    
    def add_message_to_ticket(
        self,
        ticket_id: str,
        sender_type: str,  # "customer", "agent", "system"
        sender_id: str,
        message: str,
        attachments: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Add a message to an existing ticket"""
        
        ticket = self._get_ticket(ticket_id)
        if not ticket:
            return {"success": False, "error": "Ticket not found"}
        
        try:
            # Generate message ID
            message_id = len(ticket.messages) + 1
            
            # Add message
            new_message = {
                "id": message_id,
                "sender_type": sender_type,
                "sender_id": sender_id,
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
                "attachments": attachments or []
            }
            
            ticket.messages.append(new_message)
            ticket.updated_at = datetime.utcnow()
            
            # Update ticket status based on sender
            if sender_type == "customer" and ticket.status == TicketStatus.WAITING_FOR_CUSTOMER:
                ticket.status = TicketStatus.IN_PROGRESS
            elif sender_type == "agent" and ticket.status == TicketStatus.OPEN:
                ticket.status = TicketStatus.IN_PROGRESS
            
            # Send notification
            self._send_message_notification(ticket, new_message)
            
            return {
                "success": True,
                "message_id": message_id,
                "ticket_status": ticket.status.value
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to add message: {str(e)}"
            }
    
    def update_ticket_status(
        self,
        ticket_id: str,
        new_status: TicketStatus,
        updated_by: str,
        resolution_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update ticket status"""
        
        ticket = self._get_ticket(ticket_id)
        if not ticket:
            return {"success": False, "error": "Ticket not found"}
        
        try:
            old_status = ticket.status
            ticket.status = new_status
            ticket.updated_at = datetime.utcnow()
            
            # Set resolution/closure timestamps
            if new_status == TicketStatus.RESOLVED and not ticket.resolved_at:
                ticket.resolved_at = datetime.utcnow()
            elif new_status == TicketStatus.CLOSED and not ticket.closed_at:
                ticket.closed_at = datetime.utcnow()
            
            # Add system message about status change
            if resolution_note:
                self.add_message_to_ticket(
                    ticket_id=ticket_id,
                    sender_type="system",
                    sender_id=updated_by,
                    message=f"Status changed from {old_status.value} to {new_status.value}. {resolution_note}"
                )
            
            # Send notification about status change
            self._send_status_change_notification(ticket, old_status, new_status)
            
            return {
                "success": True,
                "old_status": old_status.value,
                "new_status": new_status.value,
                "updated_at": ticket.updated_at.isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to update status: {str(e)}"
            }
    
    def get_user_tickets(
        self,
        user_id: int,
        status: Optional[TicketStatus] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get tickets for a specific user"""
        
        user_tickets = [t for t in self.tickets if t.user_id == user_id]
        
        # Filter by status if specified
        if status:
            user_tickets = [t for t in user_tickets if t.status == status]
        
        # Sort by creation date (newest first) and limit
        user_tickets = sorted(user_tickets, key=lambda x: x.created_at, reverse=True)[:limit]
        
        return [self._ticket_to_dict(ticket) for ticket in user_tickets]
    
    def get_ticket_details(self, ticket_id: str, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Get detailed ticket information"""
        
        ticket = self._get_ticket(ticket_id)
        if not ticket:
            return None
        
        # Check access permissions
        if user_id and ticket.user_id != user_id:
            return None
        
        return self._ticket_to_dict(ticket, include_messages=True)
    
    def search_faq(self, query: str) -> List[Dict[str, Any]]:
        """Search FAQ content"""
        
        query = query.lower()
        matching_faqs = []
        
        for faq in self.faq_content:
            # Simple text matching
            if (query in faq["question"].lower() or 
                query in faq["answer"].lower() or
                any(tag.lower() in query for tag in faq["tags"])):
                matching_faqs.append(faq)
        
        # Sort by relevance (simple scoring)
        def relevance_score(faq):
            score = 0
            if query in faq["question"].lower():
                score += 10
            if query in faq["answer"].lower():
                score += 5
            for tag in faq["tags"]:
                if tag.lower() in query:
                    score += 3
            return score
        
        matching_faqs.sort(key=relevance_score, reverse=True)
        
        return matching_faqs[:10]  # Return top 10 matches
    
    def get_help_articles(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get help articles"""
        
        if category:
            return [article for article in self.help_articles if article["category"] == category]
        
        return self.help_articles
    
    def get_support_stats(self) -> Dict[str, Any]:
        """Get support system statistics"""
        
        now = datetime.utcnow()
        last_24h = now - timedelta(days=1)
        last_7d = now - timedelta(days=7)
        
        # Calculate various metrics
        total_tickets = len(self.tickets)
        open_tickets = len([t for t in self.tickets if t.status in [TicketStatus.OPEN, TicketStatus.IN_PROGRESS]])
        tickets_24h = len([t for t in self.tickets if t.created_at >= last_24h])
        tickets_7d = len([t for t in self.tickets if t.created_at >= last_7d])
        
        # Calculate average resolution time
        resolved_tickets = [t for t in self.tickets if t.resolved_at]
        avg_resolution_time = 0
        if resolved_tickets:
            total_resolution_time = sum(
                (t.resolved_at - t.created_at).total_seconds() / 3600 
                for t in resolved_tickets
            )
            avg_resolution_time = total_resolution_time / len(resolved_tickets)
        
        # SLA compliance
        sla_breaches = 0
        for ticket in self.tickets:
            if ticket.status != TicketStatus.CLOSED:
                hours_open = (now - ticket.created_at).total_seconds() / 3600
                sla_target = self.sla_targets[ticket.priority]
                if hours_open > sla_target:
                    sla_breaches += 1
        
        return {
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "tickets_last_24h": tickets_24h,
            "tickets_last_7d": tickets_7d,
            "average_resolution_time_hours": round(avg_resolution_time, 2),
            "sla_breaches": sla_breaches,
            "sla_compliance_rate": round((1 - sla_breaches / max(open_tickets, 1)) * 100, 2),
            "tickets_by_status": {
                status.value: len([t for t in self.tickets if t.status == status])
                for status in TicketStatus
            },
            "tickets_by_priority": {
                priority.value: len([t for t in self.tickets if t.priority == priority])
                for priority in TicketPriority
            },
            "tickets_by_category": {
                category.value: len([t for t in self.tickets if t.category == category])
                for category in TicketCategory
            }
        }
    
    def _get_ticket(self, ticket_id: str) -> Optional[SupportTicket]:
        """Get ticket by ID"""
        return next((t for t in self.tickets if t.id == ticket_id), None)
    
    def _determine_priority(self, category: TicketCategory, description: str) -> TicketPriority:
        """Auto-determine ticket priority"""
        
        description_lower = description.lower()
        
        # Urgent keywords
        urgent_keywords = ["urgent", "emergency", "critical", "down", "not working", "broken", "payment failed"]
        if any(keyword in description_lower for keyword in urgent_keywords):
            return TicketPriority.URGENT
        
        # High priority categories
        if category in [TicketCategory.TECHNICAL_ISSUE, TicketCategory.BILLING_QUESTION]:
            return TicketPriority.HIGH
        
        # Medium priority keywords
        medium_keywords = ["problem", "issue", "error", "bug"]
        if any(keyword in description_lower for keyword in medium_keywords):
            return TicketPriority.MEDIUM
        
        # Default to low priority
        return TicketPriority.LOW
    
    def _auto_assign_agent(self, category: TicketCategory) -> Optional[str]:
        """Auto-assign agent based on category and workload"""
        
        # Simplified assignment logic
        category_assignments = {
            TicketCategory.TECHNICAL_ISSUE: "agent_mike",
            TicketCategory.BILLING_QUESTION: "agent_sarah",
            TicketCategory.CAMPAIGN_SUPPORT: "agent_john",
            TicketCategory.BILLBOARD_ISSUE: "agent_mike",
            TicketCategory.ACCOUNT_HELP: "agent_lisa"
        }
        
        return category_assignments.get(category, "agent_john")
    
    def _ticket_to_dict(self, ticket: SupportTicket, include_messages: bool = False) -> Dict[str, Any]:
        """Convert ticket to dictionary"""
        
        result = {
            "id": ticket.id,
            "user_id": ticket.user_id,
            "category": ticket.category.value,
            "priority": ticket.priority.value,
            "status": ticket.status.value,
            "subject": ticket.subject,
            "description": ticket.description,
            "created_at": ticket.created_at.isoformat(),
            "updated_at": ticket.updated_at.isoformat(),
            "assigned_to": ticket.assigned_to,
            "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
            "closed_at": ticket.closed_at.isoformat() if ticket.closed_at else None,
            "metadata": ticket.metadata
        }
        
        if include_messages:
            result["messages"] = ticket.messages
            result["message_count"] = len(ticket.messages)
        
        return result
    
    def _send_ticket_confirmation(self, ticket: SupportTicket):
        """Send ticket creation confirmation"""
        
        notification = {
            "type": "ticket_created",
            "ticket_id": ticket.id,
            "user_id": ticket.user_id,
            "subject": ticket.subject,
            "priority": ticket.priority.value,
            "estimated_response": f"{self.sla_targets[ticket.priority]} hours"
        }
        
        print(f"📧 Ticket confirmation sent: {notification}")
    
    def _send_message_notification(self, ticket: SupportTicket, message: Dict[str, Any]):
        """Send notification about new message"""
        
        notification = {
            "type": "ticket_message",
            "ticket_id": ticket.id,
            "message_id": message["id"],
            "sender_type": message["sender_type"],
            "preview": message["message"][:100] + "..." if len(message["message"]) > 100 else message["message"]
        }
        
        print(f"📧 Message notification sent: {notification}")
    
    def _send_status_change_notification(
        self, 
        ticket: SupportTicket, 
        old_status: TicketStatus, 
        new_status: TicketStatus
    ):
        """Send notification about status change"""
        
        notification = {
            "type": "ticket_status_change",
            "ticket_id": ticket.id,
            "user_id": ticket.user_id,
            "old_status": old_status.value,
            "new_status": new_status.value,
            "subject": ticket.subject
        }
        
        print(f"📧 Status change notification sent: {notification}")
    
    def _initialize_faq(self) -> List[Dict[str, Any]]:
        """Initialize FAQ content"""
        
        return [
            {
                "id": 1,
                "question": "How do I create a campaign?",
                "answer": "To create a campaign, go to the Dashboard and click 'Create Campaign'. Fill in your campaign details, select a billboard, set dates, and upload your creative content.",
                "category": "campaigns",
                "tags": ["campaign", "create", "getting started"]
            },
            {
                "id": 2,
                "question": "Why was my payment declined?",
                "answer": "Payment can be declined for several reasons: insufficient funds, expired card, bank restrictions, or incorrect billing information. Please check with your bank or try a different payment method.",
                "category": "billing",
                "tags": ["payment", "declined", "billing"]
            },
            {
                "id": 3,
                "question": "How do I register my billboard?",
                "answer": "To register your billboard, click 'Register Billboard' in your dashboard, fill in location details, upload photos, and submit for approval. Our team will review within 48 hours.",
                "category": "billboards",
                "tags": ["billboard", "register", "owner"]
            },
            {
                "id": 4,
                "question": "What file formats are supported for campaigns?",
                "answer": "We support JPG, PNG, GIF images up to 10MB, and MP4 videos up to 100MB. Images should be at least 1920x1080 resolution for best quality.",
                "category": "technical",
                "tags": ["files", "formats", "upload", "media"]
            },
            {
                "id": 5,
                "question": "How is billing calculated?",
                "answer": "Billing is based on daily rates set by billboard owners. Total cost = Daily Rate × Number of Days + 20% platform fee. You pay upfront when booking is confirmed.",
                "category": "billing",
                "tags": ["billing", "cost", "pricing", "calculation"]
            }
        ]
    
    def _initialize_help_articles(self) -> List[Dict[str, Any]]:
        """Initialize help articles"""
        
        return [
            {
                "id": 1,
                "title": "Getting Started with AdFlow",
                "category": "getting_started",
                "content": "Welcome to AdFlow! This guide will help you get started with creating your first billboard campaign...",
                "tags": ["getting started", "tutorial", "basics"],
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": 2,
                "title": "Billboard Owner Guide",
                "category": "billboard_owners",
                "content": "Learn how to register your billboard, set rates, manage bookings, and maximize your earnings...",
                "tags": ["billboard owner", "registration", "earnings"],
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": 3,
                "title": "Campaign Best Practices",
                "category": "campaigns",
                "content": "Tips for creating effective billboard campaigns that get results...",
                "tags": ["campaigns", "best practices", "tips"],
                "created_at": datetime.utcnow().isoformat()
            }
        ]

# Create customer support service instance
customer_support_service = CustomerSupportService()
