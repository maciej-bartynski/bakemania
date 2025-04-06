import { FC, useState } from "react";
import './Pagination.css';

const Pagination: FC<{
    page: number;
    size: number;
    hasMore: boolean;
    onPageChange: (nextPage: number) => Promise<void>
}> = ({
    page,
    hasMore,
    onPageChange
}) => {

        const [loading, setLoading] = useState(false);
        return (
            <div className='pagination'>
                {page > 1 && <button
                    className='secondary'
                    disabled={loading}
                    onClick={async () => {
                        setLoading(true);
                        await onPageChange(-1);
                        setLoading(false);
                    }}
                >Wróć</button>}
                <span>
                    Strona <strong>{page}</strong>
                </span>
                {hasMore && <button
                    className='secondary'
                    disabled={loading}
                    onClick={async () => {
                        setLoading(true);
                        await onPageChange(1);
                        setLoading(false);
                    }}
                >Dalej</button>}
            </div>
        );
    };

export default Pagination;