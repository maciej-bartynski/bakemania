import { FC, PropsWithChildren, ReactNode, useRef } from "react";
import './Background.css';
import bakemaniaBannerUrl from '../../assets/bakemania-rectangle.jpg'
import Config from "../../config";

const Background: FC<PropsWithChildren<{
    appBar?: ReactNode
}>> = ({
    children,
    appBar = null,
}) => {

        const titleRef = useRef<HTMLTitleElement | null>(null);
        return (
            <main className="appBackground">
                <div className="appBackground__scrollable-content">
                    <header className="appBackground__header">

                        <h1>bakeMAnia</h1>

                        <img
                            className='appBackground__image'
                            alt="bakeMAnia-banner"
                            src={bakemaniaBannerUrl}
                            onLoad={(event) => {
                                try {
                                    const htmlImage = event.target as HTMLImageElement;
                                    const htmlTitle = titleRef.current;
                                    if (htmlImage) htmlImage.style.opacity = '1';
                                    if (htmlTitle) htmlTitle.style.opacity = '0';
                                } catch (e) {
                                    console.warn(e);
                                }
                            }}
                        />

                        <p>
                            Zbieraj pieczątki<br />i zyskuj rabaty [1]
                        </p>
                    </header>

                    <div className="appBackground__content">
                        {children}
                    </div>
                </div>
                {appBar && (
                    <div
                        className='appBackground__bottom-bar'
                        style={{ height: Config.FooterHeight }}
                    >
                        {appBar}
                    </div>
                )}
            </main>
        )
    }

export default Background;