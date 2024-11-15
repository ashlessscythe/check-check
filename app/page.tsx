"use client";

import { useState, useEffect, useRef } from "react";
import { LoginModal } from "./components/login-modal";
import { useAutoFocus } from "./hooks/useAutoFocus";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./store/store";
import type { RootState } from "./store/store";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Building Check-In";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [message, setMessage] = useState("Please scan your barcode");
  const inputRef = useAutoFocus<HTMLInputElement>({ disabled: showLoginModal });
  const clearTimerRef = useRef<NodeJS.Timeout>();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (barcodeInput) {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
      clearTimerRef.current = setTimeout(() => {
        setBarcodeInput("");
      }, 2000);

      return () => {
        if (clearTimerRef.current) {
          clearTimeout(clearTimerRef.current);
        }
      };
    }
  }, [barcodeInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput) {
      console.log("Barcode submitted:", barcodeInput);
      setBarcodeInput("");
      setMessage("Processing...");
      setTimeout(() => {
        setMessage("Please scan your barcode");
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      dispatch(logout());
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center text-xl font-bold text-slate-800 hover:text-slate-600 transition-colors"
            >
              {APP_NAME}
            </button>
            <button
              onClick={handleAuthAction}
              className={`inline-flex items-center px-4 py-2 my-3 border border-transparent text-sm font-medium rounded-md transition-colors ${
                isAuthenticated
                  ? "text-white bg-red-600 hover:bg-red-700"
                  : "text-gray-700 bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {isAuthenticated ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto mt-10 px-4">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-center text-2xl font-bold text-slate-800 mb-8">
            {message}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                ref={inputRef}
                type="password"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="block w-full px-4 py-3 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Scan barcode"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </main>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
