/**
 * i18n Types
 * 
 * Type definitions for the internationalization system.
 */

export type Language = 'en' | 'es';

export interface TranslationKeys {
    common: {
        close: string;
        cancel: string;
        save: string;
        loading: string;
        error: string;
        success: string;
        refresh: string;
        delete: string;
        edit: string;
        create: string;
        search: string;
        noResults: string;
    };
    nav: {
        inbox: string;
        agenda: string;
        tasks: string;
        settings: string;
    };
    inbox: {
        title: string;
        empty: string;
        summaries: string;
        archived: string;
        markedRead: string;
        taskCreated: string;
    };
    agenda: {
        title: string;
        noEvents: string;
        allDay: string;
    };
    tasks: {
        title: string;
        noTasks: string;
        completed: string;
        addTask: string;
        taskPlaceholder: string;
    };
    plan: {
        title: string;
        greeting: {
            morning: string;
            afternoon: string;
            evening: string;
            night: string;
        };
        generating: string;
        regenerate: string;
    };
    summary: {
        title: string;
        generating: string;
        analyzing: string;
        extracting: string;
        summaryLabel: string;
        actionItems: string;
        keyInfo: string;
        priority: string;
        people: string;
        companies: string;
        dates: string;
        amounts: string;
        cached: string;
        limitReached: string;
    };
    settings: {
        title: string;
        language: {
            title: string;
            description: string;
        };
        theme: {
            title: string;
            description: string;
        };
        subscription: {
            title: string;
            currentPlan: string;
            upgrade: string;
        };
        notifications: {
            title: string;
            enable: string;
        };
        about: {
            title: string;
            version: string;
            checkUpdates: string;
        };
    };
    auth: {
        signIn: string;
        signOut: string;
        signInWith: string;
        connecting: string;
    };
}

export type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;
