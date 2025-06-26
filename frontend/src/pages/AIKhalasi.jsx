import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AIKhalasi = ({ showCustomModal, isAuthenticated }) => {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const chatMessagesEndRef = useRef(null); // Ref for scrolling to the bottom

  // Mock data for AI responses (should be replaced by actual LLM API call)
  const khalasiResponses = {
    "hello": "Hello! How can I assist your travel plans today?",
    "hi": "Hi there! What travel information are you looking for?",
    "best bus to pokhara": "For Pokhara, Greenline and Prithvi Bus are popular choices. They depart from Kalanki, Kathmandu.",
    "hotels in kathmandu": "Kathmandu has many hotels. Hotel Yak & Yeti is luxury, while Thamel Grand Hotel offers good value.",
    "hotels in pokhara": "Fishtail Lodge offers a great lake view. Hotel Fewa Holiday is a more budget-friendly option.",
    "cheapest bus to chitwan": "Safari Travels usually offers competitive prices for the Chitwan route.",
    "flight booking": "Currently, I only assist with bus and hotel bookings. Flights are coming soon!",
    "thank you": "You're welcome! Happy to help.",
    "bye": "Goodbye! Have a great trip!",
    "default": "I'm not sure how to answer that yet, but I'm always learning! Can you rephrase or ask about buses/hotels?"
  };

  useEffect(() => {
    // Scroll to the bottom of the chat messages whenever chatHistory updates
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleAiKhalasiSubmit = async () => {
    if (!isAuthenticated) {
      showCustomModal('Login Required', 'Please login to use AI Khalasi.');
      return;
    }
    const input = inputMessage.trim().toLowerCase();
    if (!input) return;

    // Add user message to chat history
    setChatHistory(prev => [...prev, { text: inputMessage.trim(), sender: 'user', timestamp: new Date() }]);
    setInputMessage(''); // Clear input field
    setIsLoadingAI(true); // Show loading indicator

    // Add "Thinking..." message
    setChatHistory(prev => [...prev, { text: 'Thinking...', sender: 'ai', timestamp: new Date(), isThinking: true }]);

    let aiResponseText = khalasiResponses.default; // Default response

    // This section simulates the LLM call. In a real app, this would be a fetch to your backend
    // which then calls the Gemini API.
    try {
        const prompt = `User asks: "${input}". Provide a concise travel-related answer relevant to buses and hotels in Nepal. If it's about their profile, trips, or wallet, provide a summary based on the following mock user data.
        Mock User Profile: Name: ${user?.name || 'N/A'}, Email: ${user?.email || 'N/A'}, Phone: ${user?.phone || 'N/A'}, Wallet Balance: Rs. ${user?.walletBalance?.toFixed(2) || '0.00'}.
        Mock Trips (Example): If user asks about "trips" or "bookings", respond with "You have a bus trip from Kathmandu to Pokhara on 2025-06-20 (Ticket BUS-20250616-123456) and a hotel booking for Fishtail Lodge, Pokhara from 2025-06-20 to 2025-06-23 (Ticket HOTEL-20250616-789012)". If no specific trips, say "You don't have any trips booked yet!".
        Mock Transactions (Example): If user asks about "transactions" or "wallet history", respond with "Last 2 transactions: Wallet Top-up +Rs. 500.00, Bus ticket purchase -Rs. 700.00". If no transactions, say "You have no transactions recorded yet."
        Keep answers short and direct.`;

        // Simulate API call to Gemini through your backend.
        // For this demo, we're still using a local mock.
        // Replace this with actual backend fetch when implementing the LLM integration.
        // Example LLM call via backend (conceptual, not executed here directly):
        /*
        const geminiResponse = await fetch('/api/llm/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
            body: JSON.stringify({ prompt: prompt })
        });
        const geminiResult = await geminiResponse.json();
        if (geminiResult.candidates && geminiResult.candidates.length > 0) {
            aiResponseText = geminiResult.candidates[0].content.parts[0].text;
        }
        */

        // Using mock responses for now based on the original JS logic
        const directMatch = Object.keys(khalasiResponses).find(key => input.includes(key));
        if (directMatch) {
            aiResponseText = khalasiResponses[directMatch];
        } else if (input.includes('profile') || input.includes('my info')) {
            aiResponseText = `Here is your profile information:\nName: ${user?.name || 'N/A'}\nEmail: ${user?.email || 'N/A'}\nPhone: ${user?.phone || 'N/A'}`;
        } else if (input.includes('trips') || input.includes('my bookings')) {
            // This would fetch actual trips from your backend in a real app
            // For now, give a mock response
            const mockUserTrips = JSON.parse(localStorage.getItem('mockUserTrips') || '[]'); // A simple mock store for demo
            if (mockUserTrips.length > 0) {
                 aiResponseText = "Here are your recent trips:\n";
                 mockUserTrips.forEach(trip => {
                    aiResponseText += `${trip.type}: ${trip.type === 'Bus' ? trip.route : trip.name} (Ticket: ${trip.ticketNumber || 'N/A'}) on ${trip.date || (trip.checkIn ? trip.checkIn : 'N/A')}. Status: ${trip.status}. Price: Rs. ${trip.price}\n`;
                });
            } else {
                aiResponseText = "You don't have any trips booked yet!.";
            }
        } else if (input.includes('wallet balance') || input.includes('my balance') || input.includes('wallet')) {
            aiResponseText = `Your current wallet balance is Rs. ${user?.walletBalance?.toFixed(2) || '0.00'}.`;
        } else if (input.includes('transactions') || input.includes('wallet history')) {
            const mockTransactions = JSON.parse(localStorage.getItem('mockTransactions') || '[]');
            if (mockTransactions.length > 0) {
                aiResponseText = "Here is your transaction history (last 5):\n";
                mockTransactions.slice(-5).forEach(tx => {
                    aiResponseText += `${new Date(tx.timestamp).toLocaleDateString()}: ${tx.description} - ${tx.type === 'credit' ? '+' : '-'}Rs. ${tx.amount.toFixed(2)}\n`;
                });
            } else {
                aiResponseText = "You have no transactions recorded yet.";
            }
        } else if (input.includes('bus from') && input.includes('to')) {
            aiResponseText = "To find buses, please use the search bar on the Home page. It provides the most accurate and up-to-date listings!";
        } else if (input.includes('features')) {
            aiResponseText = "NeeloSewa offers AI Khalasi, Unlimited Wifi, Neelo Wallet, and Track & Locate features to enhance your travel experience!";
        } else if (input.includes('track ticket')) {
            aiResponseText = "You can track your ticket by entering its number in the 'Track Ticket' section. Just provide me the ticket number and I can look it up for you!";
        }


    } catch (error) {
      console.error('Error calling AI Khalasi:', error);
      aiResponseText = "Sorry, I'm having trouble connecting right now. Please try again later.";
    } finally {
      // Remove "Thinking..." message and add the actual AI response
      setChatHistory(prev => {
        const newHistory = prev.filter(msg => !msg.isThinking);
        return [...newHistory, { text: aiResponseText, sender: 'ai', timestamp: new Date() }];
      });
      setIsLoadingAI(false); // Hide loading indicator
    }
  };

  return (
    <section id="ai-khalasi-page-content" className="page-content container mx-auto px-4 py-12 bg-white rounded-xl shadow-2xl mb-16 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center flex items-center justify-center">
        <span className="material-icons text-3xl mr-3 text-yellow-600">smart_toy</span>Engage with AI Khalasi!
      </h2>
      <div id="chat-messages" className="flex flex-col space-y-4 h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
        {chatHistory.length === 0 ? (
          <p id="chat-placeholder" className="text-gray-500 text-center italic">Start a conversation with AI Khalasi...</p>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-xl shadow-md ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} ai-chat-message ${msg.isThinking ? 'animate-pulse' : ''}`}>
                <p>{msg.text}</p>
                <span className="text-xs opacity-75 mt-1 block text-right">
                  {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={chatMessagesEndRef} /> {/* Scroll target */}
      </div>
      <div className="flex">
        <input
          type="text"
          id="ai-khalasi-input"
          placeholder={isAuthenticated ? "Type your question for AI Khalasi..." : "Login to chat with AI Khalasi"}
          className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all search-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter' && !isLoadingAI) handleAiKhalasiSubmit(); }}
          disabled={isLoadingAI || !isAuthenticated}
        />
        <button
          id="ai-khalasi-submit"
          className={`bg-blue-600 text-white p-3 rounded-r-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 btn-primary flex items-center justify-center ${isLoadingAI || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleAiKhalasiSubmit}
          disabled={isLoadingAI || !isAuthenticated}
        >
          <span className="material-icons">send</span>
        </button>
      </div>
      {!isAuthenticated && (
        <p className="text-red-500 text-center mt-4">Please log in to use AI Khalasi features.</p>
      )}
    </section>
  );
};

export default AIKhalasi;