import { useCallback, useEffect, useRef } from "react";

function useDebouncedCallback(callback: (() => void), delay: number): (() => void) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            callback();
        }, delay);
    }, [callback, delay]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}



export default useDebouncedCallback;