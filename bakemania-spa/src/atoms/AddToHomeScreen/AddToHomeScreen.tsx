import React, { ReactNode } from 'react';
import './AddToHomeScreen.css';
import Icon from '../../icons/Icon';
import IconName from '../../icons/IconName';
import { isIos, isStandalone } from '../../tools/isPwa';


const PwaInstallPrompt: React.FC = () => {
    if (isStandalone()) return null;
    const iosInstruction = (
        <>
            <div className="pwa-icon">
                <Icon iconName={IconName.Ios} />
            </div>
            <ol className="pwa-steps">
                <li>
                    1. Stuknij <ShareIcon /> na dole ekranu.
                </li>
                <li>
                    2. Przewiń panel
                </li>
                <li>
                    3. Poszukaj ikonki <Icon iconName={IconName.IosAdd} /> <strong>„Do ekranu głównego”</strong>
                </li>
            </ol>
        </>
    );

    const androidInstruction = (
        <>
            <div className="pwa-icon">
                <Icon iconName={IconName.Android} />
            </div>
            <ol className="pwa-steps">
                <li>
                    1. Stuknij <DotsIcon /> w prawym górnym rogu.
                </li>
                <li>
                    2. Wybierz <strong>„Dodaj do ekranu głównego”</strong>.
                </li>
            </ol>
        </>
    )

    const platformInstructions: ReactNode[] = [];

    if (isIos()) {
        platformInstructions.push(iosInstruction);
        platformInstructions.push(androidInstruction);
    } else {
        platformInstructions.push(androidInstruction);
        platformInstructions.push(iosInstruction);
    }

    return (
        <div className="pwa-install-prompt">
            {platformInstructions}
        </div>
    );

};

const ShareIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24" fill="none"
    >
        <path d="M12 16V4m0 0l4 4m-4-4L8 8M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DotsIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
    >
        <circle cy="5" cx="12" r="2" />
        <circle cy="12" cx="12" r="2" />
        <circle cy="19" cx="12" r="2" />
    </svg>
);

export default PwaInstallPrompt;