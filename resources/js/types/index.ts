import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'date' | 'textarea';
    optional?: boolean;
    placeholder?: string;
}

export interface FormStepDefinition {
    number: number;
    name: string;
    description: string;
    fields: FormField[];
}

export type FormStepValues = Record<string, string>;

export interface FormSubmissionData {
    current_step: number;
    is_complete: boolean;
    steps: Record<string, FormStepValues>;
}
