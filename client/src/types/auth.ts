export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    pictureUrl: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
    isActive: boolean;
}
