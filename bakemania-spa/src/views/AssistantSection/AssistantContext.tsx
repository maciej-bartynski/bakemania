import { createContext, useContext } from "react";

type OpenedSection = {
    title: 'home' | 'settings' | 'card-details' | 'card-list',
    details?: undefined | {
        cardId: string,
        variant: 'spend' | 'earn'
    }
} & (
        {
            title: 'home' | 'settings' | 'card-list',
            details?: undefined
        } | {
            title: 'card-details',
            details: {
                cardId: string,
                userId: string,
                assistantId: string,
                variant: 'spend' | 'earn'
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