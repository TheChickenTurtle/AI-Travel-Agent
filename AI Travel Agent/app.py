from flask import Flask, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from datetime import datetime, timedelta
import os
from functools import wraps
import secrets
import string

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for flash messages

def get_db_connection():
    conn = sqlite3.connect('static/database.db')
    conn.row_factory = sqlite3.Row
    return conn
    

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Get current user data
def get_current_user():
    if 'user_id' not in session:
        return None
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE user_id = ?', (session['user_id'],)).fetchone()
    conn.close()
    return user

@app.route('/')
def index():
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
@login_required
def dashboard():
    current_user = get_current_user()
    
    # Get recent trips for the user
    conn = get_db_connection()
    recent_trips = conn.execute('''
        SELECT * FROM trips 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
    ''', (current_user['user_id'],)).fetchall()
    conn.close()
    
    return render_template('dashboard.html',
                         current_user=current_user,
                         recent_trips=recent_trips,
                         current_year=datetime.now().year)

@app.route('/my-trips')
@login_required
def my_trips():
    current_user = get_current_user()
    conn = get_db_connection()
    trips = conn.execute('''
        SELECT * FROM trips 
        WHERE user_id = ? 
        ORDER BY start_date DESC
    ''', (current_user['user_id'],)).fetchall()
    conn.close()
    
    return render_template('my_trips.html', 
                         current_user=current_user,
                         trips=trips)

@app.route('/new-trip', methods=['GET', 'POST'])
@login_required
def new_trip():
    if request.method == 'POST':
        # Handle trip creation
        destination = request.form.get('destination')
        start_date = request.form.get('start_date')
        end_date = request.form.get('end_date')
        budget = request.form.get('budget')
        
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO trips (user_id, destination, start_date, end_date, budget, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (session['user_id'], destination, start_date, end_date, budget, datetime.now()))
        conn.commit()
        conn.close()
        
        flash('Trip created successfully!', 'success')
        return redirect(url_for('my_trips'))
    
    return render_template('new_trip.html', current_user=get_current_user())

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    current_user = get_current_user()
    
    if request.method == 'POST':
        # Handle profile updates
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        phone = request.form.get('phone')
        timezone = request.form.get('timezone')
        preferred_currency = request.form.get('preferred_currency')
        
        conn = get_db_connection()
        conn.execute('''
            UPDATE users 
            SET first_name = ?, last_name = ?, phone = ?, 
                timezone = ?, preferred_currency = ?, updated_at = ?
            WHERE user_id = ?
        ''', (first_name, last_name, phone, timezone, preferred_currency, 
              datetime.now(), current_user['user_id']))
        conn.commit()
        conn.close()
        
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('profile'))
    
    return render_template('profile.html', current_user=current_user)

@app.route('/explore-destinations')
@login_required
def explore_destinations():
    # This would typically fetch from an API or database
    destinations = [
        {'name': 'Paris', 'country': 'France', 'image': 'paris.jpg'},
        {'name': 'Tokyo', 'country': 'Japan', 'image': 'tokyo.jpg'},
        {'name': 'New York', 'country': 'USA', 'image': 'newyork.jpg'},
        # Add more destinations
    ]
    return render_template('explore_destinations.html', 
                         current_user=get_current_user(),
                         destinations=destinations)

@app.route('/travel-tips')
@login_required
def travel_tips():
    # This would typically fetch from a database or CMS
    tips = [
        {'title': 'Packing Essentials', 'content': '...'},
        {'title': 'Budget Travel Tips', 'content': '...'},
        {'title': 'Safety While Traveling', 'content': '...'},
    ]
    return render_template('travel_tips.html', 
                         current_user=get_current_user(),
                         tips=tips)

@app.route('/weather')
@login_required
def weather():
    # This would typically integrate with a weather API
    return render_template('weather.html', 
                         current_user=get_current_user())

@app.route('/currency-converter')
@login_required
def currency_converter():
    # This would typically integrate with a currency API
    currencies = [
        {'code': 'USD', 'name': 'US Dollar'},
        {'code': 'EUR', 'name': 'Euro'},
        {'code': 'GBP', 'name': 'British Pound'},
        # Add more currencies
    ]
    return render_template('currency_converter.html', 
                         current_user=get_current_user(),
                         currencies=currencies)

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('login'))

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Get form data
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        budget_range = request.form.get('budget_range')
        travel_styles = request.form.getlist('travel_style')
        terms_accepted = request.form.get('terms')

        # Validation
        errors = []
        
        # Check if passwords match
        if password != confirm_password:
            errors.append("Passwords do not match")
        
        # Check password length
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        # Check if terms are accepted
        if not terms_accepted:
            errors.append("You must accept the terms and conditions")
        
        # Check if email already exists
        conn = get_db_connection()
        existing_user = conn.execute('SELECT email FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()
        
        if existing_user:
            errors.append("Email already registered")

        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('register.html')

        try:
            # Generate password hash
            password_hash = generate_password_hash(password)
            
            # Get current timestamp
            current_time = datetime.utcnow()
            
            # Insert user into database
            conn = get_db_connection()
            conn.execute('''
                INSERT INTO users (
                    email, password_hash, first_name, last_name,
                    terms_accepted, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                email, password_hash, first_name, last_name,
                current_time, current_time, current_time
            ))
            conn.commit()
            conn.close()

            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))

        except sqlite3.Error as e:
            flash('An error occurred during registration. Please try again.', 'error')
            return render_template('register.html')

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = request.form.get('remember')
        

        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        session['user_id'] = user['user_id']
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            # Update last login time
            conn = get_db_connection()
            conn.execute('UPDATE users SET last_login = ? WHERE user_id = ?',
                        (datetime.utcnow(), user['user_id']))
            conn.commit()
            conn.close()

            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password', 'error')

    return render_template('login.html')

def generate_reset_token():
    """Generate a secure random token for password reset"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        
        # Check if email exists in database
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        
        if user:
            # Generate reset token
            reset_token = generate_reset_token()
            token_expiry = datetime.now() + timedelta(hours=1)
            
            # Store reset token in database
            conn.execute('''
                UPDATE users 
                SET reset_token = ?, reset_token_expiry = ?
                WHERE user_id = ?
            ''', (reset_token, token_expiry, user['user_id']))
            conn.commit()
            
            # In a real application, you would send an email here
            # For development, we'll just show the token
            flash(f'Password reset token: {reset_token}', 'info')
            
        else:
            # Don't reveal if email exists or not
            flash('If your email is registered, you will receive a password reset link.', 'info')
        
        conn.close()
        return redirect(url_for('login'))
    
    return render_template('forgot_password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    conn = get_db_connection()
    user = conn.execute('''
        SELECT * FROM users 
        WHERE reset_token = ? AND reset_token_expiry > ?
    ''', (token, datetime.now())).fetchone()
    
    if not user:
        flash('Invalid or expired reset token.', 'error')
        return redirect(url_for('forgot_password'))
    
    if request.method == 'POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('reset_password.html', token=token)
        
        if len(password) < 8:
            flash('Password must be at least 8 characters long.', 'error')
            return render_template('reset_password.html', token=token)
        
        # Update password and clear reset token
        password_hash = generate_password_hash(password)
        conn.execute('''
            UPDATE users 
            SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL
            WHERE user_id = ?
        ''', (password_hash, user['user_id']))
        conn.commit()
        
        flash('Your password has been reset successfully.', 'success')
        return redirect(url_for('login'))
    
    conn.close()
    return render_template('reset_password.html', token=token)

# Basic page routes
@app.route('/about')
def about():
    return render_template('about.html', current_user=get_current_user())

@app.route('/contact')
def contact():
    return render_template('contact.html', current_user=get_current_user())

@app.route('/privacy')
def privacy():
    return render_template('privacy.html', current_user=get_current_user())

@app.route('/terms')
def terms():
    return render_template('terms.html', current_user=get_current_user())

if __name__ == '__main__':
    # Create database if it doesn't exist
    if not os.path.exists('static/database.db'):
        raise Exception("Database file not found. Please run the setup.py script to create the database.")
    app.run(debug=True)
