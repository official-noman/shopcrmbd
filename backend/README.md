## ShopCRM BD (Backend)

### Setup (local dev)

Create a virtual environment and install dependencies:

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

Admin panel:

- `http://127.0.0.1:8000/admin/`

### Notes

- This repo is structured for a `/backend` + `/frontend` split. Step 1 includes models + project wiring.
- DRF / SimpleJWT / CORS are configured in `config/settings.py` and will activate once installed.

### API (Step 2)

Base prefix: `/api/v1/`

- `POST auth/login/` → JWT login (phone + password)
- `GET dashboard/stats/` → `{ total_customers, sales_today, total_due }`
- `customers/` → CRUD (each customer includes `total_due`)
- `sales/` → create sale (server calculates `due_amount = total_amount - paid_amount`)
- `payments/` → receive payment (due is reflected via aggregation)
