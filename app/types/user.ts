export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    status: boolean;
    company?: string;
}

export interface ProductionCompany {
    _id: string;
    name: string;
    logo?: string;
    description?: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    users: UserProfile[];
} 