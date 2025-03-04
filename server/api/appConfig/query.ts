import fs from "fs";
import path from "path";
import { AppConfig } from "./type";

const directoryPath = 'db/appConfig';

const findAppConfig = async () => {
    try {
        const filePath = path.join(directoryPath, 'appConfig.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        if (jsonData) {
            return jsonData as AppConfig;
        }
    } catch (e) {
        return
    }
}

const appConfigQuery = {
    findAppConfig
}

export default appConfigQuery;