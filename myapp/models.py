from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# 1. Kudumbashree Group Model (Local Ayalkootam Unit)
class KudumbashreeGroup(models.Model):
    name = models.CharField(max_length=150, unique=True)
    ward = models.CharField(max_length=50)
    panchayath = models.CharField(max_length=100)
    registration_number = models.CharField(max_length=100, unique=True)
    established_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (Ward: {self.ward})"

# 2. User Profile Model (Extended User details for Roles)
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'System Administrator'),
        ('president', 'President'),
        ('secretary', 'Secretary'),
        ('member', 'Kudumbashree Member'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved & Active'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    phone = models.CharField(max_length=15, blank=True, null=True)
    group = models.ForeignKey(KudumbashreeGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()} ({self.get_status_display()})"

# 3. Digital Attendance Model (Manual Only)
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('leave', 'On Leave'),
    ]

    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_by')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('member', 'date')

    def __str__(self):
        return f"{self.member.username} - {self.date} - {self.status}"

# 4. Loan Management Model
class Loan(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved & Active'),
        ('rejected', 'Rejected'),
        ('repaid', 'Fully Repaid'),
    ]

    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    purpose = models.TextField()
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=4.00) # e.g., 4% interest
    duration_months = models.IntegerField(default=12)
    repaid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    request_date = models.DateField(auto_now_add=True)
    approval_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Loan of ₹{self.amount} by {self.member.username} ({self.status})"

# 5. Chitty Fund Model
class Chitty(models.Model):
    name = models.CharField(max_length=150)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    monthly_contribution = models.DecimalField(max_digits=10, decimal_places=2)
    duration_months = models.IntegerField(default=10)
    start_date = models.DateField(default=timezone.now)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} (₹{self.monthly_contribution}/month)"

# 6. Chitty Payments Model
class ChittyPayment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ]

    chitty = models.ForeignKey(Chitty, on_delete=models.CASCADE, related_name='payments')
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chitty_payments')
    month_number = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('chitty', 'member', 'month_number')

    def __str__(self):
        return f"{self.member.username} - {self.chitty.name} Month {self.month_number} ({self.status})"

# 7. Meeting Management Model
class Meeting(models.Model):
    group = models.ForeignKey(KudumbashreeGroup, on_delete=models.CASCADE, related_name='meetings')
    title = models.CharField(max_length=200)
    agenda = models.TextField()
    date_time = models.DateTimeField(default=timezone.now)
    venue = models.CharField(max_length=200, default='Group Office')
    minutes_note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.title} on {self.date_time.date()}"

# 8. Event Management Model (Wider celebrations/campaigns)
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date_time = models.DateTimeField(default=timezone.now)
    venue = models.CharField(max_length=200)
    gallery_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# 9. Micro Enterprise Model
class MicroEnterprise(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100) # e.g. Food Processing, Handicrafts, Garments
    description = models.TextField()
    group = models.ForeignKey(KudumbashreeGroup, on_delete=models.CASCADE, related_name='enterprises')
    leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='led_enterprises')
    established_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.category})"

# 10. Inventory/Products Model
class InventoryItem(models.Model):
    enterprise = models.ForeignKey(MicroEnterprise, on_delete=models.CASCADE, related_name='inventory', null=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='General')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    min_stock_level = models.IntegerField(default=5)  # Alert threshold
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.stock_quantity} units"

# 11. Expense & Income Ledger Model
class Transaction(models.Model):
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    group = models.ForeignKey(KudumbashreeGroup, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=100) # e.g., Loan Interest, Membership Fee, Rent, Stationery
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(default=timezone.now)
    description = models.TextField(blank=True, null=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.transaction_type.capitalize()} - ₹{self.amount} on {self.date}"

# 12. Complaint & Grievance Model
class Complaint(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('in_progress', 'Under Investigation'),
        ('resolved', 'Resolved'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='submitted')
    secretary_response = models.TextField(blank=True, null=True)
    admin_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Complaint: {self.title} ({self.status})"

# 13. Welfare Schemes Tracking Model
class WelfareScheme(models.Model):
    title = models.CharField(max_length=250)
    description = models.TextField()
    eligibility_criteria = models.TextField()
    benefits = models.TextField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SchemeApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    scheme = models.ForeignKey(WelfareScheme, on_delete=models.CASCADE, related_name='applications')
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheme_applications')
    applied_date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='applied')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.member.username} -> {self.scheme.title} ({self.status})"

# 14. Digital Document Management Model
class Document(models.Model):
    TYPE_CHOICES = [
        ('id_card', 'Member ID Card'),
        ('loan_doc', 'Loan Agreement'),
        ('certificate', 'Certificate'),
        ('agreement', 'Written Agreement'),
        ('other', 'Other Document'),
    ]

    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    file = models.FileField(upload_to='documents/')
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_document_type_display()}) - {self.member.username}"

# 15. Group Chat Message Model (Real-time mockup)
class ChatMessage(models.Model):
    group = models.ForeignKey(KudumbashreeGroup, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    message = models.TextField(blank=True, null=True)
    media_file = models.FileField(upload_to='chat_media/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Workflow integration fields
    is_workflow = models.BooleanField(default=False)
    loan = models.ForeignKey('Loan', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    complaint = models.ForeignKey('Complaint', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    scheme_application = models.ForeignKey('SchemeApplication', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    member_profile = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')

    def __str__(self):
        return f"{self.sender.username} at {self.timestamp}: {self.message[:30]}"

# Disconnect update_last_login signal to prevent write attempts on read-only database on Vercel
from django.contrib.auth.models import update_last_login
from django.contrib.auth.signals import user_logged_in

user_logged_in.disconnect(update_last_login, dispatch_uid='update_last_login')
