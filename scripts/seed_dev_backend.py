"""Seed a LOCAL Markt backend with staff accounts and sample data for the
admin console. Never run this against a shared or production database.

Run from the markt_python checkout with its virtualenv:

    cd ../markt_python
    .venv/bin/python ../markt-admin/scripts/seed_dev_backend.py

Idempotent: accounts are keyed by email and skipped if they already exist.
"""

import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.getcwd())

from main.setup import create_flask_app  # noqa: E402

STAFF_PASSWORD = "MarktAdmin!2026"
CUSTOMER_PASSWORD = "MarktCustomer!2026"

# One account per role, plus a legacy is_admin account.
STAFF = [
    ("super@markt.test", "super_admin", None),
    ("legacy-admin@markt.test", None, "is_admin"),
    ("support@markt.test", "support", None),
    ("moderation@markt.test", "moderation", None),
    ("finance@markt.test", "finance", None),
    ("catalog@markt.test", "catalog", None),
    ("logistics@markt.test", "logistics", None),
]

FIRST = [
    "Ada", "Tunde", "Chioma", "Emeka", "Ngozi", "Bola", "Ifeoma", "Segun",
    "Amaka", "Kunle", "Zainab", "Femi", "Halima", "Uche", "Yemi", "Kemi",
    "Musa", "Nkechi", "Dapo", "Funke", "Obinna", "Sade", "Ibrahim", "Tolu",
]

SHOPS = [
    # name, verification, market, active, featured, rating, raters
    ("Mama Put Spices", "pending", "unverified", True, False, 0, 0),
    ("Lekki Gadgets Hub", "pending", "verified", True, False, 41, 10),
    ("Aso Oke Atelier", "pending", "flagged", True, False, 18, 4),
    ("Balogun Fabrics", "verified", "verified", True, True, 230, 50),
    ("Ikeja Phone Clinic", "verified", "flagged", True, False, 96, 22),
    ("Yaba Thrift Corner", "verified", "unverified", False, False, 12, 3),
    ("Surulere Shoe Palace", "rejected", "unverified", True, False, 0, 0),
    ("Oshodi Electronics", "unverified", "unverified", True, False, 0, 0),
    ("Ajah Fresh Farms", "verified", "verified", True, True, 188, 40),
    ("Computer Village Deals", "pending", "unverified", True, False, 5, 2),
    ("Festac Beauty Bar", "suspended", "verified", False, False, 64, 15),
    ("Victoria Island Books", "verified", "verified", True, False, 77, 17),
]


def main():
    app = create_flask_app()
    with app.app_context():
        from external.database import db
        from app.markets.models import Market
        from app.users.models import (
            Buyer,
            MarketVerificationStatus,
            Seller,
            SellerVerificationStatus,
            User,
        )

        def make_user(email, username, password, **fields):
            existing = User.query.filter_by(email=email).first()
            if existing:
                return existing, False
            user = User(email=email, username=username, **fields)
            user.set_password(password)
            db.session.add(user)
            db.session.flush()
            return user, True

        created = 0

        for email, role, flag in STAFF:
            username = email.split("@")[0].replace("-", "_")
            _, new = make_user(
                email,
                username,
                STAFF_PASSWORD,
                email_verified=True,
                is_active=True,
                admin_role=role,
                is_admin=(flag == "is_admin"),
                last_login_at=datetime.utcnow() - timedelta(days=1),
            )
            created += new

        markets = []
        for name, slug, lat, lng in [
            ("Balogun Market", "balogun-market", 6.4549, 3.3887),
            ("Computer Village", "computer-village", 6.5964, 3.3424),
        ]:
            market = Market.query.filter_by(slug=slug).first()
            if not market:
                market = Market(name=name, slug=slug, latitude=lat, longitude=lng)
                db.session.add(market)
                db.session.flush()
            markets.append(market)

        now = datetime.utcnow()
        for i, first in enumerate(FIRST):
            email = f"{first.lower()}{i}@example.test"
            fields = dict(
                email_verified=(i % 5 != 0),
                is_active=True,
                is_buyer=True,
                phone_number=f"+23480{i:08d}",
                profile_picture=None,
                last_login_at=(now - timedelta(hours=i * 7)) if i % 4 else None,
            )
            if i == 3:
                fields.update(suspended_at=now - timedelta(days=2),
                              suspension_reason="Chargeback under review")
            if i == 6:
                fields.update(banned_at=now - timedelta(days=9),
                              ban_reason="Sold counterfeit goods")
            if i == 9:
                fields.update(is_active=False, deactivated_at=now - timedelta(days=20))
            if i == 12:
                fields.update(deleted_at=now - timedelta(days=30), password_hash=None)
            user, new = make_user(email, f"{first.lower()}_{i}", CUSTOMER_PASSWORD,
                                  **fields)
            if not new:
                continue
            created += 1
            user.created_at = now - timedelta(days=200 - i * 7)
            db.session.add(Buyer(user_id=user.id, buyername=first, is_active=True))

            if i < len(SHOPS):
                name, ver, mkt, active, featured, rating, raters = SHOPS[i]
                user.is_seller = True
                market = markets[i % 2]
                seller = Seller(
                    user_id=user.id,
                    shop_name=name,
                    shop_slug=name.lower().replace(" ", "-"),
                    description=f"{name} sells across Lagos.",
                    verification_status=SellerVerificationStatus(ver),
                    market_verification_status=MarketVerificationStatus(mkt),
                    verification_note=(
                        "Documents did not match the registered business name"
                        if ver == "rejected" else None
                    ),
                    is_active=active,
                    is_featured=featured,
                    total_rating=rating,
                    total_raters=raters,
                    policies={"returns": "7 days", "shipping": "Lagos only"},
                    payout_bank_code="058" if i % 3 else None,
                    payout_account_number=f"01234{i:05d}" if i % 3 else None,
                    payout_account_name=f"{name} Ltd" if i % 3 else None,
                    market_id=market.id,
                    shop_address={
                        "formatted": f"Shop {10 + i}, {market.name}",
                        "city": "Lagos",
                        "state": "Lagos",
                    },
                    shop_latitude=market.latitude + 0.001 * i,
                    shop_longitude=market.longitude - 0.001 * i,
                )
                db.session.add(seller)

        db.session.commit()
        print(f"Seeded {created} new account(s).")
        print(f"Staff password: {STAFF_PASSWORD}")
        for email, role, flag in STAFF:
            print(f"  {email:28} {role or flag}")


if __name__ == "__main__":
    main()
