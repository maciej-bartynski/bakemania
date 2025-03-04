import { FC } from "react";
import './FooterNav.css';
import IconButton from "../../atoms/IconButton/IconButton";
import IconName from "../../icons/IconName";
import Config from "../../config";

const FooterNav: FC<{
    actions?: NavAction[];
}> = ({
    actions
}) => {

        return (
            <footer
                className="footer-nav"
                style={{ height: Config.FooterHeight }}
            >
                {actions?.map(action => {
                    return (
                        <IconButton
                            key={action.label}
                            onClick={action.action}
                            iconName={action.icon}
                            label={action.label}
                            iconColor={action.variant === 'primary' ? "white" : undefined}
                            textColor={action.variant === 'primary' ? "var(--bakemaniaGold" : undefined}
                            bgColor={action.variant === 'primary' ? "var(--bakemaniaGold" : undefined}
                        />
                    )
                })}
            </footer>
        )
    }

export default FooterNav;

export type NavAction = {
    label: string;
    action: () => void;
    icon: IconName;
    variant?: 'primary' | 'secondary';
}