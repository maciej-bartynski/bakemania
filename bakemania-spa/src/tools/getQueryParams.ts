import Config from "../config";

const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        token: params.get(Config.sessionKeys.Token)
    };
};

export default getQueryParams;