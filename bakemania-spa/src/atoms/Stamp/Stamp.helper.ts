import IconName from "../../icons/IconName"

const iterateIcons = (amount: number) => {

    const randomAngles = [61, 45, 159, 38, 254, 168, 108]
    const randomMarginsLeft = [0, 3, 3, 2, 4, 1, 2]
    const randomMarginsTop = [1, 1, 5, 2, 1, 5, 1]
    const randomIcons = [
        IconName.CookieMan, IconName.Cookie, IconName.CookieMan, IconName.CookieManFill, IconName.CookieMan, IconName.CookieFill, IconName.Cookie
    ]

    const result: {
        iconName: IconName,
        angle: number,
        marginLeft: number,
        marginTop: number,
    }[] = [];

    let iconPointer = 0;

    for (let i = 0; i < amount; i++) {
        result.push({
            iconName: randomIcons[iconPointer],
            angle: randomAngles[iconPointer],
            marginLeft: randomMarginsLeft[iconPointer],
            marginTop: randomMarginsTop[iconPointer]
        });

        if (iconPointer + 1 >= randomIcons.length) {
            iconPointer = 0;
        } else {
            iconPointer++;
        }
    }

    return result;
}

export default iterateIcons;