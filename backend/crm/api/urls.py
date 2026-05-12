from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CustomerViewSet,
    DashboardStatsView,
    LoginView,
    PaymentViewSet,
    ProductViewSet,
    RegisterView,
    SaleViewSet,
    BenefitReportView,
    ProfileView,
    ShopUpdateView,
)

router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customers")
router.register(r"products", ProductViewSet, basename="products")
router.register(r"sales", SaleViewSet, basename="sales")
router.register(r"payments", PaymentViewSet, basename="payments")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("reports/benefit/", BenefitReportView.as_view(), name="benefit-report"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("shop/", ShopUpdateView.as_view(), name="shop-update"),
    path("superadmin/", include("crm.api.superadmin_urls")),
    path("", include(router.urls)),
]
