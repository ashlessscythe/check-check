"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RootState } from "@/store";

export default function Dashboard() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Check In/Out Card */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                  Check In
                </button>
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                  Check Out
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                Current Status
              </h2>
              <p className="text-green-700">Not Checked In</p>
            </div>

            {/* History Card */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-2">
                <p className="text-blue-700">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
