const formatReadbleDateToOperationalDate = (inputDate: string) => {
    // input format 16.05.2025 13:00:05, output format 2025-05-16T13:00:05.000Z
    const [date, time] = inputDate.split(' ');
    const [day, month, year] = date.split('.');
    return `${year}-${month}-${day}T${time}`;
}

const sortByDateDesc = (array: { createdAt: string }[]) => {
    return array.sort((entryA, entryB) => {
        const entryADate = formatReadbleDateToOperationalDate(entryA.createdAt)
        const entryBDate = formatReadbleDateToOperationalDate(entryB.createdAt)
        const timestampA = new Date(entryADate).getTime();
        const timestampB = new Date(entryBDate).getTime();
        return timestampB - timestampA;
    });
};

const findLastHistoryEntry = (array: { createdAt: string }[]) => {
    const copy = [...array];
    const sorted = sortByDateDesc(copy);
    return sorted[0];
};

export default {
    formatReadbleDateToOperationalDate,
    sortByDateDesc,
    findLastHistoryEntry
}