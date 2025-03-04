import { RootState } from "../store";
import useAppSelector from "../useAppSelector";
import { UsersState } from "./users-types";

const usersSelector = (rootState: RootState) => rootState.users;

const useUsersSelector = () => useAppSelector(usersSelector) as UsersState;

export default useUsersSelector;