import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GuidelinePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto p-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Generator
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Getting Started with AI Art Creation
          </h1>

          {/* Steps Container */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="relative pl-10 border-l-2 border-blue-100 pb-12">
              <div className="absolute -left-3 top-0 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Writing Your First Prompt</h2>
                <p className="text-gray-700 mb-4">
                  Let's start with a simple prompt to help you understand how the AI generates images. 
                  Try this example:
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-100 mb-4">
                  <code className="text-blue-600">
                    "Generate an image of a cat in a comic-book style of art"
                  </code>
                </div>
                <p className="text-sm text-gray-600">
                  The AI will interpret your written instructions and create an image accordingly.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-10 border-l-2 border-purple-100 pb-12">
              <div className="absolute -left-3 top-0 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-purple-900 mb-4">Multiple Generations</h2>
                <p className="text-gray-700 mb-4">
                  You can generate as many images as you'd like! Each prompt should be complete and detailed. Try this example:
                </p>
                <div className="bg-white rounded-lg p-4 border border-purple-100 mb-4">
                  <code className="text-purple-600">
                    "Generate an image of a rabbit in an abstract style of art"
                  </code>
                </div>
                <div className="bg-purple-100 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-purple-900 mb-2">Pro Tips:</h3>
                  <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                    <li>Be specific with your descriptions</li>
                    <li>Include style preferences</li>
                    <li>Mention colors or moods you want to see</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-10 border-l-2 border-green-100 pb-12">
              <div className="absolute -left-3 top-0 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4">Managing Your Creations</h2>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <h3 className="font-medium text-green-900 mb-2">Navigation:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                      <li>Use the arrow buttons beside images to browse your generations</li>
                      <li>Your generation history appears in the sidebar</li>
                      <li>Click on any previous generation to view it in full size</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <h3 className="font-medium text-green-900 mb-2">Submitting Your Work:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                      <li>Download your favorite generations</li>
                      <li>All your generations are automatically saved</li>
                      <li>Access your full history anytime from the sidebar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Features and Limitations */}
            <div className="relative pl-10 border-l-2 border-yellow-100 pb-12">
              <div className="absolute -left-3 top-0 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              <div className="bg-yellow-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-yellow-900 mb-4">Important Features & Guidelines</h2>
                
                {/* Conversational Context */}
                <div className="bg-white rounded-lg p-4 border border-yellow-100 mb-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Smart Memory Feature</h3>
                  <p className="text-gray-700 mb-2">
                    Our AI remembers your previous generations in a session! This means:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Each new prompt builds on your previous artwork style</li>
                    <li>The AI trys to maintain consistency across multiple generations[this is not perfect]. So be sure to give your full prompt and reupload if you feel its answers are continually veering off from the idea</li>
                    <li>Your creative journey flows more naturally</li>
                  </ul>
                </div>

                {/* Content Guidelines */}
                <div className="bg-white rounded-lg p-4 border border-yellow-100 mb-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Content Guidelines</h3>
                  <p className="text-gray-700 mb-2">
                    The AI may reject certain types of prompts. For example:
                  </p>
                  <div className="bg-red-50 rounded p-3 text-sm text-red-600 mb-2">
                    "I apologize, but I cannot generate that type of content. Please ensure your request follows our content guidelines."
                  </div>
                  <p className="text-sm text-gray-600">
                    Keep your prompts focused on creative, appropriate content that's suitable for all audiences.
                  </p>
                </div>

                {/* Category Specific Rules */}
                <div className="bg-white rounded-lg p-4 border border-yellow-100">
                  <h3 className="font-medium text-yellow-900 mb-2">Category-Specific Features</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded p-3">
                      <span className="font-medium text-blue-800">AI-Only Category:</span>
                      <ul className="list-disc list-inside text-sm text-blue-700 mt-1">
                        <li>Pure AI-generated artwork only</li>
                        <li>No image uploads permitted</li>
                        <li>Focus on prompt crafting</li>
                        <li>Image uploads must be less than 4MB</li>
                        <li>If your upload gets an error, just reupload another Image</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 rounded p-3">
                      <span className="font-medium text-purple-800">AI-Involved Category:</span>
                      <ul className="list-disc list-inside text-sm text-purple-700 mt-1">
                        <li>Can upload reference images</li>
                        <li>Blend AI with your own visuals</li>
                        <li>More flexibility in creation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ready to Start Button */}
          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ready to Create
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinePage;