import React from "react";

const LiveUpdateContext = React.createContext({
    stampsUpdated: false,
    setStampsUpdated: () => {

    },
    dismissStampsUpdated: () => { }
});

const useLiveUpdateContext = () => React.useContext(LiveUpdateContext);

export { LiveUpdateContext, useLiveUpdateContext };
