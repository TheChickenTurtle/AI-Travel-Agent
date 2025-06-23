import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Clock, DollarSign, Users, Share2, Download, Edit3, 
  Plus, Trash2, Star, ExternalLink, Camera, Utensils, Plane, Car, Train,
  ChevronLeft, ChevronRight, Map, Heart, MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  location: string;
  cost: number;
  category: 'attraction' | 'restaurant' | 'transport' | 'accommodation' | 'activity';
  imageUrl: string;
  rating: number;
  bookingUrl?: string;
  notes?: string;
}

interface TripDay {
  date: string;
  activities: Activity[];
  totalCost: number;
}

interface TripItinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalBudget: number;
  actualCost: number;
  status: 'draft' | 'confirmed' | 'completed';
  days: TripDay[];
  notes: string;
}

const SortableActivity: React.FC<{ activity: Activity; onEdit: (activity: Activity) => void; onDelete: (id: string) => void }> = ({ 
  activity, 
  onEdit, 
  onDelete 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCategoryIcon = (category: Activity['category']) => {
    switch (category) {
      case 'attraction': return <MapPin className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'transport': return <Car className="w-4 h-4" />;
      case 'accommodation': return <Star className="w-4 h-4" />;
      case 'activity': return <Camera className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Activity['category']) => {
    switch (category) {
      case 'attraction': return 'bg-blue-100 text-blue-700';
      case 'restaurant': return 'bg-orange-100 text-orange-700';
      case 'transport': return 'bg-green-100 text-green-700';
      case 'accommodation': return 'bg-purple-100 text-purple-700';
      case 'activity': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-move group"
    >
      <div className="flex items-start space-x-4">
        <img
          src={activity.imageUrl}
          alt={activity.title}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900 truncate">{activity.title}</h4>
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                  {getCategoryIcon(activity.category)}
                  <span className="capitalize">{activity.category}</span>
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{activity.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{activity.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>${activity.cost}</span>
                </div>
                {activity.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                    <span>{activity.rating}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(activity)}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(activity.id)}
                className="p-1 text-gray-400 hover:text-error-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {activity.bookingUrl && (
                <a
                  href={activity.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ItineraryPage: React.FC = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sample itinerary data
  const sampleItinerary: TripItinerary = {
    id: tripId || '1',
    title: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    startDate: '2024-04-15',
    endDate: '2024-04-20',
    travelers: 2,
    totalBudget: 3500,
    actualCost: 2850,
    status: 'confirmed',
    notes: 'Don\'t forget to book JR Pass in advance!',
    days: [
      {
        date: '2024-04-15',
        totalCost: 320,
        activities: [
          {
            id: '1',
            title: 'Arrival at Narita Airport',
            description: 'Land at Narita International Airport and take the express train to Shibuya',
            time: '14:30',
            duration: '2 hours',
            location: 'Narita Airport',
            cost: 25,
            category: 'transport',
            imageUrl: 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 0,
            bookingUrl: 'https://example.com/narita-express'
          },
          {
            id: '2',
            title: 'Hotel Check-in',
            description: 'Check into the Park Hotel Tokyo with stunning city views',
            time: '16:00',
            duration: '30 minutes',
            location: 'Shibuya, Tokyo',
            cost: 180,
            category: 'accommodation',
            imageUrl: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.5
          },
          {
            id: '3',
            title: 'Shibuya Crossing Experience',
            description: 'Experience the world\'s busiest pedestrian crossing and explore the area',
            time: '17:00',
            duration: '1.5 hours',
            location: 'Shibuya Crossing',
            cost: 0,
            category: 'attraction',
            imageUrl: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.8
          },
          {
            id: '4',
            title: 'Dinner at Ichiran Ramen',
            description: 'Authentic tonkotsu ramen at the famous chain restaurant',
            time: '19:00',
            duration: '1 hour',
            location: 'Shibuya',
            cost: 15,
            category: 'restaurant',
            imageUrl: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.3
          }
        ]
      },
      {
        date: '2024-04-16',
        totalCost: 485,
        activities: [
          {
            id: '5',
            title: 'Senso-ji Temple Visit',
            description: 'Tokyo\'s oldest temple with traditional architecture and cultural significance',
            time: '09:00',
            duration: '2 hours',
            location: 'Asakusa',
            cost: 0,
            category: 'attraction',
            imageUrl: 'https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-temple-161401.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.7
          },
          {
            id: '6',
            title: 'Traditional Lunch at Daikokuya',
            description: 'Historic tempura restaurant serving traditional Japanese cuisine since 1887',
            time: '12:00',
            duration: '1 hour',
            location: 'Asakusa',
            cost: 45,
            category: 'restaurant',
            imageUrl: 'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.6
          },
          {
            id: '7',
            title: 'Tokyo Skytree',
            description: 'Visit the tallest structure in Japan with panoramic city views',
            time: '14:30',
            duration: '2 hours',
            location: 'Sumida',
            cost: 40,
            category: 'attraction',
            imageUrl: 'https://images.pexels.com/photos/315191/pexels-photo-315191.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.5,
            bookingUrl: 'https://example.com/skytree-tickets'
          },
          {
            id: '8',
            title: 'Sushi Making Class',
            description: 'Learn to make authentic sushi with a professional chef',
            time: '18:00',
            duration: '2.5 hours',
            location: 'Ginza',
            cost: 120,
            category: 'activity',
            imageUrl: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.9,
            bookingUrl: 'https://example.com/sushi-class'
          }
        ]
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setItinerary(sampleItinerary);
      setIsLoading(false);
    }, 1000);
  }, [tripId]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && itinerary) {
      const activeIndex = itinerary.days[selectedDay].activities.findIndex(
        (activity) => activity.id === active.id
      );
      const overIndex = itinerary.days[selectedDay].activities.findIndex(
        (activity) => activity.id === over.id
      );

      const newItinerary = { ...itinerary };
      newItinerary.days[selectedDay].activities = arrayMove(
        itinerary.days[selectedDay].activities,
        activeIndex,
        overIndex
      );

      setItinerary(newItinerary);
    }
  };

  const handleEditActivity = (activity: Activity) => {
    // Implement edit functionality
    console.log('Edit activity:', activity);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (!itinerary) return;
    
    const newItinerary = { ...itinerary };
    newItinerary.days[selectedDay].activities = newItinerary.days[selectedDay].activities.filter(
      activity => activity.id !== activityId
    );
    
    // Recalculate total cost for the day
    newItinerary.days[selectedDay].totalCost = newItinerary.days[selectedDay].activities.reduce(
      (sum, activity) => sum + activity.cost, 0
    );
    
    setItinerary(newItinerary);
  };

  const handleAddActivity = () => {
    navigate(`/chat/${tripId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayNumber = (dateString: string, startDate: string) => {
    const start = new Date(startDate);
    const current = new Date(dateString);
    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const exportToCalendar = () => {
    // Implement calendar export functionality
    console.log('Export to calendar');
  };

  const shareItinerary = () => {
    setShowShareModal(true);
  };

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

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary Not Found</h2>
          <p className="text-gray-600 mb-8">The itinerary you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{itinerary.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  itinerary.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  itinerary.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(itinerary.startDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{itinerary.travelers} travelers</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${itinerary.actualCost} / ${itinerary.totalBudget}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => navigate(`/chat/${tripId}`)}
                className="flex items-center space-x-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Modify with AI</span>
              </button>
              <button
                onClick={shareItinerary}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={exportToCalendar}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Day Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Trip Days</h3>
              <div className="space-y-2">
                {itinerary.days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedDay === index
                        ? 'bg-primary-100 text-primary-700 border-primary-200'
                        : 'hover:bg-gray-50 border-transparent'
                    } border`}
                  >
                    <div className="font-medium">
                      Day {getDayNumber(day.date, itinerary.startDate)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(day.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${day.totalCost} • {day.activities.length} activities
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Budget</span>
                  <span className="font-medium">${itinerary.totalBudget}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Current Cost</span>
                  <span className="font-medium">${itinerary.actualCost}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      itinerary.actualCost > itinerary.totalBudget ? 'bg-error-500' : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min((itinerary.actualCost / itinerary.totalBudget) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((itinerary.actualCost / itinerary.totalBudget) * 100).toFixed(0)}% of budget used
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Day Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Day {getDayNumber(itinerary.days[selectedDay].date, itinerary.startDate)}
                    </h2>
                    <p className="text-gray-600">{formatDate(itinerary.days[selectedDay].date)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Day Total</div>
                      <div className="font-semibold text-gray-900">
                        ${itinerary.days[selectedDay].totalCost}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAddActivity}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Activity</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div className="p-6">
                {itinerary.days[selectedDay].activities.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activities planned</h3>
                    <p className="text-gray-600 mb-4">Add some activities to get started</p>
                    <button
                      onClick={handleAddActivity}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add First Activity
                    </button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={itinerary.days[selectedDay].activities.map(a => a.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {itinerary.days[selectedDay].activities.map((activity) => (
                          <SortableActivity
                            key={activity.id}
                            activity={activity}
                            onEdit={handleEditActivity}
                            onDelete={handleDeleteActivity}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {/* Notes Section */}
            {itinerary.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Trip Notes</h3>
                <p className="text-gray-700">{itinerary.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Itinerary</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/itinerary/${itinerary.id}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/itinerary/${itinerary.id}`)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Share on Facebook
                </button>
                <button className="flex-1 py-2 px-4 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors">
                  Share on Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryPage;