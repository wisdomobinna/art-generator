import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
const InstructionsPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Generator
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              AI Art Competition - Guidelines
            </h1>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  About the Competition
                </h2>
                <p className="text-gray-700 mb-4">
                  Welcome to our AI Art Competition! This innovative competition showcases the creative 
                  possibilities of AI-generated artwork. Artists can participate in two categories: 
                  AI-only creations or AI-involved collaborations, competing for prizes and the opportunity 
                  to have their work displayed at the Georgetown University Community Gallery.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Prizes & Recognition
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Award Structure</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Participation Award: $15 gift card for all valid submissions</li>
                    <li>Top 12 Artworks: Additional $100 prize ($115 total)</li>
                    <li>Category Winners: Additional $150 prize ($250 total)</li>
                    <li>Gallery Exhibition: Selected works will be displayed at Georgetown University</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  How to Participate
                </h2>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Competition Process:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Choose your category: AI-only or AI-involved</li>
                    <li>Create your artwork using our AI tools (DALL-E)</li>
                    <li>Submit your final piece through the platform</li>
                    <li>Provide a brief description of your creative process</li>
                  </ol>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Categories & Guidelines
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">AI-Only Category:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Create artwork using only AI prompts</li>
                      <li>Focus on creative prompt engineering</li>
                      <li>No external image uploads allowed</li>
                      <li>Multiple submissions permitted</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">AI-Involved Category:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Combine AI generation with uploaded images</li>
                      <li>Create hybrid artworks using both AI and traditional methods</li>
                      <li>Document your creative process</li>
                      <li>Multiple submissions permitted</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-yellow-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Competition Rules
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All submissions must be original work created through our platform</li>
                  <li>Participants must be 18 years or older</li>
                  <li>Artwork must not contain inappropriate or offensive content</li>
                  <li>Winners will be selected based on creativity, technical execution, and artistic merit</li>
                  <li>Submission deadline: February 25, 2025</li>
                  <li>Exhibition would hold on April 8, 2025</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;