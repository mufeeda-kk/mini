from django.urls import path
from . import views

urlpatterns = [
    # Public & Authentication
    path('', views.landing_view, name='landing'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('role-selection/', views.role_selection_view, name='role_selection'),
    path('forgot-password/', views.forgot_password_view, name='forgot_password'),
    path('reset-password/', views.reset_password_view, name='reset_password'),
    path('otp-verification/', views.otp_verification_view, name='otp_verification'),
    path('email-verification/', views.email_verification_view, name='email_verification'),

    # Dashboards
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/president/', views.president_dashboard, name='president_dashboard'),
    path('dashboard/member/', views.member_dashboard, name='member_dashboard'),
    path('dashboard/approvals/', views.approval_dashboard, name='approval_dashboard'),

    # Module Operations
    path('attendance/', views.attendance_view, name='attendance'),
    path('loans/', views.loans_view, name='loans'),
    path('chitty/', views.chitty_view, name='chitty'),
    path('meetings-events/', views.meetings_events_view, name='meetings_events'),
    path('micro-enterprise/', views.micro_enterprise_view, name='micro_enterprise'),
    path('finance/', views.finance_view, name='finance'),
    path('complaints/', views.complaints_view, name='complaints'),
    path('schemes/', views.schemes_view, name='schemes'),
    path('documents/', views.documents_view, name='documents'),
    path('chat/', views.group_chat_view, name='group_chat'),
    path('analytics/', views.analytics_view, name='analytics'),

    # Form Submission Actions
    path('dashboard/verify/<int:profile_id>/<str:action>/', views.verify_member_action, name='verify_member_action'),
    path('loans/action/<int:loan_id>/<str:action>/', views.loan_action, name='loan_action'),
    path('loans/apply/', views.loan_apply, name='loan_apply'),
    path('chitty/pay/<int:payment_id>/', views.chitty_pay, name='chitty_pay'),
    path('attendance/mark/', views.attendance_mark_manual, name='attendance_mark_manual'),
    path('complaints/submit/', views.complaint_submit, name='complaint_submit'),
    path('complaints/reply/<int:complaint_id>/', views.complaint_reply, name='complaint_reply'),
    path('schemes/apply/<int:scheme_id>/', views.scheme_apply, name='scheme_apply'),
    path('documents/upload/', views.document_upload, name='document_upload'),
    path('chat/send/', views.chat_send, name='chat_send'),
]