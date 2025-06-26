import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 mt-auto">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-blue-300">Neelo®</h3>
          <p className="text-gray-400 text-sm leading-relaxed">&copy; 2025 NeeloSewa. All rights reserved. Revolutionizing bus travel with cutting-edge AI technology.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-300">Company</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Career Opportunities</a></li>
            <li><a href="#" className="hover:text-white transition-colors">List Your Business</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Partnerships</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Affiliate Program</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Special Offers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Provide Feedback</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-300">Explore Adventure</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Trekking & Hiking</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Paragliding Thrills</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Rock Climbing Expeditions</a></li>
            <li><a href="#" className="hover:text-white transition-colors">White Water Rafting</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Jungle Safaris</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Ice Climbing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Peak Climbing Adventures</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Zipline & Bungee Jumping</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Mountain Biking</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Water Park Fun</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Boat Riding Experiences</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 mt-6 text-blue-300">Information</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Bus Operator Registration</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Agent Registration</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Insurance Partners</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Track Your Tickets</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Get a Free Guide</a></li>
          </ul>
          <h3 className="text-lg font-semibold mb-4 mt-6 text-blue-300">Help & Support</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Customer Support</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Coupon Codes</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cancel Booking</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;