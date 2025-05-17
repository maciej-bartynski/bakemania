import { FC, useEffect } from "react";
import Notice from "./atoms/Notice/Notice";
import useNoticesSelector from "./storage/notices/notices-selectors";
import { noticesStore } from "./storage/notices-store";
import noticesSlice from "./storage/notices/notices-reducer";
import { useDispatch } from "react-redux";

const TIMER_DICT: Record<string, NodeJS.Timeout> = {};

const NoticesManager: FC = () => {
    const noticesStorage = useNoticesSelector();

    const noticesDispatch = useDispatch();

    useEffect(() => {
        Object.entries(TIMER_DICT).forEach(([id, timer]) => {
            if (!noticesStorage.notices.some(notice => notice._id === id)) {
                clearTimeout(timer);
                delete TIMER_DICT[id];
            }
        });

        noticesStorage.notices.map((notice) => {
            const id = notice._id;
            if (!TIMER_DICT[id]) {
                TIMER_DICT[id] = setTimeout(() => {
                    try {
                        noticesDispatch(noticesSlice.actions.deleteNotice(id));
                        delete TIMER_DICT[id];
                    } catch {
                        /**
                         * Ignore
                         */
                    }
                }, 5000);
            }
        });
    }, [noticesStorage, noticesDispatch]);

    useEffect(() => {
        return () => {
            Object.entries(TIMER_DICT).forEach(([id, timer]) => {
                clearTimeout(timer);
                delete TIMER_DICT[id];
            });
        };
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                top: 10,
                right: 10,
                left: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 10,
            }}
        >
            {noticesStorage.notices.map(notice => {
                return (
                    <Notice
                        key={notice._id}
                        onClick={() => {
                            noticesStore.dispatch(noticesSlice.actions.deleteNotice(notice._id));
                            clearTimeout(TIMER_DICT[notice._id]);
                            delete TIMER_DICT[notice._id];
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