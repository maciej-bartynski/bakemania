import { FC, PropsWithChildren, ReactNode } from "react";
import './PanelViewTemplate.css';
import Config from "../../config";
import SafeAreaView from "../SafeAreaView/SafeAreaView";

const PanelViewTemplate: FC<PropsWithChildren<{
    title: ReactNode;
    appBar?: ReactNode;
    appBarClassName?: string;
}>> = ({
    title,
    children,
    appBar = null,
    appBarClassName = '',
}) => {
        return (
            <SafeAreaView>
                <section className="panelViewTemplate">
                    <h2
                        className={"panelViewTemplate__title " + appBarClassName}
                        style={{
                            height: Config.HeaderHeight,
                            lineHeight: Config.HeaderHeight + 'px',
                        }}
                    >
                        {title}
                    </h2>
                    <div className="panelViewTemplate__content">
                        {children}
                    </div>
                    {appBar && (
                        <div
                            className={"panelViewTemplate__app-bar"}
                            style={{
                                height: Config.FooterHeight,
                            }}
                        >
                            {appBar}
                        </div>
                    )}
                </section>
            </SafeAreaView>
        )
    }

export default PanelViewTemplate;