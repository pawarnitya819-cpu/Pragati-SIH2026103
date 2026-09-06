import os
from sqlalchemy import create_engine

DATABASE_URL = os.environ.get("DATABASE_URL")
USE_DATABASE = bool(DATABASE_URL)

engine = None
if USE_DATABASE:
    url = DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    engine = create_engine(url, pool_pre_ping=True)