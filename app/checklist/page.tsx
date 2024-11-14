"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState } from "@/store";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Building Check-In";

export default function Checklist() {
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
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center text-xl font-bold text-slate-800 hover:text-slate-600 transition-colors"
            >
              {APP_NAME}
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600 font-medium">{user.email}</span>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Back to Check-In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-8 px-4 pb-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-8">
            Check-In/Out Records
          </h1>

          {/* Recent Activity */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Recent Activity
              </h2>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600">No recent check-in/out records</p>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Today's Check-ins
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    Currently Inside
                  </h3>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                  <h3 className="text-sm font-medium text-purple-800 mb-2">
                    Total Records
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">0</p>
                </div>
              </div>
            </div>

            {/* User List */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Currently Inside
              </h2>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-600">No users currently inside</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
