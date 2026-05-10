from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils import timezone


class CRMUserManager(UserManager):
    def create_user(self, username, password=None, **extra_fields):
        phone = extra_fields.get("phone")
        if not phone:
            raise ValueError("The phone field is required.")
        return super().create_user(username=username, password=password, **extra_fields)

    def create_superuser(self, username, password=None, **extra_fields):
        phone = extra_fields.get("phone")
        if not phone:
            raise ValueError("The phone field is required.")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return super().create_superuser(
            username=username, password=password, **extra_fields
        )


class Shop(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    type = models.CharField(max_length=100, blank=True, default="")

    def __str__(self) -> str:
        return self.name


class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        STAFF = "staff", "Staff"

    shop = models.ForeignKey(
        Shop,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    phone = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.OWNER)

    objects = CRMUserManager()

    REQUIRED_FIELDS = ["phone"]

    def __str__(self) -> str:
        return f"{self.get_full_name() or self.username} ({self.phone})"


class Customer(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="customers")
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, default="")
    address = models.TextField(blank=True, default="")
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    buy_price = models.DecimalField(max_digits=12, decimal_places=2)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.shop.name})"


class Sale(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="sales")
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    due_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sale_date = models.DateField(default=timezone.localdate)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Sale #{self.pk} - {self.total_amount}"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sale_items")
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    unit_buy_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self) -> str:
        return f"{self.product.name} x {self.quantity}"


class Payment(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="payments")
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="payments"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(default=timezone.localdate)
    note = models.TextField(blank=True, default="")

    def __str__(self) -> str:
        return f"Payment #{self.pk} - {self.amount}"
