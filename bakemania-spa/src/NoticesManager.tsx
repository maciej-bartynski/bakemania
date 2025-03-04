import { FC } from "react";
import Notice from "./atoms/Notice/Notice";
import useNoticesSelector from "./storage/notices/notices-selectors";
import { noticesStore } from "./storage/notices-store";
import noticesSlice from "./storage/notices/notices-reducer";

const NoticesManager: FC = () => {
    const noticesStorage = useNoticesSelector();

    return (
        <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
        }}>
            {noticesStorage.notices.map(notice => {
                return (
                    <Notice
                        key={notice._id}
                        onClick={() => {
                            noticesStore.dispatch(noticesSlice.actions.deleteNotice(notice._id));
                        }}
                    >
                        {notice.body}
                    </Notice>
                )
            })}
        </div>
    )
}

export default NoticesManager;