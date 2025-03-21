from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

    @classmethod
    def create_user(cls, username, password):
        new_user = cls(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @classmethod
    def get_user_by_username(cls, username):
        return cls.query.filter_by(username=username).first()