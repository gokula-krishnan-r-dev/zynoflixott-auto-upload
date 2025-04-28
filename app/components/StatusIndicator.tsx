'use client';

import { motion } from 'framer-motion';

interface StatusIndicatorProps {
  status: string;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="my-4 p-4 bg-blue-50 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm"
    >
      <div className="flex items-center">
        <div className="mr-3 flex-shrink-0">
          <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Processing</h3>
          <motion.div 
            key={status}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-1 text-sm text-blue-700 dark:text-blue-400"
          >
            {status}
          </motion.div>
        </div>
      </div>
      <div className="mt-3">
        <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '5%' }}
            animate={{ 
              width: ['5%', '95%'],
              transition: { duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
            }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
} 