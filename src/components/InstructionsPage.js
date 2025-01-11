import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const InstructionsPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar structure remains the same */}
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
            {/* Add Back Button */}
            <div className="mb-6">
            <Link to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Generator
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              AI Art Study - Instructions & Guidelines
            </h1>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  About the Study
                </h2>
                <p className="text-gray-700 mb-4">
                  This research explores perceptions of AI-generated art with a focus on ownership, authorship, and value. 
                  The study aims to understand how different stakeholders view AI-generated artwork to help inform future 
                  policies and creative practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Participation Options & Rewards
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Creator Participants</h3>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li>Submit original artwork using our AI tools</li>
                    <li>Complete a 15-minute submission survey</li>
                    <li>Base compensation: $10 gift card</li>
                    <li>Top 10 artworks: Additional $90 ($100 total)</li>
                    <li>Category winners: Additional $150 ($250 total)</li>
                  </ul>

                  <h3 className="font-semibold mb-2">Evaluator Participants</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Review submitted artworks</li>
                    <li>Complete a 30-minute evaluation survey</li>
                    <li>Compensation: $15</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  How to Participate
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">For Creators:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Sign up using the registration form</li>
                      <li>Create your artwork using our AI interface (DALL-E or Midjourney)</li>
                      <li>Submit your work through the provided submission form</li>
                      <li>Complete the artwork evaluation survey</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">For Evaluators:</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Sign up using the registration form</li>
                      <li>Receive email with evaluation survey link</li>
                      <li>Review and evaluate assigned artworks</li>
                      <li>Complete the evaluation survey</li>
                    </ol>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Rules and Guidelines
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Participants must be 18 years or older</li>
                  <li>All submissions must be original work created through our platform</li>
                  <li>Creators can submit under two categories: AI-only or AI-involved</li>
                  <li>Top rated artworks will be displayed in the Georgetown University Community Gallery</li>
                  <li>All data collected will be used for research purposes only</li>
                  <li>Participants can withdraw at any time before survey submission</li>
                </ul>
              </section>

              <section className="bg-yellow-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Important Notes
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All responses are confidential and will be de-identified</li>
                  <li>The study is completely voluntary</li>
                  <li>No prior experience with AI art is required</li>
                  <li>Exhibition details will be communicated to selected participants</li>
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