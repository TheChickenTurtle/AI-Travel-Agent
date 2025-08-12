from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import json
import uuid
import os
from cs50 import SQL

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
db = SQL("sqlite:///static/data/database.db")

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# In-memory storage (replace with database in production)
users = {}
trips = {}
messages = {}

class User(UserMixin):
    def __init__(self, id, email, first_name, last_name, password_hash, preferences=None):
        self.id = id
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.password_hash = password_hash
        self.preferences = preferences or {}

@login_manager.user_loader
def load_user(user_id):
    return users.get(user_id)

@app.route('/')
def landing():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('landing.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = request.form.get('remember')

        # Use the same db object as the rest of the code
        user = db.execute("SELECT * FROM users WHERE email = ?", email)
        
        if len(user) > 0 and check_password_hash(user[0]['password_hash'], password):
            user_data = user[0]
            # Check if user is active (default to True if field doesn't exist)
            is_active = user_data.get('is_active', True)
            
            if is_active:
                # Create User object and log in
                user_obj = User(
                    str(user_data['user_id']),  # Convert to string for consistency
                    user_data['email'], 
                    user_data['first_name'], 
                    user_data['last_name'], 
                    user_data['password_hash']
                )
                users[str(user_data['user_id'])] = user_obj
                login_user(user_obj, remember=remember)
                flash('Login successful!', 'success')
                return redirect(url_for('dashboard'))
            else:
                flash('Account is not active.', 'error')
        else:
            flash('Invalid email or password', 'error')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        try:
            # Debug: Print all form data
            print("=== REGISTRATION DEBUG ===")
            print(f"Form data received: {dict(request.form)}")
            print(f"Content-Type: {request.content_type}")
            print(f"Request method: {request.method}")
            
            # Get form data
            first_name = request.form.get('firstName')
            last_name = request.form.get('lastName')
            email = request.form.get('email')
            password = request.form.get('password')
            confirm_password = request.form.get('confirmPassword')
            accept_terms = request.form.get('acceptTerms')
            
            print(f"firstName: '{first_name}'")
            print(f"lastName: '{last_name}'")
            print(f"email: '{email}'")
            print(f"password: '{password}'")
            print(f"confirmPassword: '{confirm_password}'")
            print(f"acceptTerms: '{accept_terms}'")
            
            # Validate required fields
            if not all([first_name, last_name, email, password, confirm_password, accept_terms]):
                missing_fields = []
                if not first_name: missing_fields.append('firstName')
                if not last_name: missing_fields.append('lastName')
                if not email: missing_fields.append('email')
                if not password: missing_fields.append('password')
                if not confirm_password: missing_fields.append('confirmPassword')
                if not accept_terms: missing_fields.append('acceptTerms')
                
                print(f"Missing fields: {missing_fields}")
                flash(f'Missing required fields: {", ".join(missing_fields)}', 'error')
                return render_template('register.html'), 400
            
            # Validate password confirmation
            if password != confirm_password:
                print("Password mismatch")
                flash('Passwords do not match', 'error')
                return render_template('register.html'), 400
            
            # Validate terms acceptance
            if accept_terms != 'on':
                print("Terms not accepted")
                flash('You must accept the terms and conditions', 'error')
                return render_template('register.html'), 400
            
            print("All validations passed, proceeding with registration...")
            
            # Check if email already exists
            existing_users = db.execute("SELECT * FROM users WHERE email = ?", email)
            if len(existing_users) > 0:
                print("Email already exists")
                flash('Email already registered', 'error')
                return render_template('register.html'), 400
            
            # Create new user - let database auto-increment user_id
            password_hash = generate_password_hash(password)
            
            # Insert user into database with correct fields
            db.execute("""
                INSERT INTO users (first_name, last_name, email, password_hash, created_at, terms_accepted) 
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """, first_name, last_name, email, password_hash)

            # Get the auto-generated user_id
            user_result = db.execute("SELECT * FROM users WHERE email = ?", email)
            if len(user_result) > 0:
                user_data = user_result[0]
                user_id = str(user_data['user_id'])  # Convert to string for consistency
                
                # Create User object and store in memory
                user = User(user_id, email, first_name, last_name, password_hash, {})
                users[user_id] = user
                
                login_user(user)
                print("Registration successful!")
                flash('Registration successful! Welcome to TravelMind AI!', 'success')
                return redirect(url_for('dashboard'))
            else:
                print("Failed to retrieve user after insertion")
                flash('Registration failed. Please try again.', 'error')
                return render_template('register.html'), 400
                
        except Exception as e:
            print(f"Registration error: {e}")
            import traceback
            traceback.print_exc()
            flash(f'Registration failed: {str(e)}', 'error')
            return render_template('register.html'), 400
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('landing'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user's trips
    user_trips = []
    for trip in trips.values():
        if trip['user_id'] == current_user.id:
            user_trips.append(trip)
    
    # Calculate stats
    stats = {
        'total_trips': len(user_trips),
        'upcoming_trips': len([t for t in user_trips if t['status'] != 'completed']),
        'total_spent': sum(t.get('actual_cost', 0) for t in user_trips),
        'favorite_destination': 'Japan' if user_trips else 'Not set'
    }
    
    return render_template('dashboard.html', trips=user_trips, stats=stats)

@app.route('/chat')
@app.route('/chat/<trip_id>')
@login_required
def chat(trip_id=None):
    trip = None
    chat_messages = []
    
    if trip_id and trip_id in trips:
        trip = trips[trip_id]
        chat_messages = messages.get(trip_id, [])
    
    return render_template('chat.html', trip=trip, messages=chat_messages, trip_id=trip_id)

@app.route('/api/chat/message', methods=['POST'])
@login_required
def send_message():
    data = request.get_json()
    message_text = data.get('message', '')
    trip_id = data.get('trip_id')
    
    if not trip_id:
        trip_id = str(uuid.uuid4())
        # Create new trip
        trips[trip_id] = {
            'id': trip_id,
            'user_id': current_user.id,
            'title': 'New Trip',
            'status': 'planning',
            'created_at': datetime.now().isoformat()
        }
        messages[trip_id] = []
    
    # Add user message
    user_message = {
        'id': str(uuid.uuid4()),
        'content': message_text,
        'sender': 'user',
        'timestamp': datetime.now().isoformat()
    }
    messages[trip_id].append(user_message)
    
    # Generate AI response
    ai_response = generate_ai_response(message_text, trip_id)
    messages[trip_id].append(ai_response)
    
    return jsonify({
        'success': True,
        'trip_id': trip_id,
        'user_message': user_message,
        'ai_response': ai_response
    })

def generate_ai_response(user_message, trip_id):
    """Generate AI response based on user message"""
    message_lower = user_message.lower()
    
    if 'japan' in message_lower or 'tokyo' in message_lower:
        # Update trip with Japan details
        trips[trip_id].update({
            'title': 'Tokyo Adventure',
            'destination': 'Tokyo, Japan',
            'start_date': '2024-04-15',
            'end_date': '2024-04-20',
            'travelers': 2,
            'total_budget': 3500,
            'actual_cost': 2850
        })
        
        response_content = """Excellent choice! Japan is absolutely magical, especially during cherry blossom season. I've created a preliminary trip plan for you covering Tokyo and Kyoto. This includes traditional experiences like staying in a ryokan, visiting ancient temples, and of course, incredible food experiences!

Your trip includes:
🏯 Temple visits in Kyoto
🍣 Authentic sushi experiences  
🌸 Cherry blossom viewing
🏨 Mix of traditional and modern accommodation
🚅 Bullet train experience

Would you like me to adjust the budget, add more cities, or focus on specific activities?"""
        
    elif 'beach' in message_lower or 'tropical' in message_lower:
        response_content = """A tropical beach getaway sounds perfect! 🏖️ Based on your budget, I recommend Bali, Thailand, or the Philippines. These destinations offer beautiful beaches, rich culture, and excellent value for money.

**Bali, Indonesia** would be perfect for:
• Stunning beaches in Uluwatu and Seminyak
• Cultural experiences in Ubud  
• Delicious local cuisine
• Affordable luxury accommodations

Shall I create a detailed itinerary for Bali, or would you prefer to explore other tropical destinations?"""
        
    elif 'italy' in message_lower or 'food' in message_lower:
        response_content = """Fantastico! A culinary journey through Italy is unforgettable! 🍝 I'll design a food-focused itinerary that takes you through the country's most delicious regions.

**Your Italian Food Adventure:**
• Rome - Traditional carbonara and supplì
• Florence - Bistecca alla Fiorentina and Chianti
• Bologna - Fresh pasta and mortadella  
• Naples - Authentic pizza and sfogliatelle

We can include cooking classes, wine tastings, market tours, and visits to local trattorias that tourists rarely find. What's your budget range and how many days are you thinking?"""
        
    else:
        response_content = f"""That sounds great! I'd love to help you plan this trip. To create the perfect itinerary for you, could you tell me a bit more about:

• Your preferred travel dates
• Budget range you're comfortable with  
• What type of experiences excite you most
• How many people will be traveling

The more details you share, the better I can tailor your perfect adventure! ✈️"""
    
    return {
        'id': str(uuid.uuid4()),
        'content': response_content,
        'sender': 'ai',
        'timestamp': datetime.now().isoformat(),
        'type': 'text'
    }

@app.route('/itinerary/<trip_id>')
@login_required
def itinerary(trip_id):
    if trip_id not in trips or trips[trip_id]['user_id'] != current_user.id:
        flash('Trip not found', 'error')
        return redirect(url_for('dashboard'))
    
    trip = trips[trip_id]
    
    # Sample itinerary data
    sample_itinerary = {
        'id': trip_id,
        'title': trip.get('title', 'My Trip'),
        'destination': trip.get('destination', 'Unknown'),
        'start_date': trip.get('start_date', '2024-04-15'),
        'end_date': trip.get('end_date', '2024-04-20'),
        'travelers': trip.get('travelers', 2),
        'total_budget': trip.get('total_budget', 3500),
        'actual_cost': trip.get('actual_cost', 2850),
        'status': trip.get('status', 'planning'),
        'days': [
            {
                'date': '2024-04-15',
                'total_cost': 320,
                'activities': [
                    {
                        'id': '1',
                        'title': 'Arrival at Narita Airport',
                        'description': 'Land at Narita International Airport and take the express train to Shibuya',
                        'time': '14:30',
                        'duration': '2 hours',
                        'location': 'Narita Airport',
                        'cost': 25,
                        'category': 'transport',
                        'image_url': 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=300',
                        'rating': 0
                    },
                    {
                        'id': '2',
                        'title': 'Hotel Check-in',
                        'description': 'Check into the Park Hotel Tokyo with stunning city views',
                        'time': '16:00',
                        'duration': '30 minutes',
                        'location': 'Shibuya, Tokyo',
                        'cost': 180,
                        'category': 'accommodation',
                        'image_url': 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=300',
                        'rating': 4.5
                    }
                ]
            }
        ]
    }
    
    return render_template('itinerary.html', itinerary=sample_itinerary)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

@app.route('/api/profile/update', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json()
    
    # Update user information
    current_user.first_name = data.get('firstName', current_user.first_name)
    current_user.last_name = data.get('lastName', current_user.last_name)
    current_user.email = data.get('email', current_user.email)
    
    # Update preferences
    if 'preferences' in data:
        current_user.preferences.update(data['preferences'])
    
    return jsonify({'success': True, 'message': 'Profile updated successfully'})

if __name__ == '__main__':
    # Create a sample user for testing
    sample_user_id = str(uuid.uuid4())
    sample_user = User(
        sample_user_id,
        'demo@travelmind.ai',
        'John',
        'Doe',
        generate_password_hash('password123'),
        {
            'budget_range': '$1000-$3000',
            'travel_style': ['Adventure', 'Culture']
        }
    )
    users[sample_user_id] = sample_user
    
    app.run(debug=True)