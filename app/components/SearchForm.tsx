'use client';

import { useState } from 'react';

interface SearchFormProps {
  onSearch: (query: string, limit: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  isLoading: boolean;
}

export default function SearchForm({ 
  onSearch, 
  searchQuery, 
  setSearchQuery, 
  limit, 
  setLimit, 
  isLoading 
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
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search YouTube Videos
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            id="search"
            placeholder="Enter search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            required
            disabled={isLoading}
          />
          
          <div className="flex items-center">
            <label htmlFor="limit" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Limit:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {[1, 5, 10, 15, 20].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Search for YouTube videos to download and add to your collection.
        </p>
      </div>
    </form>
  );
} 