from rest_framework import viewsets, views, response, permissions
from django.db.models import Count
from crm.models import Shop, User, Customer
from .superadmin_serializers import SuperAdminShopSerializer

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
