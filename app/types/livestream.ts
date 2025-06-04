export interface LiveStream {
    _id: string;
    userId: string;
    producerName: string;
    directorName: string;
    heroName: string;
    heroinName: string;
    movieTitle: string;
    movieSubtitles: string;
    movieCategory: string;
    movieDescription: string;
    movieTrailer: string;
    moviePoster: string;
    movieVideo: string;
    movieLength: number;
    movieCertificate: string;
    movieLanguage: string;
    streamingDate: string;
    streamingTime: string;
    ticketCost: number;
    paymentId: string;
    orderId: string;
    status: 'live' | 'upcoming' | 'ended';
    ticketsSold: number;
    viewCount: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
} 