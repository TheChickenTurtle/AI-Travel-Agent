Database Schema Design for TravelMind
AI
Schema Design Philosophy and Principles
The database schema for TravelMind AI follows a modular design approach that
balances simplicity for initial development with scalability for future growth. The design
principles emphasize data normalization to prevent redundancy while maintaining
query efficiency, flexible data structures that can accommodate evolving travel
preferences and features, clear relationships between entities that reflect real-world
travel planning workflows, and extensibility that allows new features to be added
without major schema changes.
The schema design considers the unique requirements of travel planning applications,
including the need to store complex preference data, maintain conversation history for
AI interactions, track itinerary changes over time, and support sharing and collaboration
features. The modular approach ensures that each table serves a specific purpose while
maintaining clear relationships with related data.
Performance considerations include appropriate indexing strategies for common query
patterns, efficient storage of JSON data for complex preferences, and query optimization
for typical travel planning workflows. The schema design also considers data privacy
requirements, ensuring that sensitive user information is properly protected while
maintaining the functionality needed for personalized travel recommendations.
Core User Management Tables
Users Table Structure
The users table serves as the foundation of the application's data model, storing
essential user information while maintaining security and privacy standards. The table
structure includes a primary key user_id using an auto-incrementing integer for efficient
indexing and foreign key relationships. The email field serves as a unique identifier for
user authentication and communication, with appropriate constraints to ensure data
integrity.
Password security follows industry best practices with a password_hash field that stores
securely hashed passwords using Werkzeug's security functions. The schema never
stores plain text passwords, maintaining security standards appropriate for production
applications. Additional security fields include created_at and last_login timestamps
that support security monitoring and user engagement analysis.
User profile information includes first_name and last_name fields for personalization,
with consideration for international naming conventions. An optional phone field
supports communication and verification features, while a profile_image_url field allows
users to customize their profiles. The is_active boolean field enables account
management and soft deletion capabilities.
The users table also includes metadata fields that support application functionality and
analytics. A timezone field stores user timezone preferences for accurate date and time
handling in travel planning. A preferred_currency field supports international users and
multi-currency pricing display. An email_verified boolean field supports email
verification workflows, while a terms_accepted timestamp tracks user agreement to
terms of service.
CREATE TABLE users (
user_id INTEGER PRIMARY KEY AUTOINCREMENT,
email VARCHAR(255) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
first_name VARCHAR(100),
last_name VARCHAR(100),
phone VARCHAR(20),
profile_image_url VARCHAR(500),
timezone VARCHAR(50) DEFAULT 'UTC',
preferred_currency VARCHAR(3) DEFAULT 'USD',
is_active BOOLEAN DEFAULT TRUE,
email_verified BOOLEAN DEFAULT FALSE,
terms_accepted DATETIME,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
last_login DATETIME,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
User Preferences Table Structure
The user_preferences table stores travel-related preferences collected through the AI
chat interface and user profile settings. This table uses a flexible design that can
accommodate various types of travel preferences while maintaining query efficiency and
data integrity.
The table structure includes a foreign key relationship to the users table, ensuring that
preferences are always associated with a valid user account. The preference_category
field allows grouping of related preferences, such as 'accommodation', 'activities',
'transportation', or 'dining'. This categorization supports efficient querying and
organized preference management.
Preference data is stored using a combination of structured fields for common
preferences and JSON fields for complex or evolving preference types. The
preference_key field identifies specific preferences within a category, while
preference_value stores the actual preference data. This key-value approach provides
flexibility for storing diverse preference types without requiring schema changes.
The JSON preferences field stores complex preference data that doesn't fit into simple
key-value pairs. This might include detailed activity preferences, accessibility
requirements, or complex budget breakdowns. SQLite's JSON support enables efficient
querying and manipulation of this data while maintaining schema flexibility.
Temporal aspects of preferences are handled through created_at and updated_at
timestamps, allowing the application to track preference changes over time. The
is_active field enables preference versioning and soft deletion, supporting features like
preference history and temporary preference modifications.
CREATE TABLE user_preferences (
preference_id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
preference_category VARCHAR(50) NOT NULL,
preference_key VARCHAR(100) NOT NULL,
preference_value TEXT,
json_preferences JSON,
is_active BOOLEAN DEFAULT TRUE,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE
CASCADE,
UNIQUE(user_id, preference_category, preference_key)
);
Travel Planning and Trip Management Tables
Trips Table Structure
The trips table stores high-level information about user travel plans, serving as the
central organizing entity for all trip-related data. Each trip represents a complete travel
experience, from initial planning through completion, with comprehensive metadata to
support various application features.
The table structure includes a unique trip_id primary key and foreign key relationship to
the users table, ensuring proper data ownership and access control. The trip_name field
allows users to create memorable names for their trips, while the destination field stores
the primary destination information. For multi-destination trips, additional destinations
are stored in related tables.
Date management includes start_date and end_date fields that define the trip duration,
with appropriate constraints to ensure logical date relationships. The estimated_budget
and actual_budget fields support budget planning and tracking features, while the
currency field ensures proper financial calculations for international travel.
Trip status management uses a status field with predefined values like 'planning',
'confirmed', 'in_progress', 'completed', or 'cancelled'. This status tracking supports
workflow management and user interface customization based on trip progress. The
is_public field enables trip sharing features, while the share_token provides secure
access to shared trips.
Metadata fields include created_at and updated_at timestamps for audit trails, and a
notes field for user-generated trip descriptions or special requirements. The trip_type
field categorizes trips as 'leisure', 'business', 'adventure', or other types, supporting
personalized recommendations and analytics.
CREATE TABLE trips (
trip_id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
trip_name VARCHAR(200) NOT NULL,
destination VARCHAR(200) NOT NULL,
start_date DATE NOT NULL,
end_date DATE NOT NULL,
estimated_budget DECIMAL(10,2),
actual_budget DECIMAL(10,2),
currency VARCHAR(3) DEFAULT 'USD',
status VARCHAR(20) DEFAULT 'planning',
trip_type VARCHAR(50),
is_public BOOLEAN DEFAULT FALSE,
share_token VARCHAR(100) UNIQUE,
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE
CASCADE,
CHECK (end_date >= start_date),
CHECK (status IN ('planning', 'confirmed', 'in_progress',
'completed', 'cancelled'))
);
Itinerary Items Table Structure
The itinerary_items table stores detailed information about individual components of a
trip, including activities, accommodations, transportation, and dining experiences. This
table provides the granular detail needed for comprehensive trip planning and
management.
The table structure includes relationships to both trips and users tables, ensuring proper
data ownership and trip association. The item_type field categorizes items as
'accommodation', 'activity', 'transportation', 'dining', or 'other', enabling type-specific
handling and display logic.
Temporal scheduling includes day_number, start_time, and end_time fields that define
when activities occur within the trip timeline. The duration field stores calculated or
estimated activity durations, supporting schedule optimization and conflict detection.
Date and time handling considers timezone differences for international travel.
Location information includes detailed address and coordinate data to support mapping
and navigation features. The venue_name and venue_address fields store humanreadable location information, while latitude and longitude fields enable precise
mapping and distance calculations.
Financial information includes cost, currency, and booking_status fields that track
expenses and reservation status. The booking_reference field stores confirmation
numbers or booking identifiers, while external_booking_url provides links to booking
platforms for affiliate marketing integration.
Descriptive fields include title, description, and notes that store user-generated content
and AI-generated recommendations. The priority field enables importance ranking,
while the is_confirmed field tracks booking status. The source field indicates whether
items were AI-generated, user-added, or imported from external sources.
CREATE TABLE itinerary_items (
item_id INTEGER PRIMARY KEY AUTOINCREMENT,
trip_id INTEGER NOT NULL,
user_id INTEGER NOT NULL,
item_type VARCHAR(50) NOT NULL,
day_number INTEGER NOT NULL,
title VARCHAR(200) NOT NULL,
description TEXT,
venue_name VARCHAR(200),
venue_address TEXT,
latitude DECIMAL(10,8),
longitude DECIMAL(11,8),
start_time TIME,
end_time TIME,
duration INTEGER, -- in minutes
cost DECIMAL(10,2),
currency VARCHAR(3) DEFAULT 'USD',
booking_status VARCHAR(20) DEFAULT 'not_booked',
booking_reference VARCHAR(100),
external_booking_url VARCHAR(500),
priority INTEGER DEFAULT 5,
is_confirmed BOOLEAN DEFAULT FALSE,
source VARCHAR(50) DEFAULT 'user', -- 'ai', 'user',
'imported'
notes TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE
CASCADE,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE
CASCADE,
CHECK (item_type IN ('accommodation', 'activity',
'transportation', 'dining', 'other')),
CHECK (booking_status IN ('not_booked', 'pending',
'confirmed', 'cancelled')),
CHECK (priority BETWEEN 1 AND 10),
CHECK (end_time > start_time OR end_time IS NULL)
);
AI Conversation and Interaction Tables
Conversations Table Structure
The conversations table stores AI chat interactions between users and the travel
planning system, maintaining context and history for improved user experience and AI
learning. This table supports both trip-specific conversations and general travel
planning discussions.
The table structure includes relationships to users and optionally to trips, allowing
conversations to be associated with specific travel plans or remain general. The
conversation_type field distinguishes between 'trip_planning', 'general_inquiry',
'support', or 'feedback' conversations, enabling appropriate handling and routing.
Conversation metadata includes start_time and last_activity timestamps that track
conversation duration and engagement. The status field indicates whether
conversations are 'active', 'paused', 'completed', or 'archived', supporting conversation
management and user interface organization.
Context preservation includes a context_summary field that stores AI-generated
summaries of conversation topics and decisions. This summary enables conversation
resumption and context maintenance across multiple sessions. The
preferences_extracted field stores structured data about travel preferences identified
during the conversation.
Integration fields include ai_model_version and conversation_settings that track which
AI models and configurations were used, supporting debugging and performance
analysis. The total_messages field provides quick access to conversation length metrics.
CREATE TABLE conversations (
conversation_id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
trip_id INTEGER,
conversation_type VARCHAR(50) DEFAULT 'trip_planning',
status VARCHAR(20) DEFAULT 'active',
context_summary TEXT,
preferences_extracted JSON,
ai_model_version VARCHAR(50),
conversation_settings JSON,
total_messages INTEGER DEFAULT 0,
start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE
CASCADE,
FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE
SET NULL,
CHECK (conversation_type IN ('trip_planning',
'general_inquiry', 'support', 'feedback')),
CHECK (status IN ('active', 'paused', 'completed',
'archived'))
);
Messages Table Structure
The messages table stores individual messages within conversations, maintaining the
complete dialogue history between users and the AI system. This detailed storage
supports conversation analysis, AI training, and user experience improvements.
The table structure includes foreign key relationships to conversations and users,
ensuring proper message attribution and conversation organization. The message_type
field distinguishes between 'user', 'ai', 'system', or 'notification' messages, enabling
appropriate display and processing logic.
Message content is stored in both text and structured formats. The message_text field
contains the human-readable message content, while the structured_data field stores
JSON-formatted data for complex messages like itinerary suggestions or preference
confirmations.
Temporal information includes precise timestamps and sequence numbers to maintain
message ordering and support conversation reconstruction. The response_time field
tracks AI processing duration for performance monitoring and optimization.
Metadata fields include confidence_score for AI responses, indicating the system's
confidence in its recommendations. The tokens_used field tracks API usage for cost
management and optimization. The is_edited field supports message modification
features, while the parent_message_id enables threaded conversations.
CREATE TABLE messages (
message_id INTEGER PRIMARY KEY AUTOINCREMENT,
conversation_id INTEGER NOT NULL,
user_id INTEGER NOT NULL,
message_type VARCHAR(20) NOT NULL,
message_text TEXT NOT NULL,
structured_data JSON,
sequence_number INTEGER NOT NULL,
confidence_score DECIMAL(3,2),
tokens_used INTEGER,
response_time INTEGER, -- in milliseconds
is_edited BOOLEAN DEFAULT FALSE,
parent_message_id INTEGER,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (conversation_id) REFERENCES
conversations(conversation_id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE
CASCADE,
FOREIGN KEY (parent_message_id) REFERENCES
messages(message_id) ON DELETE SET NULL,
CHECK (message_type IN ('user', 'ai', 'system',
'notification')),
CHECK (confidence_score BETWEEN 0.0 AND 1.0 OR
confidence_score IS NULL)
);
Supporting Tables for Enhanced Functionality
User Sessions Table Structure
The user_sessions table manages user authentication sessions and provides enhanced
security features beyond basic Flask session management. This table supports multiple
concurrent sessions, session tracking, and security monitoring.
The table structure includes foreign key relationships to users and comprehensive
session metadata. The session_token field stores unique session identifiers, while the
device_info and ip_address fields support security monitoring and device management
features.
Session lifecycle management includes created_at, last_activity, and expires_at
timestamps that control session validity and cleanup. The is_active field enables session
revocation, while the logout_time tracks explicit session termination.
Security features include the remember_me field for persistent sessions and the
security_flags field for storing session-specific security settings. The user_agent field
stores browser information for security analysis and device identification.
CREATE TABLE user_sessions (
session_id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
session_token VARCHAR(255) UNIQUE NOT NULL,
device_info TEXT,
ip_address VARCHAR(45),
user_agent TEXT,
remember_me BOOLEAN DEFAULT FALSE,
is_active BOOLEAN DEFAULT TRUE,
security_flags JSON,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
expires_at DATETIME,
logout_time DATETIME,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE
CASCADE
);
Shared Trips Table Structure
The shared_trips table manages trip sharing functionality, enabling users to share their
travel plans with friends, family, or travel companions. This table supports various
sharing permissions and access control features.
The table structure includes relationships to trips and users, with additional fields for
managing sharing permissions and access control. The shared_with_email field allows
sharing with non-registered users, while the permission_level field controls what actions
shared users can perform.
Access management includes share_token for secure access and expires_at for timelimited sharing. The access_count field tracks sharing engagement, while the
last_accessed timestamp monitors sharing activity.
Permission levels include 'view', 'comment', 'edit', or 'admin', providing granular control
over shared trip access. The notification_settings field controls how shared users receive
updates about trip changes.
CREATE TABLE shared_trips (
share_id INTEGER PRIMARY KEY AUTOINCREMENT,
trip_id INTEGER NOT NULL,
shared_by_user_id INTEGER NOT NULL,
shared_with_user_id INTEGER,
shared_with_email VARCHAR(255),
share_token VARCHAR(100) UNIQUE NOT NULL,
permission_level VARCHAR(20) DEFAULT 'view',
notification_settings JSON,
access_count INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT TRUE,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
last_accessed DATETIME,
expires_at DATETIME,
FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE
CASCADE,
FOREIGN KEY (shared_by_user_id) REFERENCES users(user_id)
ON DELETE CASCADE,
FOREIGN KEY (shared_with_user_id) REFERENCES users(user_id)
ON DELETE CASCADE,
CHECK (permission_level IN ('view', 'comment', 'edit',
'admin')),
CHECK (shared_with_user_id IS NOT NULL OR shared_with_email
IS NOT NULL)
);
Indexing Strategy and Performance Optimization
Primary Index Design
The indexing strategy for TravelMind AI focuses on optimizing common query patterns
while maintaining efficient storage and update performance. Primary indexes are
automatically created for primary key fields, providing efficient access for entity lookups
and foreign key relationships.
User-related queries benefit from indexes on email addresses for authentication, user_id
for session management, and created_at for user analytics. Trip queries require indexes
on user_id for user trip lists, status for filtering active trips, and date ranges for temporal
queries.
Conversation and message queries need indexes on user_id and trip_id for conversation
retrieval, conversation_id for message ordering, and created_at for temporal sorting.
Itinerary queries benefit from indexes on trip_id and day_number for schedule retrieval.
Composite Index Strategy
Composite indexes optimize multi-column queries that are common in travel planning
applications. User preference queries benefit from composite indexes on (user_id,
preference_category) for efficient preference retrieval and (user_id, is_active) for active
preference filtering.
Trip and itinerary queries use composite indexes on (user_id, status) for filtered trip lists,
(trip_id, day_number) for itinerary ordering, and (trip_id, item_type) for type-specific
item retrieval. Message queries benefit from (conversation_id, sequence_number) for
ordered message retrieval.
Sharing and collaboration queries use composite indexes on (trip_id, is_active) for active
shares and (shared_with_user_id, permission_level) for permission-based access
control.
-- User and authentication indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_sessions_token ON
user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_active ON
user_sessions(user_id, is_active);
-- Preference indexes
CREATE INDEX idx_preferences_user_category ON
user_preferences(user_id, preference_category);
CREATE INDEX idx_preferences_user_active ON
user_preferences(user_id, is_active);
-- Trip and itinerary indexes
CREATE INDEX idx_trips_user_status ON trips(user_id, status);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_itinerary_trip_day ON itinerary_items(trip_id,
day_number);
CREATE INDEX idx_itinerary_trip_type ON
itinerary_items(trip_id, item_type);
-- Conversation indexes
CREATE INDEX idx_conversations_user_type ON
conversations(user_id, conversation_type);
CREATE INDEX idx_conversations_trip ON conversations(trip_id);
CREATE INDEX idx_messages_conversation_sequence ON
messages(conversation_id, sequence_number);
CREATE INDEX idx_messages_user ON messages(user_id);
-- Sharing indexes
CREATE INDEX idx_shared_trips_trip_active ON
shared_trips(trip_id, is_active);
CREATE INDEX idx_shared_trips_user_permission ON
shared_trips(shared_with_user_id, permission_level);
CREATE INDEX idx_shared_trips_token ON
shared_trips(share_token);
Data Migration and Schema Evolution
Version Control and Migration Strategy
The database schema includes version control mechanisms to support future
enhancements and migrations. A schema_version table tracks the current database
version and migration history, enabling automated schema updates and rollback
capabilities.
Migration scripts handle schema changes incrementally, ensuring data integrity during
updates. Each migration includes forward and backward compatibility checks, data
transformation procedures, and validation steps to ensure successful schema evolution.
The migration strategy considers production deployment requirements, including zerodowntime updates, data backup procedures, and rollback mechanisms. Migration
testing includes data validation, performance impact assessment, and compatibility
verification across different SQLite versions.
CREATE TABLE schema_version (
version_id INTEGER PRIMARY KEY,
version_number VARCHAR(20) NOT NULL,
description TEXT,
applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
rollback_script TEXT
);
-- Initial version
INSERT INTO schema_version (version_number, description)
VALUES ('1.0.0', 'Initial TravelMind AI schema');
Future Scalability Considerations
The schema design anticipates future scalability requirements while maintaining current
simplicity. Planned enhancements include additional preference types, advanced
sharing features, integration with external booking systems, and enhanced analytics
capabilities.
Table partitioning strategies consider temporal data distribution, with conversations and
messages being candidates for date-based partitioning as data volume grows. Archive
strategies include moving completed trips and old conversations to separate tables or
external storage systems.
Performance monitoring includes query analysis, index effectiveness measurement, and
storage growth tracking. The schema design supports horizontal scaling through data
sharding strategies based on user_id or geographic regions.
Data retention policies consider privacy requirements and storage optimization, with
automated cleanup procedures for expired sessions, old conversations, and archived
trips. The schema supports both hard deletion and soft deletion patterns based on data
sensitivity and regulatory requirements.
This comprehensive database schema provides a solid foundation for TravelMind AI
while maintaining the flexibility needed for future growth and feature enhancement. The
modular design ensures that new features can be added without disrupting existing
functionality, while the performance optimization strategies support efficient operation
as the user base and data volume grow.