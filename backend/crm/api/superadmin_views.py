from rest_framework import viewsets, views, response, permissions, status
from django.db.models import Count
from django.shortcuts import get_object_or_404
from crm.models import Shop, User, Customer, Product
from .superadmin_serializers import SuperAdminShopSerializer
from .serializers import ProductSerializer

class SuperAdminStatsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        shops_by_type = Shop.objects.values('type').annotate(count=Count('id')).order_by('-count')
        
        stats = {
            "total_shops": Shop.objects.count(),
            "total_users": User.objects.count(),
            "total_customers": Customer.objects.count(),
            "shops_by_type": list(shops_by_type),
        }
        return response.Response(stats)

class SuperAdminShopViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Shop.objects.all().order_by('-id')
    serializer_class = SuperAdminShopSerializer
    permission_classes = [permissions.IsAdminUser]

class SuperAdminProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        shop_id = self.kwargs.get('shop_id')
        return Product.objects.filter(shop_id=shop_id).order_by('-id')

    def perform_create(self, serializer):
        shop_id = self.kwargs.get('shop_id')
        shop = get_object_or_404(Shop, id=shop_id)
        serializer.save(shop=shop)
