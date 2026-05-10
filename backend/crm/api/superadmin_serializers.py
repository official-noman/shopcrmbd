from rest_framework import serializers
from django.db.models import Sum
from crm.models import Shop, User, Customer, Sale

class SuperAdminShopSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_phone = serializers.SerializerMethodField()
    user_count = serializers.IntegerField(source='users.count', read_only=True)
    customer_count = serializers.IntegerField(source='customers.count', read_only=True)
    total_sales_count = serializers.IntegerField(source='sales.count', read_only=True)
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'address', 'phone', 'type', 
            'owner_name', 'owner_phone', 'user_count', 
            'customer_count', 'total_sales_count', 'total_revenue'
        ]

    def get_owner_name(self, obj):
        owner = obj.users.filter(role=User.Role.OWNER).first()
        return owner.get_full_name() or owner.username if owner else "N/A"

    def get_owner_phone(self, obj):
        owner = obj.users.filter(role=User.Role.OWNER).first()
        return owner.phone if owner else "N/A"

    def get_total_revenue(self, obj):
        total = obj.sales.aggregate(total=Sum('total_amount'))['total']
        return str(total) if total else "0.00"
