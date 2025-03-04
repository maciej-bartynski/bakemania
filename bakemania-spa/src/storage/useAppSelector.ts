import { useSelector } from "react-redux";
import { RootState } from "./store";

type AnySelector = (state: RootState) => RootState[keyof RootState];

const useAppSelector = (selector: AnySelector): ReturnType<typeof selector> => {
    return useSelector<RootState>(selector) as ReturnType<typeof selector>;
}

export default useAppSelector;