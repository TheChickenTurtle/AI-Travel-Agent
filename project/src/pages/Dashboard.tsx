import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users, Clock, Plane, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'confirmed' | 'completed';
  imageUrl: string;
  budget: number;
  activities: number;
  progress: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    totalSpent: 0,
    favoriteDestination: 'Not set'
  });

  // Sample trip data
  const sampleTrips: Trip[] = [
    {
      id: '1',
      title: 'Tokyo Adventure',
      destination: 'Tokyo, Japan',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      status: 'planning',
      imageUrl: 'https://images.pexels.com/photos/248195/pexels-photo-248195.jpeg?auto=compress&cs=tinysrgb&w=400',
      budget: 2500,
      activities: 12,
      progress: 65
    },
    {
      id: '2',
      title: 'European Explorer',
      destination: 'Paris, France',
      startDate: '2024-05-10',
      endDate: '2024-05-17',
      status: 'confirmed',
      imageUrl: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
      budget: 3200,
      activities: 18,
      progress: 100
    },
    {
      id: '3',
      title: 'Bali Getaway',
      destination: 'Bali, Indonesia',
      startDate: '2023-12-05',
      endDate: '2023-12-12',
      status: 'completed',
      imageUrl: 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=400',
      budget: 1800,
      activities: 10,
      progress: 100
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTrips(sampleTrips);
      setStats({
        totalTrips: sampleTrips.length,
        upcomingTrips: sampleTrips.filter(t => t.status !== 'completed').length,
        totalSpent: sampleTrips.reduce((sum, trip) => sum + trip.budget, 0),
        favoriteDestination: 'Japan'
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Trip['status']) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <Calendar className="w-4 h-4" />;
      case 'completed': return <Star className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const quickActions = [
    {
      title: 'Explore Europe',
      description: 'Historic cities and stunning landscapes',
      image: 'https://images.pexels.com/photos/1386444/pexels-photo-1386444.jpeg?auto=compress&cs=tinysrgb&w=300',
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Asian Adventure',
      description: 'Rich culture and delicious cuisine',
      image: 'https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-temple-161401.jpeg?auto=compress&cs=tinysrgb&w=300',
      color: 'from-green-500 to-blue-500'
    },
    {
      title: 'Tropical Escape',
      description: 'Beaches, sunshine, and relaxation',
      image: 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=300',
      color: 'from-yellow-500 to-pink-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! ✈️
          </h1>
          <p className="text-gray-600">Ready to plan your next amazing adventure?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTrips}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorite Destination</p>
                <p className="text-lg font-bold text-gray-900">{stats.favoriteDestination}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Star className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Start New Trip CTA */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Plan Your Next Adventure</h2>
                  <p className="text-primary-100 mb-4">
                    Let our AI create the perfect itinerary tailored to your preferences
                  </p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Start New Trip</span>
                  </button>
                </div>
                <div className="hidden md:block">
                  <Plane className="w-24 h-24 text-primary-300" />
                </div>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Your Trips</h3>
                <p className="text-sm text-gray-600">Manage and track your travel plans</p>
              </div>
              
              {trips.length === 0 ? (
                <div className="p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h4>
                  <p className="text-gray-600 mb-4">Start planning your first adventure with our AI assistant</p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Plan Your First Trip
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {trips.map((trip) => (
                    <div key={trip.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <img
                          src={trip.imageUrl}
                          alt={trip.destination}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                {trip.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">{trip.destination}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                                <span>{trip.activities} activities</span>
                                <span>${trip.budget.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                                {getStatusIcon(trip.status)}
                                <span className="capitalize">{trip.status}</span>
                              </span>
                            </div>
                          </div>
                          
                          {trip.status === 'planning' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>Planning Progress</span>
                                <span>{trip.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${trip.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex items-center space-x-3">
                            <Link
                              to={`/itinerary/${trip.id}`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View Details
                            </Link>
                            {trip.status === 'planning' && (
                              <Link
                                to={`/chat/${trip.id}`}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                Continue Planning
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Quick Inspiration</h3>
                <p className="text-sm text-gray-600">Popular destinations to explore</p>
              </div>
              <div className="p-6 space-y-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-lg group cursor-pointer"
                    onClick={() => navigate('/chat')}
                  >
                    <div className={`bg-gradient-to-r ${action.color} p-4 text-white relative`}>
                      <div className="relative z-10">
                        <h4 className="font-semibold mb-1">{action.title}</h4>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                      <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-30 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Tips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Travel Tips</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Book in Advance</h4>
                    <p className="text-sm text-gray-600">Save up to 40% by booking flights 6-8 weeks early</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Travel Insurance</h4>
                    <p className="text-sm text-gray-600">Protect your trip with comprehensive coverage</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Local Experiences</h4>
                    <p className="text-sm text-gray-600">Try authentic local food and cultural activities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;