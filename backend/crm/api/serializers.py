from decimal import Decimal

from django.db import transaction
from django.db.models import DecimalField, ExpressionWrapper, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import serializers

from crm.models import Customer, Payment, Sale, Product, SaleItem


class CustomerSerializer(serializers.ModelSerializer):
    total_due = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "phone",
            "address",
            "credit_limit",
            "total_due",
        ]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "buy_price",
            "sale_price",
            "stock_quantity",
            "created_at",
        ]


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")

    class Meta:
        model = SaleItem
        fields = ["id", "product", "product_name", "quantity", "unit_price", "unit_buy_price"]
        read_only_fields = ["unit_buy_price"]


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source="customer.name")
    paid_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True
    )

    class Meta:
        model = Sale
        fields = [
            "id",
            "customer",
            "customer_name",
            "total_amount",
            "paid_amount",
            "due_amount",
            "sale_date",
            "created_at",
            "items",
        ]
        read_only_fields = ["due_amount", "created_at"]

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        sale = Sale.objects.create(**validated_data)

        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]

            if product.stock_quantity < quantity:
                raise serializers.ValidationError(
                    {"detail": f"Not enough stock for {product.name}"}
                )

            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=quantity,
                unit_price=product.sale_price,
                unit_buy_price=product.buy_price,
            )

            product.stock_quantity -= quantity
            product.save()

        return sale


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "customer", "amount", "payment_date", "note"]


def customer_due_annotation():
    """
    Returns an annotation expression: total_due = sum(sales.due_amount) - sum(payments.amount)
    """
    sales_due = Coalesce(Sum("sales__due_amount"), Value(Decimal("0.00")))
    payments = Coalesce(Sum("payments__amount"), Value(Decimal("0.00")))
    return ExpressionWrapper(
        sales_due - payments, output_field=DecimalField(max_digits=12, decimal_places=2)
    )
