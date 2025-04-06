import { createContext, useContext } from "react";

type OpenedSection = {
    title: 'home' | 'settings' | 'card-details' | 'card-list' | 'manage' | 'history',
    details?: undefined | {
        cardId: string,
        variant: 'spend' | 'earn' | 'delete' | 'earn-for-amount'
    } | {
        userId: string,
    }
} & (
        {
            title: 'home' | 'settings' | 'card-list' | 'manage',
            details?: undefined
        } | {
            title: 'card-details',
            details: {
                cardId: string,
                userId: string,
                assistantId: string,
                variant: 'spend' | 'earn' | 'delete' | 'earn-for-amount'
            }
        } | {
            title: 'history',
            details: {
                userId: string,
            }
        }
    )

type AssistantContextType = {
    assistantId: string,
    openedSection: OpenedSection
};

const initialAssistantContext: AssistantContextType = {
    assistantId: 'assistant-id',
    openedSection: {
        title: 'home',
    },
};


const AssistantContext = createContext<AssistantContextType>(initialAssistantContext);

const useAssistantContext = () => useContext(AssistantContext);

export type {
    AssistantContextType,
    OpenedSection
}

export default {
    use: useAssistantContext,
    Provider: AssistantContext.Provider
}