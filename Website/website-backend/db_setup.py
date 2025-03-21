from app import db
from models import User, Meme, Like 

# Create all tables
db.create_all()

print("Database tables created successfully!")