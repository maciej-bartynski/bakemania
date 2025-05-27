import DbService from '../../services/DbService/DbService';
import DbStores from '../../services/DbService/DbStores';
import { Document } from '../../services/DbService/DbTypes';
import path from 'path';
import fs from 'fs';
import { cleanTestDatabase, TEST_DB_PATH } from '../setup-helpers';

// Testowy typ danych
interface TestDocument {
    name: string;
    email: string;
    age?: number;
}

const produce100DeterministicObjectsInDeterministicOrder = (): { mockDataArray: TestDocument[], mockDataIds: string[] } => {
    const mockDataArray: TestDocument[] = [];
    const mockDataIds: string[] = [];
    for (let i = 0; i < 100; i++) {
        const nextId = `doc-${i}`;
        const nextName = `John Doe ${i}`;
        const nextEmail = `john${i}@example.com`;
        mockDataArray.push({
            name: nextName,
            email: nextEmail,
            age: i
        });
        mockDataIds.push(nextId);
    }
    return { mockDataArray, mockDataIds };
}

describe('DbService', () => {
    let dbService: DbService;
    const testDocId = 'test-doc-id-1';
    const testDocData: TestDocument = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
    };

    const emptyObjectId = 'test-doc-id-2';
    const emptyObjectData = {};


    // Setup przed każdym testem
    beforeEach(async () => {
        dbService = new DbService({
            dbStore: DbStores.Users,
        });
    });

    afterAll(async () => {
        await cleanTestDatabase();
    });

    describe('Constructor', () => {
        it('should initialize with custom basePath', () => {
            const usersDb = new DbService({
                dbStore: DbStores.Users,
            });

            const adminsDb = new DbService({
                dbStore: DbStores.Admins,
            });

            const managersDb = new DbService({
                dbStore: DbStores.Managers,
            });

            const appConfigDb = new DbService({
                dbStore: DbStores.AppConfig,
            });

            expect(usersDb.route).toBe(path.join(path.resolve(process.cwd(), './db-test'), DbStores.Users));
            expect(managersDb.route).toBe(path.join(path.resolve(process.cwd(), './db-test'), DbStores.Managers));
            expect(adminsDb.route).toBe(path.join(path.resolve(process.cwd(), './db-test'), DbStores.Admins));
            expect(appConfigDb.route).toBe(path.join(path.resolve(process.cwd(), './db-test'), DbStores.AppConfig));
        });
    });

    describe('setById', () => {
        it('should create new document with correct structure', async () => {
            const result = await dbService.setById(testDocId, testDocData);
            expect(result).toBe(testDocId);

            const filePath = path.join(TEST_DB_PATH, DbStores.Users, `${testDocId}.json`);
            expect(fs.existsSync(filePath)).toBe(true);

            const fileContent = fs.readFileSync(filePath, 'utf8');
            const document: Document<TestDocument> = JSON.parse(fileContent);
            expect(document._id).toBe(testDocId);
            expect(document.name).toBe(testDocData.name);
            expect(document.email).toBe(testDocData.email);
            expect(document.age).toBe(testDocData.age);
            expect(document.metadata).toBeDefined();
            expect(document.metadata.createdAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/);
            expect(document.metadata.updatedAt).toBeUndefined();
        });

        it('should return null if file already exists', async () => {
            const testData: TestDocument = { name: 'Robert', email: 'rob@baratheon.stag' };
            const result = await dbService.setById(testDocId, testData);

            const filePath = path.join(TEST_DB_PATH, DbStores.Users, `${testDocId}.json`);
            expect(fs.existsSync(filePath)).toBe(true);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const document: Document<TestDocument> = JSON.parse(fileContent)
            expect(document._id).toBe(testDocId);
            expect(document.name).toBe(testDocData.name);
            expect(document.email).toBe(testDocData.email);
            expect(document.age).toBe(testDocData.age);
            expect(document.metadata).toBeDefined();
            expect(document.metadata.createdAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/);
            expect(document.metadata.updatedAt).toBeUndefined();
        });

        it('should handle empty object', async () => {
            const result = await dbService.setById(emptyObjectId, emptyObjectData);
            expect(result).toBe(emptyObjectId);
            const document = await dbService.getById(emptyObjectId);
            expect(document?._id).toBe(emptyObjectId);
            expect(document?.name).toBeUndefined();
            expect(document?.email).toBeUndefined();
            expect(document?.age).toBeUndefined();
            expect(document?.metadata).toBeDefined();
            expect(document?.metadata.createdAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/);
            expect(document?.metadata.updatedAt).toBeUndefined();
        });
    });

    describe('getById', () => {
        it('should return document for existing file', async () => {
            const result = await dbService.getById<TestDocument>(testDocId);
            expect(result).toBeTruthy();
            expect(result?._id).toBe(testDocId);
            expect(result?.name).toBe(testDocData.name);
            expect(result?.email).toBe(testDocData.email);
            expect(result?.age).toBe(testDocData.age);
            expect(result?.metadata.createdAt).toBeDefined();
        });

        it('should return null for non-existent file', async () => {
            const result = await dbService.getById<TestDocument>('non-existent-id');
            expect(result).toBeNull();
        });

        it('should return null and handle corrupted JSON gracefully', async () => {
            const filePath = path.join(TEST_DB_PATH, 'users', `${emptyObjectId}.json`);
            fs.writeFileSync(filePath, '{ "invalid": json }');
            const result = await dbService.getById<TestDocument>(emptyObjectId);
            expect(result).toBeNull();
        });
    });

    describe('updateById', () => {
        it('should update existing document and preserve createdAt', async () => {
            const updateData: Partial<TestDocument> = {
                name: 'Ned Edgar Doe',
            };
            const originalDoc = await dbService.getById<TestDocument>(testDocId);
            const originalCreatedAt = originalDoc?.metadata.createdAt;
            await new Promise(resolve => {
                setTimeout(resolve, 1000)
            });
            const result = await dbService.updateById<TestDocument>(testDocId, updateData);
            expect(result).toBe(testDocId);
            const updatedDoc = await dbService.getById<TestDocument>(testDocId);
            expect(updatedDoc?.name).toBe(updateData.name);
            expect(updatedDoc?.email).toBe(originalDoc?.email);
            expect(updatedDoc?.age).toBe(originalDoc?.age);
            expect(updatedDoc?.metadata.createdAt).toBe(originalCreatedAt);
            expect(updatedDoc?.metadata.updatedAt).toBeDefined();
            expect(updatedDoc?.metadata.updatedAt).not.toBe(originalCreatedAt);
        });

        it('should return null for non-existent document', async () => {
            const result = await dbService.updateById<TestDocument>('non-existent', { name: 'Test' });
            expect(result).toBeNull();
        });
    });

    describe('removeItemById', () => {
        it('should remove existing file', async () => {
            const filePath = path.join(TEST_DB_PATH, 'users', `${testDocId}.json`);
            expect(fs.existsSync(filePath)).toBe(true);
            const result = await dbService.removeItemById(testDocId);
            expect(result).toBe(true);
            expect(fs.existsSync(filePath)).toBe(false);
        });

        it('removed file should not be in the database', async () => {
            const result = await dbService.getById(testDocId);
            expect(result).toBeNull();
        });

        it('should return false for non-existent file', async () => {
            const result = await dbService.removeItemById('non-existent');
            expect(result).toBe(false);
        });
    });

    describe('setById nad updateById 100 objects', () => {
        it('should set 100 objects', async () => {
            const { mockDataArray, mockDataIds } = produce100DeterministicObjectsInDeterministicOrder();
            let cursor = 0;
            for (const mockData of mockDataArray) {
                const result = await dbService.setById(mockDataIds[cursor], mockData);
                expect(result).toBe(mockDataIds[cursor]);
                cursor++;
            }
        });

        it('should read 100 objects', async () => {
            const { mockDataArray, mockDataIds } = produce100DeterministicObjectsInDeterministicOrder();
            let cursor = 0;
            for (const mockData of mockDataArray) {
                const result = await dbService.getById(mockDataIds[cursor]);
                expect(result).toBeTruthy();
                expect(result?._id).toBe(mockDataIds[cursor]);
                expect(result?.name).toBe(mockData.name);
                expect(result?.email).toBe(mockData.email);
                expect(result?.age).toBe(mockData.age);
                expect(result?.metadata.createdAt).toBeDefined();
                cursor++;
            }
        });

        it('When update one object 100 times, lock should work and not cause any errors', async () => {
            const testId = 'update-stress-test-id';
            const result = await dbService.setById(testId, { name: 'John Doe', email: 'john@example.com', age: 30 });
            expect(result).toBe(testId);
            const updations = [];
            for (let i = 0; i < 100; i++) {
                updations.push(dbService.updateById(testId, { name: `John Doe ${i}`, email: `john${i}@example.com`, age: i }));
            }
            await Promise.all(updations);
            const updatedDoc = await dbService.getById(testId);
            expect(updatedDoc?.name).toBe('John Doe 0');
            expect(typeof updatedDoc?.email).toBe('string');
            expect(typeof updatedDoc?.age).toBe('number');
            expect(updatedDoc?.metadata.createdAt).toBeDefined();
            expect(updatedDoc?.metadata.updatedAt).toBeDefined();
            expect(updatedDoc?._id).toBeTruthy();
        });

        it('Should update one object 100 times', async () => {
            const testId = 'update-stress-test-id-2';
            const result = await dbService.setById(testId, { name: 'John Doe', email: 'john@example.com', age: 30 });
            expect(result).toBe(testId);
            for (let i = 0; i < 100; i++) {
                const updatedDocId = await dbService.updateById(testId, { name: `Next name in order ${i}` });
                const currentDoc = await dbService.getById(updatedDocId ?? '');
                expect(currentDoc?.name).toBe(`Next name in order ${i}`);
                expect(currentDoc?._id).toBe(testId);
            }
        });
    });

    describe('getAllByField', () => {
        // 25 names
        const names = ['Alice', 'Bob', 'Diana', 'Eve', 'Frank', 'George', 'Hannah', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Patrick', 'Quinn', 'Ryan', 'Sarah', 'Thomas', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zane'];

        beforeAll(async () => {
            await dbService.__drop();
            let namesCounter = 0;
            for (let i = 0; i < 100; i++) {
                const currentName = names[namesCounter];
                const docId = `${currentName}-${i}`;
                const docData = {
                    name: `${currentName}-${i}`,
                    email: `${currentName.toLowerCase()}-${i}@example.com`,
                }
                await dbService.setById(docId, docData);
                namesCounter = ((namesCounter + 1) > (names.length - 1)) ? 0 : namesCounter + 1;
            }
        });

        it('should find documents by exact field match', async () => {
            const exactResult = await dbService.getAllByField<TestDocument>('name', names[0], {
                page: 1,
                size: 10
            });

            expect(exactResult.items).toHaveLength(0);
            expect(exactResult.hasMore).toBe(false);

            const exactResultTwo = await dbService.getAllByField<TestDocument>('name', `${names[0]}-0`, {
                page: 1,
                size: 10
            });
            expect(exactResultTwo.items).toHaveLength(1);
            expect(exactResultTwo.items[0].name).toBe(`${names[0]}-0`);
            expect(exactResultTwo.hasMore).toBe(false);
        });

        it('should find documents by phrase containment', async () => {
            const resultPageOne = await dbService.getAllByField<TestDocument>('email', 'example.com', {
                containPhrase: true,
                page: 1,
                size: 10
            });

            expect(resultPageOne.items).toHaveLength(10);
            expect(resultPageOne.hasMore).toBe(true);

            const resultPageThree = await dbService.getAllByField<TestDocument>('email', 'example.com', {
                containPhrase: true,
                page: 9,
                size: 5
            });
            expect(resultPageThree.items).toHaveLength(5);
            expect(resultPageThree.hasMore).toBe(true);

            const resultPageLast = await dbService.getAllByField<TestDocument>('email', 'example.com', {
                containPhrase: true,
                page: 10,
                size: 10
            });

            expect(resultPageLast.items).toHaveLength(10);
            expect(resultPageLast.hasMore).toBe(false);
        });

        it('should handle pagination correctly', async () => {
            const page1 = await dbService.getAllByField<TestDocument>('name', names[0], {
                containPhrase: true,
                page: 1,
                size: 2
            });
            expect(page1.items).toHaveLength(2);
            expect(page1.hasMore).toBe(true);
            const page2 = await dbService.getAllByField<TestDocument>('name', names[0], {
                containPhrase: true,
                page: 2,
                size: 2
            });
            expect(page2.items).toHaveLength(2);
            expect(page2.hasMore).toBe(false);
        });

        it('should return empty array for non-matching field', async () => {
            const result = await dbService.getAllByField<TestDocument>('name', 'NonExistent', {
                page: 1,
                size: 10
            });
            expect(result.items).toHaveLength(0);
            expect(result.hasMore).toBe(false);
        });
    });

    describe('getFormattedDateString', () => {
        it('should format date correctly', () => {
            const testDate = new Date('2024-01-15T14:30:45');
            const result = dbService.getFormattedDateString(testDate);
            expect(result).toBe('15.01.2024 14:30:45');
        });

        it('should pad single digits with zeros', () => {
            const testDate = new Date('2024-03-05T09:05:03');
            const result = dbService.getFormattedDateString(testDate);
            expect(result).toBe('05.03.2024 09:05:03');
        });
    });
});