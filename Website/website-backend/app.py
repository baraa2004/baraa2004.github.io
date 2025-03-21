from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost/meme_website_db'  # Replace with your PostgreSQL credentials
app.config['SECRET_KEY'] = 'your_secret_key'
db = SQLAlchemy(app)

# Import routes after initializing the app
from app import routes

if __name__ == '__main__':
    app.run(debug=True)
