import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Brain, Calendar, Shield, Star, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Planning',
      description: 'Our advanced AI understands your preferences and creates personalized itineraries that match your travel style.'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automatically optimize your schedule based on opening hours, travel times, and local events.'
    },
    {
      icon: Shield,
      title: 'Trusted Recommendations',
      description: 'Get verified recommendations from real travelers and local experts for authentic experiences.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, NY',
      rating: 5,
      comment: 'TravelMind AI planned the perfect 10-day Europe trip for us. Every recommendation was spot on!'
    },
    {
      name: 'Mike Chen',
      location: 'San Francisco, CA',
      rating: 5,
      comment: 'The AI understood exactly what I was looking for. Saved me hours of research and planning.'
    },
    {
      name: 'Emma Williams',
      location: 'London, UK',
      rating: 5,
      comment: 'Best travel planning tool I\'ve ever used. The itinerary was detailed and perfectly organized.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Chat with AI',
      description: 'Tell our AI about your dream destination, budget, and travel preferences in a natural conversation.'
    },
    {
      step: '02',
      title: 'Get Personalized Plans',
      description: 'Receive custom itineraries with activities, restaurants, and accommodations tailored to your interests.'
    },
    {
      step: '03',
      title: 'Book & Travel',
      description: 'Book everything directly through our platform and enjoy your perfectly planned adventure.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TravelMind AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-8 animate-fade-in">
              Plan Your Perfect Trip with
              <span className="text-primary-600 block mt-2">AI Intelligence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto animate-slide-up">
              Let our advanced AI create personalized travel itineraries that match your style, budget, and interests. 
              From hidden gems to must-see attractions, we've got your journey covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Start Planning Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="text-primary-600 hover:text-primary-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2">
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="mt-16 animate-slide-up">
          <div className="relative max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-2xl p-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">TravelMind AI</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-700">I'd love to help you plan an amazing trip to Japan! What type of experiences are you most interested in?</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm">🍜 Food & Culture</button>
                    <button className="bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm">🏔️ Nature & Hiking</button>
                    <button className="bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm">🏯 History & Temples</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Planning your dream trip is as easy as having a conversation. Here's how we make it happen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 group-hover:bg-primary-700 transition-colors">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-300 -z-10" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TravelMind AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of travel planning with our intelligent features designed to make your journey unforgettable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow group">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy travelers who've discovered their perfect trips with TravelMind AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who've discovered amazing destinations with our AI-powered planning assistant.
          </p>
          <Link
            to="/register"
            className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Start Your Journey Today</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;