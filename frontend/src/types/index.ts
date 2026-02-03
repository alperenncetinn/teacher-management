export interface User {
    id: number;
    email: string;
    fullName: string;
    role: 'Admin' | 'Teacher' | 'CompanyUser' | 'Student' | 'Parent';
}

export interface Student {
    id: number;
    schoolNumber: string;
    fieldOfStudy: string;
    subField: string;
    className: string;
    user: User;
    hasInsuranceDocument: boolean;
    schoolDays: number[];
    internshipScore?: number;
}

export interface Company {
    id: number;
    name: string;
    address: string;
    acceptedFields: string[]; // or JSON string
    operatingDays: number[];
    quota: number;
    averageRating?: number;
    ratingCount?: number;
}

export interface Placement {
    id: number;
    studentId: number;
    student?: Student;
    companyId: number;
    company?: Company;
    teacherId: number;
    teacher?: User;
    startDate: string;
    endDate: string;
    internDays: number[];
    studentRating?: number;
    studentComment?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const DAYS_OF_WEEK = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
];
