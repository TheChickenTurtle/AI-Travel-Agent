import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Paperclip, Bot, User, MapPin, Calendar, DollarSign, Users, Plane, Clock, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'trip-summary' | 'recommendations' | 'itinerary-preview';
  data?: any;
}

interface TripSummary {
  destination: string;
  dates: { startDate: string; endDate: string };
  budget: number;
  travelers: number;
  interests: string[];
  accommodation: string;
  status: 'planning' | 'ready-to-book';
}

const ChatPage: React.FC = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tripSummary, setTripSummary] = useState<TripSummary | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: `Hi ${user?.firstName}! 👋 I'm your AI travel assistant. I'm here to help you plan the perfect trip tailored to your preferences. Let's start by getting to know what kind of adventure you're looking for!\n\nTo get started, you can tell me:\n• Where would you like to go?\n• What's your budget range?\n• When are you planning to travel?\n• What activities interest you most?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, [user?.firstName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickReplies = [
    { text: '🌸 I want to visit Japan', icon: '🏯' },
    { text: '🏖️ Beach vacation under $2000', icon: '🏖️' },
    { text: '🗺️ Surprise me with a destination', icon: '✨' },
    { text: '🍝 Food-focused trip to Italy', icon: '🍝' }
  ];

  const generateAIResponse = (userMessage: string): Message => {
    // Simulate AI understanding and response generation
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('japan') || lowerMessage.includes('tokyo') || lowerMessage.includes('kyoto')) {
      // Japan trip response with trip summary
      const tripData: TripSummary = {
        destination: 'Tokyo & Kyoto, Japan',
        dates: { startDate: '2024-04-15', endDate: '2024-04-25' },
        budget: 3500,
        travelers: 2,
        interests: ['Culture', 'Food', 'History', 'Nature'],
        accommodation: 'Traditional Ryokan + Modern Hotel',
        status: 'planning'
      };
      
      setTripSummary(tripData);
      
      return {
        id: Date.now().toString(),
        content: "Excellent choice! Japan is absolutely magical, especially during cherry blossom season. I've created a preliminary trip plan for you covering Tokyo and Kyoto. This includes traditional experiences like staying in a ryokan, visiting ancient temples, and of course, incredible food experiences!\n\nYour trip includes:\n🏯 Temple visits in Kyoto\n🍣 Authentic sushi experiences\n🌸 Cherry blossom viewing\n🏨 Mix of traditional and modern accommodation\n🚅 Bullet train experience\n\nWould you like me to adjust the budget, add more cities, or focus on specific activities?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'trip-summary',
        data: tripData
      };
    }
    
    if (lowerMessage.includes('beach') || lowerMessage.includes('tropical') || lowerMessage.includes('bali')) {
      return {
        id: Date.now().toString(),
        content: "A tropical beach getaway sounds perfect! 🏖️ Based on your budget, I recommend Bali, Thailand, or the Philippines. These destinations offer beautiful beaches, rich culture, and excellent value for money.\n\n**Bali, Indonesia** would be perfect for:\n• Stunning beaches in Uluwatu and Seminyak\n• Cultural experiences in Ubud\n• Delicious local cuisine\n• Affordable luxury accommodations\n\nShall I create a detailed itinerary for Bali, or would you prefer to explore other tropical destinations?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'recommendations'
      };
    }
    
    if (lowerMessage.includes('surprise') || lowerMessage.includes('anywhere')) {
      return {
        id: Date.now().toString(),
        content: "I love the sense of adventure! 🎲 Based on your travel style preferences, here are some unique destinations that might surprise you:\n\n🇵🇹 **Portugal** - Stunning coastlines, historic cities, and amazing food\n🇲🇦 **Morocco** - Vibrant markets, desert adventures, and rich culture\n🇮🇸 **Iceland** - Northern lights, hot springs, and dramatic landscapes\n🇻🇳 **Vietnam** - Incredible cuisine, beautiful bays, and bustling cities\n\nWhich of these sparks your interest, or would you like me to suggest something completely different based on a specific month or activity?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'recommendations'
      };
    }
    
    if (lowerMessage.includes('italy') || lowerMessage.includes('food') || lowerMessage.includes('pasta')) {
      return {
        id: Date.now().toString(),
        content: "Fantastico! A culinary journey through Italy is unforgettable! 🍝 I'll design a food-focused itinerary that takes you through the country's most delicious regions.\n\n**Your Italian Food Adventure:**\n• Rome - Traditional carbonara and supplì\n• Florence - Bistecca alla Fiorentina and Chianti\n• Bologna - Fresh pasta and mortadella\n• Naples - Authentic pizza and sfogliatelle\n\nWe can include cooking classes, wine tastings, market tours, and visits to local trattorias that tourists rarely find. What's your budget range and how many days are you thinking?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      content: "That sounds great! I'd love to help you plan this trip. To create the perfect itinerary for you, could you tell me a bit more about:\n\n• Your preferred travel dates\n• Budget range you're comfortable with\n• What type of experiences excite you most\n• How many people will be traveling\n\nThe more details you share, the better I can tailor your perfect adventure! ✈️",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    
    if (message.type === 'trip-summary' && message.data) {
      const data = message.data as TripSummary;
      return (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Trip Summary</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Planning
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{data.destination}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {formatDate(data.dates.startDate)} - {formatDate(data.dates.endDate)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm">${data.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{data.travelers} travelers</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest, index) => (
                  <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/itinerary/${Date.now()}`)}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>View Full Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-gray-700">{message.content}</p>
        </div>
      );
    }
    
    return <p className="text-gray-700">{message.content}</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-140px)] flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">TravelMind AI</h2>
                    <p className="text-sm text-gray-500">Your personal travel assistant</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg flex ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    } items-start space-x-3`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white ml-3'
                          : 'bg-gray-100 text-gray-900 mr-3'
                      }`}
                    >
                      {renderMessage(message)}
                      <div
                        className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="px-6 py-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(reply.text)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
                    disabled={isTyping}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isTyping ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Summary Sidebar */}
          {tripSummary && (
            <div className={`w-80 border-l border-gray-200 bg-gray-50 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Planning</h3>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Current Trip</h4>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {tripSummary.status === 'planning' ? 'Planning' : 'Ready'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Destination</span>
                      </div>
                      <p className="text-sm text-gray-700 pl-6">{tripSummary.destination}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Dates</span>
                      </div>
                      <p className="text-sm text-gray-700 pl-6">
                        {formatDate(tripSummary.dates.startDate)} - {formatDate(tripSummary.dates.endDate)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Budget</span>
                      </div>
                      <p className="text-sm text-gray-700 pl-6">${tripSummary.budget.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Travelers</span>
                      </div>
                      <p className="text-sm text-gray-700 pl-6">{tripSummary.travelers} people</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Interests</h5>
                    <div className="flex flex-wrap gap-1">
                      {tripSummary.interests.map((interest, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/itinerary/${Date.now()}`)}
                    className="w-full mt-4 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-sm"
                  >
                    View Full Itinerary
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Planning Progress</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Destination & Dates</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Budget & Preferences</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Accommodation</span>
                      <span className="text-yellow-600">⏳</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Activities & Dining</span>
                      <span className="text-gray-400">○</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Transportation</span>
                      <span className="text-gray-400">○</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;