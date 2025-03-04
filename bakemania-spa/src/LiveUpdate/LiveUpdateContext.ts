import React from "react";

const LiveUpdateContext = React.createContext({
    stampsUpdated: false,
    setStampsUpdated: () => {

    },
});

const useLiveUpdateContext = () => React.useContext(LiveUpdateContext);

export { LiveUpdateContext, useLiveUpdateContext };
