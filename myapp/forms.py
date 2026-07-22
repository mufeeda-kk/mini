from django import forms
from django.contrib.auth.models import User
from .models import UserProfile, Loan, Complaint, Meeting, Transaction, InventoryItem, KudumbashreeGroup

# 1. Login Form
class LoginForm(forms.Form):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Enter your username'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Enter your password'})
    )

# 2. Registration Form
class RegisterForm(forms.ModelForm):
    username = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Choose username'})
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Enter email address'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Choose password'})
    )
    phone = forms.CharField(
        max_length=15,
        widget=forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Enter mobile number'})
    )
    role = forms.ChoiceField(
        choices=[('president', 'President'), ('secretary', 'Secretary'), ('member', 'Kudumbashree Member')],
        widget=forms.Select(attrs={'class': 'form-select rounded-3'})
    )
    group = forms.ModelChoiceField(
        queryset=KudumbashreeGroup.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-select rounded-3'}),
        help_text="Select your local Kudumbashree unit (Ayalkootam)"
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
            # Create corresponding user profile with pending status
            UserProfile.objects.create(
                user=user,
                role=self.cleaned_data['role'],
                phone=self.cleaned_data['phone'],
                group=self.cleaned_data['group'],
                status='pending'  # Multi-tier registration starts as pending!
            )
        return user

# 3. Loan Application Form
class LoanApplicationForm(forms.ModelForm):
    class Meta:
        model = Loan
        fields = ['amount', 'purpose', 'interest_rate', 'duration_months']
        widgets = {
            'amount': forms.NumberInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Enter loan amount in ₹'}),
            'purpose': forms.Textarea(attrs={'class': 'form-control rounded-3', 'rows': 3, 'placeholder': 'Specify the purpose of this loan'}),
            'interest_rate': forms.NumberInput(attrs={'class': 'form-control rounded-3 bg-light', 'readonly': 'readonly'}),
            'duration_months': forms.NumberInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'e.g. 12 months'}),
        }

# 4. Complaint Submission Form
class ComplaintForm(forms.ModelForm):
    class Meta:
        model = Complaint
        fields = ['title', 'description', 'priority']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Brief title of the complaint'}),
            'description': forms.Textarea(attrs={'class': 'form-control rounded-3', 'rows': 4, 'placeholder': 'Describe your issue/grievance in detail'}),
            'priority': forms.Select(attrs={'class': 'form-select rounded-3'}),
        }

# 5. Meeting Scheduler Form
class MeetingForm(forms.ModelForm):
    class Meta:
        model = Meeting
        fields = ['title', 'agenda', 'date_time', 'venue', 'minutes_note']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Meeting Topic'}),
            'agenda': forms.Textarea(attrs={'class': 'form-control rounded-3', 'rows': 3, 'placeholder': 'Agenda items'}),
            'date_time': forms.DateTimeInput(attrs={'class': 'form-control rounded-3', 'type': 'datetime-local'}),
            'venue': forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Meeting Venue'}),
            'minutes_note': forms.Textarea(attrs={'class': 'form-control rounded-3', 'rows': 3, 'placeholder': 'Add notes or decisions taken'}),
        }

# 6. Transaction Form (Income & Expenses Ledger)
class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ['transaction_type', 'category', 'amount', 'date', 'description']
        widgets = {
            'transaction_type': forms.Select(attrs={'class': 'form-select rounded-3'}),
            'category': forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'e.g. Membership Fee, Refreshments'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Amount in ₹'}),
            'date': forms.DateInput(attrs={'class': 'form-control rounded-3', 'type': 'date'}),
            'description': forms.Textarea(attrs={'class': 'form-control rounded-3', 'rows': 2, 'placeholder': 'Details (optional)'}),
        }

# 7. Inventory/Product Creation Form
class InventoryItemForm(forms.ModelForm):
    class Meta:
        model = InventoryItem
        fields = ['name', 'category', 'price', 'stock_quantity', 'min_stock_level']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Product name'}),
            'category': forms.TextInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Category (e.g. Spices, Pickles)'}),
            'price': forms.NumberInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Price per unit'}),
            'stock_quantity': forms.NumberInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Initial stock quantity'}),
            'min_stock_level': forms.NumberInput(attrs={'class': 'form-control rounded-3', 'placeholder': 'Low stock warning threshold'}),
        }
