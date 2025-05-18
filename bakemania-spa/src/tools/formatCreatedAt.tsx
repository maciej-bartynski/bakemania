const formatReadbleDateToOperationalDate = (inputDate: string) => {
    // input format 16.05.2025 13:00:05, output format 2025-05-16T13:00:05.000Z
    const [date, time] = inputDate.split(' ');
    const [day, month, year] = date.split('.');
    return `${year}-${month}-${day}T${time}`;
}

const sortByDateDesc = <T extends { createdAt: string }>(array: T[]) => {
    const copy = [...array];
    copy.sort((entryA, entryB) => {
        const entryADate = formatReadbleDateToOperationalDate(entryA.createdAt)
        const entryBDate = formatReadbleDateToOperationalDate(entryB.createdAt)
        const timestampA = new Date(entryADate).getTime();
        const timestampB = new Date(entryBDate).getTime();
        return timestampB - timestampA;
    });
    return copy;
};

const findLastHistoryEntry = <T extends { createdAt: string }>(array: T[]): T | undefined => {
    const copy = [...array];
    const sorted = sortByDateDesc(copy);
    return sorted[0];
};

export default {
    formatReadbleDateToOperationalDate,
    sortByDateDesc,
    findLastHistoryEntry
}