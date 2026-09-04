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
    flash: { success?: string | null };
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

export interface FormFieldOption {
    value: string;
    label: string;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'number';
    optional?: boolean;
    placeholder?: string;
    options?: FormFieldOption[];
    allowOther?: boolean;
    suffix?: string;
}

export interface FormStepDefinition {
    number: number;
    name: string;
    description: string;
    icon: string;
    fields: FormField[];
}

export type FormStepValues = Record<string, string>;

export interface FormSubmissionData {
    current_step: number;
    is_complete: boolean;
    steps: Record<string, FormStepValues>;
}
