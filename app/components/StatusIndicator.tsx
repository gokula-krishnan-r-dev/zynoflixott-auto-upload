'use client';

interface StatusIndicatorProps {
  status: string;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <div className="my-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
      <div className="flex items-center">
        <div className="mr-3 flex-shrink-0">
          <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Processing</h3>
          <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
            {status}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 