from flask import Blueprint, render_template, request, redirect, url_for, flash

# Create a Blueprint for the routes
main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('loginpage.html')

@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Here you would add logic to verify the username and password
        # For now, we'll just redirect to the explore page
        flash('Login successful!', 'success')
        return redirect(url_for('main.explore'))
    return render_template('loginpage.html')

@main.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Here you would add logic to create a new user
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('main.home'))
    return render_template('registerpage.html')

@main.route('/explore')
def explore():
    return render_template('explore.html')