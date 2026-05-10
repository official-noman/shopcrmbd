from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .superadmin_views import SuperAdminShopViewSet, SuperAdminStatsView

router = DefaultRouter()
router.register(r'shops', SuperAdminShopViewSet, basename='superadmin-shops')

urlpatterns = [
    path('stats/', SuperAdminStatsView.as_view(), name='superadmin-stats'),
    path('', include(router.urls)),
]
