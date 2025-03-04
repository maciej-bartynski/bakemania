import { useSelector } from "react-redux";
import { NoticesState } from "./notices-types";
import { NoticesStoreState } from "../notices-store";

const noticesSelector = (noticesStore: NoticesStoreState) => noticesStore.notices;

const useNoticesSelector = () => useSelector(noticesSelector) as NoticesState;

export default useNoticesSelector;