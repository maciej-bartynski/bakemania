import { FC } from "react";
import IconName from "./IconName";
import CardIcon from "./CardIcon";
import CogIcon from "./CogIcon";
import GiftIcon from "./GiftIcon";
import StampIcon from "./StampIcon";
import DiscountIcon from "./DiscountIcon";
import DestroyIcon from "./DestroyIcon";
import ArrowDownIcon from "./ArrowDownIcon";
import LogOutIcon from "./LogOutIcon";
import CookieIcon from "./Cookie";
import CookieFillIcon from "./CookieFill";
import CookieManIcon from "./CookieManIcon";
import CookieManFillIcon from "./CookieManFillIcon";
import QrCodeIcon from "./QrCodeIcon";
import UsersIcon from "./UsersIcon";
import StampRemoveIcon from "./StampRemoveIcon";
import StampForCashIcon from "./StampForCash";
import HistoryIcon from "./HistoryIcon";
import Chevron from "./Chevron";
import ChevronDouble from "./ChevronDouble";
import ChevronLeft from "./ChevronLeft";
import ChevronDoubleLeft from "./ChevronDoubleLeft";
import ChevronTripleLeft from "./ChevronTripleLeft";
import ChevronTriple from "./ChevronTriple";
import WarningIcon from "./WarningIcon";
import AndroidIcon from "./Android";
import IosIcon from "./Ios";
import MobileDownloadIcon from "./MobileDownload";
import IosAddIcon from "./IosAdd";

const Icon: FC<{
    width?: number;
    height?: number;
    color?: string;
    iconName: IconName
}> = ({
    width,
    height,
    color,
    iconName
}) => {

        let IconComponent: FC<{
            width?: number;
            height?: number;
            color?: string;
        }>;

        switch (iconName) {
            case IconName.Card: {
                IconComponent = CardIcon
                break;
            }
            case IconName.Cog: {
                IconComponent = CogIcon
                break;
            }
            case IconName.Gift: {
                IconComponent = GiftIcon
                break;
            }
            case IconName.Stamp: {
                IconComponent = StampIcon
                break;
            }
            case IconName.StampRemove: {
                IconComponent = StampRemoveIcon
                break;
            }
            case IconName.StampForCash: {
                IconComponent = StampForCashIcon
                break;
            }
            case IconName.Discount: {
                IconComponent = DiscountIcon
                break;
            }
            case IconName.ArrowDown: {
                IconComponent = ArrowDownIcon
                break;
            }
            case IconName.Destroy: {
                IconComponent = DestroyIcon
                break;
            }
            case IconName.LogOut: {
                IconComponent = LogOutIcon
                break;
            }
            case IconName.Cookie: {
                IconComponent = CookieIcon
                break;
            }
            case IconName.CookieFill: {
                IconComponent = CookieFillIcon
                break;
            }
            case IconName.CookieMan: {
                IconComponent = CookieManIcon
                break;
            }
            case IconName.CookieManFill: {
                IconComponent = CookieManFillIcon
                break;
            }
            case IconName.QrCode: {
                IconComponent = QrCodeIcon
                break;
            }
            case IconName.Users: {
                IconComponent = UsersIcon
                break;
            }
            case IconName.History: {
                IconComponent = HistoryIcon
                break;
            }

            case IconName.Chevron: {
                IconComponent = Chevron
                break;
            }
            case IconName.ChevronDouble: {
                IconComponent = ChevronDouble
                break;
            }

            case IconName.ChevronLeft: {
                IconComponent = ChevronLeft
                break;
            }
            case IconName.ChevronDoubleLeft: {
                IconComponent = ChevronDoubleLeft
                break;
            }
            case IconName.ChevronTripleLeft: {
                IconComponent = ChevronTripleLeft
                break;
            }
            case IconName.ChevronTriple: {
                IconComponent = ChevronTriple
                break;
            }
            case IconName.Warning: {
                IconComponent = WarningIcon
                break;
            }
            case IconName.Android: {
                IconComponent = AndroidIcon
                break;
            }
            case IconName.Ios: {
                IconComponent = IosIcon
                break;
            }
            case IconName.MobileDownload: {
                IconComponent = MobileDownloadIcon
                break;
            }
            case IconName.IosAdd: {
                IconComponent = IosAddIcon
                break;
            }
        }

        return (
            <IconComponent
                color={color}
                width={width}
                height={height}
            />
        )
    }

export default Icon;