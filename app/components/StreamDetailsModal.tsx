'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LiveStream } from '../types/livestream';

interface StreamDetailsModalProps {
    stream: LiveStream | null;
    onClose: () => void;
}

export default function StreamDetailsModal({ stream, onClose }: StreamDetailsModalProps) {
    if (!stream) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                >
                    <div className="relative">
                        <div className="aspect-video w-full bg-gray-900">
                            {stream.movieTrailer && (
                                <video
                                    src={stream.movieTrailer}
                                    poster={stream.moviePoster}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-colors duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stream.movieTitle}
                                </h2>
                                <p className="mt-1 text-gray-500 dark:text-gray-400">
                                    {stream.movieSubtitles}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stream.status === 'live'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : stream.status === 'upcoming'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                    {stream.status.toUpperCase()}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                    {stream.movieCertificate}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Movie Details</h3>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Category:</span> {stream.movieCategory}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Language:</span> {stream.movieLanguage}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Duration:</span> {stream.movieLength} minutes
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cast & Crew</h3>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Producer:</span> {stream.producerName}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Director:</span> {stream.directorName}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Hero:</span> {stream.heroName}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Heroine:</span> {stream.heroinName}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Streaming Info</h3>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Date:</span> {new Date(stream.streamingDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Time:</span> {stream.streamingTime}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Ticket Cost:</span> ${stream.ticketCost}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Statistics</h3>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Tickets Sold:</span> {stream.ticketsSold}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            <span className="font-medium">Views:</span> {stream.viewCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                            <p className="mt-2 text-gray-900 dark:text-white">
                                {stream.movieDescription}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
} 