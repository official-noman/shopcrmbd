from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .superadmin_views import SuperAdminShopViewSet, SuperAdminStatsView, SuperAdminProductViewSet

router = DefaultRouter()
router.register(r'shops', SuperAdminShopViewSet, basename='superadmin-shops')

urlpatterns = [
    path('stats/', SuperAdminStatsView.as_view(), name='superadmin-stats'),
    
    # Shop-specific product management
    path('shops/<int:shop_id>/products/', SuperAdminProductViewSet.as_view({
        'get': 'list', 
        'post': 'create'
    }), name='shop-products-list'),
    path('shops/<int:shop_id>/products/<int:pk>/', SuperAdminProductViewSet.as_view({
        'get': 'retrieve', 
        'put': 'update', 
        'patch': 'partial_update', 
        'delete': 'destroy'
    }), name='shop-products-detail'),

    path('', include(router.urls)),
]
