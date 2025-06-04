'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, ProductionCompany } from '../types/user';
import { LiveStream } from '../types/livestream';
import StreamDetailsModal from './StreamDetailsModal';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<ProductionCompany[]>([]);
    const [streams, setStreams] = useState<LiveStream[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'companies' | 'streams'>('users');
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [usersResponse, companiesResponse, streamsResponse] = await Promise.all([
                    fetch('/api/db/users?type=all'),
                    fetch('/api/db/users?type=companies'),
                    fetch('/api/db/livestreams')
                ]);

                if (!usersResponse.ok || !companiesResponse.ok || !streamsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [usersData, companiesData, streamsData] = await Promise.all([
                    usersResponse.json(),
                    companiesResponse.json(),
                    streamsResponse.json()
                ]);

                if (usersData.users) {
                    setUsers(usersData.users);
                }

                if (companiesData.companies) {
                    setCompanies(companiesData.companies);
                }

                if (streamsData.livestreams) {
                    setStreams(streamsData.livestreams);
                }
            } catch (err) {
                setError((err as Error).message || 'An error occurred while fetching data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleUserExpansion = (userId: string) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    User Management
                </motion.h2>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user data...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors duration-300 relative ${activeTab === 'users'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab('users')}
                            >
                                User Profiles {users.length > 0 && `(${users.length})`}
                                {activeTab === 'users' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                                    />
                                )}
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors duration-300 relative ${activeTab === 'companies'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab('companies')}
                            >
                                Production Companies {companies.length > 0 && `(${companies.length})`}
                                {activeTab === 'companies' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                                    />
                                )}
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors duration-300 relative ${activeTab === 'streams'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => setActiveTab('streams')}
                            >
                                Live Streams {streams.length > 0 && `(${streams.length})`}
                                {activeTab === 'streams' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                                    />
                                )}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'users' ? (
                                <motion.div
                                    key="users"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {users.length === 0 ? (
                                        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                            No user profiles found.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {users.map((user, index) => (
                                                <motion.div
                                                    key={user._id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    whileHover={{ y: -5 }}
                                                    className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="relative">
                                                        <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-purple-600 relative">
                                                            {user.backgroundPic && (
                                                                <img
                                                                    src={user.backgroundPic}
                                                                    alt="Background"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-6 left-4">
                                                            <div className="ring-4 ring-white dark:ring-gray-800 rounded-full">
                                                                {user.profilePic ? (
                                                                    <img
                                                                        src={user.profilePic}
                                                                        alt={user.full_name}
                                                                        className="w-16 h-16 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                                        <span className="text-blue-600 dark:text-blue-300 text-xl font-semibold">
                                                                            {user.full_name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-5 pt-8">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                    {user.full_name}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {user.email}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                                <span className={`mt-1 px-2 py-1 rounded-full text-xs ${user.isMembership ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}>
                                                                    {user.membership || 'Free'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="text-center">
                                                                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{user.followingId?.length || 0}</span>
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Following</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => toggleUserExpansion(user._id)}
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                                                            >
                                                                {expandedUser === user._id ? 'Show Less' : 'Show More'}
                                                            </button>
                                                        </div>

                                                        <AnimatePresence>
                                                            {expandedUser === user._id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                                                                >
                                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">About</h4>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                                                                        {user.description || 'No description available'}
                                                                    </p>
                                                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                                        <div>
                                                                            <span className="block text-gray-500 dark:text-gray-400">Joined</span>
                                                                            <span className="block text-gray-900 dark:text-white font-medium">
                                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="block text-gray-500 dark:text-gray-400">Last Updated</span>
                                                                            <span className="block text-gray-900 dark:text-white font-medium">
                                                                                {new Date(user.updatedAt).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ) : activeTab === 'companies' ? (
                                <motion.div
                                    key="companies"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {companies.length === 0 ? (
                                        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                            No production companies found.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {companies.map((company, index) => (
                                                <motion.div
                                                    key={company._id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    whileHover={{ y: -5 }}
                                                    className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="p-5">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex-shrink-0">
                                                                {company.logo ? (
                                                                    <img
                                                                        src={company.logo}
                                                                        alt={company.name}
                                                                        className="w-16 h-16 rounded-lg object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                                        <span className="text-purple-600 dark:text-purple-300 text-lg font-semibold">
                                                                            {company.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                    {company.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    {company.description || 'No description available'}
                                                                </p>
                                                                <div className="mt-2 flex items-center">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                                                        {company.users?.length || 0} Users
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                                                            <span>Created: {new Date(company.createdAt).toLocaleDateString()}</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs ${company.status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                                {company.status ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="streams"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {streams.length === 0 ? (
                                        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                            No live streams found.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {streams.map((stream, index) => (
                                                <motion.div
                                                    key={stream._id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    whileHover={{ y: -5 }}
                                                    onClick={() => setSelectedStream(stream)}
                                                    className="group cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="aspect-video relative">
                                                        <img
                                                            src={stream.moviePoster}
                                                            alt={stream.movieTitle}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <div className="absolute bottom-4 left-4 right-4">
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stream.status === 'live'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : stream.status === 'upcoming'
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {stream.status.toUpperCase()}
                                                                    </span>
                                                                    <span className="text-white text-sm">
                                                                        {stream.movieLength} mins
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                            {stream.movieTitle}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                            {stream.movieDescription}
                                                        </p>
                                                        <div className="mt-3 flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    ${stream.ticketCost}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {stream.movieLanguage}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {new Date(stream.streamingDate).toLocaleDateString()}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {stream.streamingTime}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>

            {selectedStream && (
                <StreamDetailsModal
                    stream={selectedStream}
                    onClose={() => setSelectedStream(null)}
                />
            )}
        </motion.div>
    );
} 