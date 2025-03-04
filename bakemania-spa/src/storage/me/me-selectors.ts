import { RootState } from "../store";
import useAppSelector from "../useAppSelector";
import { MeState } from "./me-types";

const meSelector = (rootState: RootState) => rootState.me;

const useMeSelector = () => useAppSelector(meSelector) as MeState;

export default useMeSelector;