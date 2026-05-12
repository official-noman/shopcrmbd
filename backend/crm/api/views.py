import re
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.db.models import Sum, Value, F
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from crm.models import Customer, Payment, Sale, Shop, Product, SaleItem
from .serializers import (
    CustomerSerializer,
    PaymentSerializer,
    SaleSerializer,
    ProductSerializer,
    SaleItemSerializer,
    UserSerializer,
    ShopSerializer,
    customer_due_annotation,
)

User = get_user_model()

BD_PHONE_RE = re.compile(r"^01[3-9]\d{8}$")


def normalize_bd_phone(raw: str) -> str:
    """
    Accepts common BD formats and returns 11-digit local format:
    - 01XXXXXXXXX
    Strips spaces/dashes and leading +88 / 88.
    """
    s = (raw or "").strip()
    s = re.sub(r"[^\d+]", "", s)
    if s.startswith("+88"):
        s = s[3:]
    if s.startswith("88") and len(s) == 13:
        s = s[2:]
    return s


def split_owner_name(name: str) -> tuple[str, str]:
    n = " ".join((name or "").strip().split())
    if not n:
        return "", ""
    parts = n.split(" ", 1)
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]


def _get_user_shop(user):
    # Superadmins can see all shops (shop may be null).
    if getattr(user, "is_superuser", False):
        return None
    return getattr(user, "shop", None)


class ShopScopedQuerysetMixin:
    """
    Enforces multi-tenant access:
    - non-superusers must have a shop and only see rows from that shop
    - superusers see all rows (unscoped)
    """

    shop_field_name = "shop"

    def get_shop(self):
        return _get_user_shop(self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        shop = self.get_shop()
        if shop is None:
            # superuser: unscoped; non-superuser without shop: blocked
            if not self.request.user.is_superuser:
                return qs.none()
            return qs
        return qs.filter(**{self.shop_field_name: shop})

    def perform_create(self, serializer):
        shop = self.get_shop()
        if shop is None and not self.request.user.is_superuser:
            raise PermissionDenied("User has no shop assigned.")
        serializer.save(**({self.shop_field_name: shop} if shop else {}))


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = (request.data.get("phone") or "").strip()
        password = request.data.get("password") or ""

        if not phone or not password:
            return Response(
                {"detail": "Phone and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        authed = authenticate(
            request=request, username=user.username, password=password
        )
        if authed is None:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(authed)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": authed.id,
                    "username": authed.username,
                    "phone": getattr(authed, "phone", ""),
                    "role": getattr(authed, "role", ""),
                    "is_staff": authed.is_staff,
                    "is_superuser": authed.is_superuser,
                    "shop_id": getattr(authed.shop, "id", None) if authed.shop else None,
                },
            }
        )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        shop_name = (request.data.get("shop_name") or "").strip()
        shop_type = (request.data.get("shop_type") or "").strip()
        owner_name = (request.data.get("owner_name") or "").strip()
        phone_raw = request.data.get("phone") or ""
        password = request.data.get("password") or ""

        if not shop_name:
            raise ValidationError({"shop_name": "Shop name is required."})
        if not shop_type:
            raise ValidationError({"shop_type": "Shop type is required."})
        if not owner_name:
            raise ValidationError({"owner_name": "Owner name is required."})
        if not phone_raw:
            raise ValidationError({"phone": "Phone is required."})
        if not password:
            raise ValidationError({"password": "Password is required."})

        phone = normalize_bd_phone(phone_raw)
        if not BD_PHONE_RE.match(phone):
            raise ValidationError(
                {"phone": "Enter a valid BD phone number (01XXXXXXXXX)."}
            )

        if User.objects.filter(phone=phone).exists():
            raise ValidationError({"phone": "An account already exists with this phone."})

        validate_password(password)

        shop = Shop.objects.create(name=shop_name, type=shop_type)
        first_name, last_name = split_owner_name(owner_name)

        user = User.objects.create_user(
            username=phone,
            phone=phone,
            password=password,
            shop=shop,
            role="owner",
            first_name=first_name,
            last_name=last_name,
        )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "phone": user.phone,
                    "role": getattr(user, "role", ""),
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "shop_id": user.shop_id,
                },
                "shop": {"id": shop.id, "name": shop.name, "type": shop.type},
            },
            status=status.HTTP_201_CREATED,
        )


class DashboardStatsView(APIView):
    def get(self, request):
        shop = _get_user_shop(request.user)
        if shop is None and not request.user.is_superuser:
            return Response(
                {"detail": "User has no shop assigned."},
                status=status.HTTP_403_FORBIDDEN,
            )

        customers = Customer.objects.all()
        sales = Sale.objects.all()
        payments = Payment.objects.all()
        if shop is not None:
            customers = customers.filter(shop=shop)
            sales = sales.filter(shop=shop)
            payments = payments.filter(shop=shop)

        total_customers = customers.count()

        today = timezone.localdate()
        sales_today = (
            sales.filter(sale_date=today).aggregate(
                s=Coalesce(Sum("total_amount"), Value(Decimal("0.00")))
            )["s"]
            or Decimal("0.00")
        )

        total_due = (
            customers.annotate(total_due=customer_due_annotation()).aggregate(
                s=Coalesce(Sum("total_due"), Value(Decimal("0.00")))
            )["s"]
            or Decimal("0.00")
        )

        # Calculate profit for today and monthly
        thirty_days_ago = today - timedelta(days=30)
        
        def calculate_profit(sale_qs):
            # Profit = sum((sale_item.unit_price - sale_item.unit_buy_price) * sale_item.quantity)
            return SaleItem.objects.filter(sale__in=sale_qs).aggregate(
                p=Coalesce(Sum((F('unit_price') - F('unit_buy_price')) * F('quantity')), Value(Decimal("0.00")))
            )["p"] or Decimal("0.00")

        profit_today = calculate_profit(sales.filter(sale_date=today))
        profit_monthly = calculate_profit(sales.filter(sale_date__gte=thirty_days_ago))

        # Monthly chart data (last 7 days)
        chart_data = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            day_sales = sales.filter(sale_date=d)
            chart_data.append({
                "date": d.strftime("%b %d"),
                "revenue": float(day_sales.aggregate(s=Coalesce(Sum("total_amount"), Value(Decimal("0.00"))))["s"]),
                "profit": float(calculate_profit(day_sales))
            })

        return Response(
            {
                "total_customers": total_customers,
                "sales_today": float(sales_today),
                "total_due": float(total_due),
                "profit_today": float(profit_today),
                "profit_monthly": float(profit_monthly),
                "chart_data": chart_data,
            }
        )


class ProductViewSet(ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.all().order_by("-id")


class CustomerViewSet(ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all().select_related("shop")

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.annotate(total_due=customer_due_annotation()).order_by("-id")


class SaleViewSet(ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    queryset = Sale.objects.all().select_related("shop", "customer").prefetch_related("items__product")

    @transaction.atomic
    def perform_create(self, serializer):
        user_shop = self.get_shop()
        items_data = self.request.data.get("items", [])
        
        # Identify shop and calculate total (needed for due calculation)
        calculated_total = Decimal("0.00")
        derived_shop = user_shop
        
        for item in items_data:
            try:
                if user_shop:
                    product = Product.objects.get(id=item["product"], shop=user_shop)
                else:
                    product = Product.objects.get(id=item["product"])
                    if derived_shop is None:
                        derived_shop = product.shop
                
                qty = int(item["quantity"])
                calculated_total += product.sale_price * qty
            except (Product.DoesNotExist, KeyError, ValueError):
                continue
        
        if derived_shop is None and not self.request.user.is_superuser:
            raise PermissionDenied("User has no shop assigned.")

        # Use total_amount from validated_data if present, otherwise use calculated
        total = serializer.validated_data.get("total_amount")
        if total is None:
            total = calculated_total
        
        # Handle "paid_amount na boshaile faka rakhle full paid"
        paid = serializer.validated_data.get("paid_amount")
        if paid is None:
            paid = total
        
        due = total - paid
        if due < 0:
            due = Decimal("0.00")

        # Calling save() will trigger the serializer's create() method
        serializer.save(
            shop=derived_shop, 
            total_amount=total, 
            paid_amount=paid, 
            due_amount=due
        )


class PaymentViewSet(ShopScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all().select_related("shop", "customer")

    @transaction.atomic
    def perform_create(self, serializer):
        shop = self.get_shop()
        if shop is None and not self.request.user.is_superuser:
            raise PermissionDenied("User has no shop assigned.")

        customer = serializer.validated_data["customer"]
        if shop is not None and customer.shop_id != shop.id:
            raise ValidationError({"customer": "Customer does not belong to your shop."})

        serializer.save(shop=shop)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ShopUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shop = _get_user_shop(request.user)
        if not shop:
            return Response({"detail": "No shop found."}, status=404)
        serializer = ShopSerializer(shop)
        return Response(serializer.data)

    def patch(self, request):
        shop = _get_user_shop(request.user)
        if not shop:
            return Response({"detail": "No shop found."}, status=404)
        
        # Only owners can update shop info
        if getattr(request.user, "role", "") != "owner" and not request.user.is_superuser:
            raise PermissionDenied("Only shop owners can update shop information.")

        serializer = ShopSerializer(shop, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class BenefitReportView(APIView):
    def get(self, request):
        shop = _get_user_shop(request.user)
        if shop is None and not request.user.is_superuser:
            return Response(
                {"detail": "User has no shop assigned."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product_id = request.query_params.get("product_id")
        selected_date_str = request.query_params.get("date")

        # 1. Product specific history (All dates)
        if product_id:
            try:
                product = Product.objects.get(id=product_id)
                if shop and product.shop != shop:
                    return Response(
                        {"detail": "Product not found in your shop."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                items = SaleItem.objects.filter(product=product).select_related("sale", "sale__customer")
                if shop:
                    items = items.filter(sale__shop=shop)

                report = items.annotate(
                    date=F("sale__sale_date"),
                    customer_name=F("sale__customer__name"),
                    time=F("sale__created_at")
                ).values(
                    "id", "date", "time", "quantity", "unit_price", "unit_buy_price", "customer_name"
                ).order_by("-time")

                return Response({
                    "product_name": product.name,
                    "sales": list(report)
                })
            except (Product.DoesNotExist, ValueError):
                return Response(
                    {"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND
                )

        # 2. Specific Date Report (Detailed)
        if selected_date_str:
            try:
                selected_date = timezone.datetime.strptime(selected_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=400)
            
            items_qs = SaleItem.objects.filter(sale__sale_date=selected_date).select_related("product", "sale", "sale__customer")
            if shop:
                items_qs = items_qs.filter(sale__shop=shop)
            
            details = items_qs.annotate(
                product_name=F("product__name"),
                customer_name=F("sale__customer__name"),
                time=F("sale__created_at")
            ).values(
                "id", "product_name", "quantity", "unit_price", "unit_buy_price", "customer_name", "time"
            ).order_by("-time")

            summary = items_qs.aggregate(
                total_sales=Coalesce(Sum(F("quantity") * F("unit_price")), Value(Decimal("0.00"))),
                total_benefit=Coalesce(Sum((F("unit_price") - F("unit_buy_price")) * F("quantity")), Value(Decimal("0.00")))
            )

            return Response({
                "date": selected_date_str,
                "details": list(details),
                "summary": summary
            })

        # 3. Default: Date wise high-level report
        sales_qs = Sale.objects.all()
        if shop:
            sales_qs = sales_qs.filter(shop=shop)

        date_wise_sales = (
            sales_qs.values(date=F("sale_date"))
            .annotate(total_sales=Sum("total_amount"))
            .order_by("-date")
        )

        items_qs = SaleItem.objects.all()
        if shop:
            items_qs = items_qs.filter(sale__shop=shop)

        date_wise_benefit = (
            items_qs.values(date=F("sale__sale_date"))
            .annotate(
                total_benefit=Sum(
                    (F("unit_price") - F("unit_buy_price")) * F("quantity")
                )
            )
            .order_by("-date")
        )

        return Response(
            {
                "date_wise_sales": list(date_wise_sales),
                "date_wise_benefit": list(date_wise_benefit),
            }
        )
