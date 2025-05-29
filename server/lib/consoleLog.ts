const consoleLog = (message: string) => {
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    console.log(message);
}

export default consoleLog;