"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("../../lib/tools"));
const stamps_1 = __importDefault(require("../../public/models/stamps"));
const fs_1 = __importDefault(require("fs"));
const STAMPS_DB_PATH = 'db/stamps';
const USERS_DB_PATH = 'db/users';
const stampsFindOne = async (userId) => {
    const filePath = `${STAMPS_DB_PATH}/${userId}.json`;
    try {
        const fileContent = fs_1.default.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        const stampsData = new stamps_1.default(jsonData);
        return stampsData;
    }
    catch (error) {
        return undefined;
    }
};
const stampsIncrementOne = async (fields) => {
    const { userId, amount } = fields;
    const user = await tools_1.default.usersFindOne({ _id: userId, email: undefined });
    try {
        const filePath = `${USERS_DB_PATH}/${userId}.json`;
        const newStampsData = user.stamps.amount + amount;
        const newUser = { ...user };
        newUser.stamps = newStampsData;
        fs_1.default.writeFileSync(filePath, JSON.stringify(newUser, null, 2));
    }
    catch (error) {
        console.log(error);
    }
    return userId;
};
const stampsDecrementOne = async (fields) => {
    const { userId, amount } = fields;
    const user = await tools_1.default.usersFindOne({ _id: userId, email: undefined });
    try {
        const filePath = `${USERS_DB_PATH}/${userId}.json`;
        const newStampsData = user.stamps.amount - amount;
        const newUser = { ...user };
        if (newStampsData < 0) {
            throw 'Not enough stamps';
        }
        else {
            newUser.stamps = newStampsData;
            fs_1.default.writeFileSync(filePath, JSON.stringify(newUser, null, 2));
        }
    }
    catch (error) {
        console.log(error);
    }
    return userId;
};
exports.default = {
    stampsFindOne,
    stampsIncrementOne,
    stampsDecrementOne
};
