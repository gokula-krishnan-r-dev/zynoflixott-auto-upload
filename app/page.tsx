import { Suspense } from "react";
import DashboardContent from "./components/DashboardContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ZynoFlix Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your video content with YouTube automation
          </p>
        </div>
        
        <Suspense fallback={<div className="text-center p-10">Loading dashboard...</div>}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
