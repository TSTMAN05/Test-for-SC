import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Shield, User, Check, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { setUserRoleInstructions, isUserSuperAdmin } from '../lib/clerk';
import Footer from '../components/Footer';

const AdminSetupPage = () => {
  const { user, isSignedIn } = useUser();
  const [copiedUserId, setCopiedUserId] = useState(false);

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600">You must be signed in to set up admin roles.</p>
        </div>
      </div>
    );
  }

  const instructions = setUserRoleInstructions(user?.id || '', 'super_admin');
  const currentlyAdmin = isUserSuperAdmin(user);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup</h1>
            <p className="text-gray-600">Set up your super admin role using Clerk Dashboard</p>
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 text-gray-600 mr-2" />
              Current Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Admin Status:</span>
                <div className="flex items-center space-x-2">
                  {currentlyAdmin ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Super Admin</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium text-orange-600">Regular User</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.emailAddresses[0]?.emailAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">User ID:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded max-w-xs truncate">
                    {user?.id}
                  </span>
                  <button
                    onClick={handleCopyUserId}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    title="Copy User ID"
                  >
                    {copiedUserId ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">{instructions.message}</h3>
            <div className="space-y-3">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {step.includes('{ "role": "super_admin" }') ? (
                      <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">
                        {step.replace('   ', '')}
                      </code>
                    ) : (
                      step
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Open Clerk Dashboard</span>
            </a>
            <button
              onClick={handleCopyUserId}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {copiedUserId ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>User ID Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  <span>Copy User ID</span>
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {currentlyAdmin && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  You already have super admin access! You can now access the admin panel.
                </span>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">Important Notes</h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>• Role changes in Clerk may take a few minutes to propagate</p>
              <p>• You may need to refresh the page or sign out/in after setting the role</p>
              <p>• Only users with the "super_admin" role can access the admin panel</p>
              <p>• The role is stored securely in Clerk's user metadata</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center space-x-4">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              ← Back to Home
            </a>
            <a
              href="/admin"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Go to Admin Panel →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminSetupPage;