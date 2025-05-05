'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchFormProps {
  onSearch: (query: string, limit: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  isLoading: boolean;
  setLanguage: (language: string) => void;
  language: string;
}

export default function SearchForm({ 
  onSearch, 
  searchQuery, 
  setSearchQuery, 
  limit, 
  setLimit, 
  isLoading,
  setLanguage,
  language 
}: SearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery, limit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <motion.label 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          htmlFor="search" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search YouTube Videos
        </motion.label>
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-grow relative"
          >
            <input
              type="text"
              id="search"
              placeholder="Enter search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 pl-10 pr-3 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center"
          >
            <label htmlFor="limit" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Limit:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              disabled={isLoading}
            >
              {[1, 5, 10, 15, 20].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              disabled={isLoading}
            >
                   {/* Indian Languages */}
                   <option value="hindi">Hindi</option>
              <option value="tamil">Tamil</option>
              <option value="telugu">Telugu</option>
              <option value="malayalam">Malayalam</option>
              <option value="kannada">Kannada</option>
              <option value="bengali">Bengali</option>
              <option value="marathi">Marathi</option>
              <option value="punjabi">Punjabi</option>
              <option value="gujarati">Gujarati</option>
              <option value="odia">Odia</option>
              <option value="urdu">Urdu</option>
              {/* Global Languages */}
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="italian">Italian</option>
              <option value="portuguese">Portuguese</option>
              <option value="russian">Russian</option>
              <option value="japanese">Japanese</option>
              <option value="chinese">Chinese (Mandarin)</option>
              <option value="arabic">Arabic</option>
              <option value="korean">Korean</option>
              
         
            </select>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className={`w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-6 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm ${
                isLoading || !searchQuery.trim() ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </motion.button>
          </motion.div>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-2 text-xs text-gray-500 dark:text-gray-400"
        >
          Search for YouTube videos to download and add to your collection.
        </motion.p>
      </div>
    </form>
  );
} 