import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";
import Operations from "../../tools/operations";
import "./OperationIcon.css";

const OperationIcon: React.FC<{
    operation: Operations
}> = ({ operation }) => {

    const colors = getColors(operation);

    return (
        <div
            className="OperationIcon__wrapper"
            style={{
                '--icon-background': colors.iconBackground,
            } as React.CSSProperties}
        >
            {getIcon(operation)}
        </div>
    )
};

export default OperationIcon;

const getColors = (operation: Operations) => {
    if (operation === Operations.GiftExchange) return {
        iconBackground: 'var(--bakemaniaGold)',
        textColor: 'var(--bakemaniaGold)'
    };
    if (operation === Operations.StampRemoval) return {
        iconBackground: 'var(--remove-stamp)',
        textColor: 'var(--remove-stamp)'
    };
    return {
        iconBackground: 'var(--earn-stamp)',
        textColor: 'var(--earn-stamp)'
    };
};

const getIcon = (operation: Operations) => {
    if (operation === Operations.GiftExchange) return <Icon iconName={IconName.Gift} color='white' width={24} height={24} />;
    if (operation === Operations.StampRemoval) return <Icon iconName={IconName.StampRemove} color='white' width={24} height={24} />;
    return <Icon iconName={IconName.Stamp} color='white' width={24} height={24} />;
};
