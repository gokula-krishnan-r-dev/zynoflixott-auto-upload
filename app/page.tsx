import { Suspense } from "react";
import dynamic from "next/dynamic";
import ThemeToggle from "./components/ThemeToggle";

// Dynamically import DashboardContent with loading fallback
const DynamicDashboardContent = dynamic(() => import("./components/DashboardContent"), {
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="relative p-4 sm:p-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="mx-auto max-w-7xl mb-8 pt-10 animate-fadeIn">
          <div className="flex flex-col items-center sm:items-start mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 pb-2">
              ZynoFlix Admin
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300 text-center sm:text-left">
              Manage your video content with YouTube automation
            </p>
            <div className="h-1 w-24 mt-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>
          
          <Suspense fallback={
            <div className="text-center p-10 animate-pulse">
              <div className="w-12 h-12 mx-auto rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
            </div>
          }>
            <DynamicDashboardContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
