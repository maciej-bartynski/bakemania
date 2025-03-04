import { RootState } from "../store";
import useAppSelector from "../useAppSelector";
import { AppConfigState } from "./appConfig-types";

const appConfigSelector = (rootState: RootState) => rootState.appConfig;

const useAppConfigSelector = () => useAppSelector(appConfigSelector) as AppConfigState;

export default useAppConfigSelector;