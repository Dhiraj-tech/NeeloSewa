import React from 'react';

const Offers = () => {
  return (
    <section id="offers-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center flex items-center justify-center">
        <span className="material-icons text-3xl mr-3 text-yellow-500">local_offer</span>Exclusive Discount Offers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Offer Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 card-hover-effect flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 text-blue-800 flex items-center"><span className="material-icons mr-2 text-blue-500">directions_bus</span>Get upto Rs.100 off</h3>
            <p className="text-gray-600 mb-4">on your next bus booking. Limited time offer!</p>
          </div>
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full self-start">Code: ROUTES</span>
        </div>
        {/* Offer Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 card-hover-effect flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 text-purple-800 flex items-center"><span className="material-icons mr-2 text-purple-500">credit_card</span>Nabil Bank Deal</h3>
            <p className="text-gray-600 mb-4">Get 20% off with Nabil Banking transactions.</p>
          </div>
          <span className="inline-block bg-purple-100 text-purple-800 text-sm font-semibold px-4 py-2 rounded-full self-start">Code: NABIL20</span>
        </div>
        {/* Offer Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 card-hover-effect flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 text-green-800 flex items-center"><span className="material-icons mr-2 text-green-500">map</span>Complimentary Travel Guide</h3>
            <p className="text-gray-600 mb-4">Receive a free guide for your chosen drop point.</p>
          </div>
          <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full self-start">Code: GUIDEFREE</span>
        </div>
        {/* Offer Card 4 */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 card-hover-effect flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 text-yellow-800 flex items-center"><span className="material-icons mr-2 text-yellow-500">loyalty</span>Neelo Travel Card Discount</h3>
            <p className="text-gray-600 mb-4">Enjoy 20% off all bookings with your travel card.</p>
          </div>
          <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full self-start">Code: TRAVEL20</span>
        </div>
      </div>
    </section>
  );
};

export default Offers;