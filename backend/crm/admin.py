from django.contrib import admin

from .models import Customer, Payment, Sale, Shop, User


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "type")
    search_fields = ("name", "phone")


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "phone", "role", "shop", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "phone", "email")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "shop", "credit_limit")
    search_fields = ("name", "phone")
    list_filter = ("shop",)


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "shop",
        "customer",
        "total_amount",
        "paid_amount",
        "due_amount",
        "sale_date",
    )
    list_filter = ("shop", "sale_date")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "shop", "customer", "amount", "payment_date")
    list_filter = ("shop", "payment_date")
