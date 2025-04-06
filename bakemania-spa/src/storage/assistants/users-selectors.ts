import { RootState } from "../store";
import useAppSelector from "../useAppSelector";
import { AssistantsState } from "./users-types";

const assistantsSelector = (rootState: RootState) => rootState.assistants;

const useAssistantsSelector = () => useAppSelector(assistantsSelector) as AssistantsState;

export default useAssistantsSelector;