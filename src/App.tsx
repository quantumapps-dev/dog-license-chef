import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { DogRegistration } from "./DogRegistration";
import { DogDashboard } from "./DogDashboard";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-blue-600">🐕 Franklin County Dog Licensing</h2>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [currentView, setCurrentView] = useState<"dashboard" | "register">("dashboard");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Unauthenticated>
        <div className="max-w-md mx-auto mt-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Franklin County Dog Licensing
            </h1>
            <p className="text-gray-600">
              Register and manage your dog licenses online
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Franklin County Dog Licensing
          </h1>
          <p className="text-gray-600 mb-6">
            Manage your dog registrations and licenses
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              My Dogs
            </button>
            <button
              onClick={() => setCurrentView("register")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === "register"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Register New Dog
            </button>
          </div>
        </div>

        {currentView === "dashboard" && <DogDashboard />}
        {currentView === "register" && (
          <DogRegistration onSuccess={() => setCurrentView("dashboard")} />
        )}
      </Authenticated>
    </div>
  );
}
