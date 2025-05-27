import DbService from '../../services/DbService/DbService';
import DbStores from '../../services/DbService/DbStores';
import { Document } from '../../services/DbService/DbTypes';
import path from 'path';
import fs from 'fs';
import { cleanTestDatabase, TEST_DB_PATH } from '../setup-helpers';
import * as uuid from 'uuid';

describe('DbService', () => {
    let dbService: DbService;

    // Setup przed każdym testem
    beforeEach(async () => {
        await cleanTestDatabase();
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
            const testId = uuid.v4();
            const testData = {
                field: 'value',
                field2: 'value2'
            }
            const result = await dbService.setById(testId, testData);
            expect(result).toBe(testId);
            const filePath = path.join(TEST_DB_PATH, DbStores.Users, `${testId}.json`);
            expect(fs.existsSync(filePath)).toBe(true);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const document: Document<typeof testData> = JSON.parse(fileContent);
            expect(document._id).toBe(testId);
            expect(document.field).toBe(testData.field);
            expect(document.field2).toBe(testData.field2);
            expect(document.metadata).toBeDefined();
            expect(document.metadata.createdAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/);
            expect(document.metadata.updatedAt).toBeUndefined();
        });

        it('should return null if file already exists', async () => {
            const testId = uuid.v4();
            await dbService.setById(testId, {
                name: 'Robert',
                email: 'rob@baratheon.stag'
            });
            const expectedPath = path.join(TEST_DB_PATH, DbStores.Users, `${testId}.json`);
            expect(fs.existsSync(expectedPath)).toBe(true);

            const result = await dbService.setById(testId, {
                name: 'Jamie Lannister',
                email: 'jamie@baratheon.lan'
            });

            expect(result).toBe(null);
            const fileContent = fs.readFileSync(expectedPath, 'utf8');
            const document: Document<{ name: string, email: string }> = JSON.parse(fileContent)
            expect(document._id).toBe(testId);
            expect(document.name).toBe('Robert');
            expect(document.email).toBe('rob@baratheon.stag');
            expect(document.metadata).toBeDefined();
            expect(document.metadata.createdAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/);
            expect(document.metadata.updatedAt).toBeUndefined();
        });

        it('should handle empty object', async () => {
            const testId = uuid.v4();
            const result = await dbService.setById(testId, {});
            expect(result).toBe(testId);
            const document = await dbService.getById(testId);
            expect(document).toBeTruthy();

            expect(Object.keys(document!).every(key => [
                '_id',
                'metadata',
            ].includes(key)));

            expect(document?._id).toBe(testId);
            expect(document?.metadata).toBeDefined();
            expect(document?.metadata.createdAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/);
            expect(document?.metadata.updatedAt).toBeUndefined();
        });

        it('creation of many objects with same id', async () => {
            const testId = uuid.v4();

            const objects = [
                { name: 'John Paul 0', myValue: 0, _id: 'fake-id' },
                { age: 12, someField: true, children: ['boy', 'girl'] },
                [1, 2, 3, {} as any, { name: 'John Paul 23', valueOf: false }],
                { inner: [11, 22, 33, [] as any, { 'John Paul 33': 'Random string' }], },
                [{
                    name: 'Paul 123',
                    valueOf: 5,
                    "true": false
                }],
                {
                    fieldA: 'a', fieldB: 'b', nestedField: {
                        fieldC: 'c',
                        inner: {
                            name: 'John Paul 0',
                            myValue: 0,
                            arr: [1, 2, 3, {} as any, { name: 'John Paul 23', valueOf: false }]
                        },
                        fieldD: 'd',
                        fieldE: 'e',
                        fieldF: 'f',
                        fieldG: 'g',
                        fieldH: 'h',
                        fieldI: 'i',
                    }
                },
            ];

            let objectsCounter = 0;
            const operations = [];
            for (let i = 0; i < 100; i++) {
                const currentObject = objects[objectsCounter];
                operations.push(dbService.setById(testId, {
                    ...currentObject,
                }));
                objectsCounter = ((objectsCounter + 1) > (objects.length - 1)) ? 0 : objectsCounter + 1;
            }

            await Promise.all(operations);
            const document = await dbService.getById(testId);
            expect(document?.name).toBe('John Paul 0');
            expect(document?.myValue).toBe(0);
            expect(document?._id).toBe(testId);
        });
    });

    describe('getById', () => {
        it('should return document for existing file', async () => {
            const testId = uuid.v4();
            const testData = {
                field: 'some value',
                number: 1,
                boolean: true,
                nested: [
                    {
                        nexted: 'nested value',
                    }
                ]
            }
            await dbService.setById(testId, testData);
            const result = await dbService.getById<typeof testData>(testId);
            expect(result).toBeTruthy();
            expect(result?._id).toBe(testId);
            expect(result?.field).toBe(testData.field);
            expect(result?.number).toBe(testData.number);
            expect(result?.boolean).toBe(testData.boolean);
            expect(result?.nested).toEqual(testData.nested);
            expect(result?.nested.length).toBe(testData.nested.length);
            expect(result?.nested[0]).toEqual(testData.nested[0]);
            expect(result?.nested[0].nexted).toBe(testData.nested[0].nexted);
            expect(result?.metadata.createdAt).toBeDefined();
            expect(result?.metadata.updatedAt).toBeUndefined();
        });

        it('should return null for non-existent file', async () => {
            const result = await dbService.getById('non-existent-id');
            expect(result).toBeNull();
        });

        it('should return null and handle corrupted JSON gracefully', async () => {
            const testId = 'somefileid'
            const filePath = path.join(TEST_DB_PATH, DbStores.Users, `${testId}.json`);
            fs.writeFileSync(filePath, '{ "invalid": json }');
            const result = await dbService.getById(testId);
            expect(result).toBeNull();
        });
    });

    describe('updateById', () => {
        it('should update existing document and preserve createdAt', async () => {
            const testId = uuid.v4();
            const testData = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
                boolean: false,
                number: 123,
                children: ['boy', 'girl', {
                    type: 'car',
                    color: 'red',
                    speed: 100,
                    passengers: ['John', 'Jane', {
                        name: 'Jim',
                        age: 10,
                    }]
                }] as (string | Record<string, any>)[]
            }
            const updateData = {
                name: 'Ned Edgar Eod',
                children: ['boy', {
                    type: 'bike',
                    color: 'blue',
                }]
            };

            await dbService.setById(testId, testData);
            const originalDoc = await dbService.getById<typeof testData>(testId);
            const originalCreatedAt = originalDoc!.metadata.createdAt;
            await dbService.updateById(testId, updateData);
            const updatedDoc = await dbService.getById<typeof testData>(testId);

            expect(updatedDoc?.email).toBe(testData.email);
            expect(updatedDoc?.age).toBe(testData.age);
            expect(updatedDoc?.boolean).toBe(testData.boolean);
            expect(updatedDoc?.number).toBe(testData.number);
            expect(updatedDoc?.name).toBe(updateData.name);
            expect(updatedDoc?.children).toStrictEqual(updateData.children);
            expect(updatedDoc?.children.length).toBe(updateData.children.length);
            expect(updatedDoc?.children[0]).toStrictEqual(updateData.children[0]);
            expect(updatedDoc?.children[1]).toStrictEqual(updateData.children[1]);
            expect(updatedDoc?.metadata.createdAt).toBe(originalCreatedAt);
            expect(updatedDoc?.metadata.updatedAt).toBeDefined();
        });

        it('should return null for non-existent document', async () => {
            const result = await dbService.updateById('non-existent', { name: 'Test' });
            expect(result).toBeNull();
        });
    });

    describe('removeItemById', () => {
        it('should remove existing file', async () => {
            const testId = uuid.v4();
            await dbService.setById(testId, {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
            });
            const filePath = path.join(TEST_DB_PATH, DbStores.Users, `${testId}.json`);
            expect(fs.existsSync(filePath)).toBe(true);
            const result = await dbService.removeItemById(testId);
            expect(result).toBe(true);
            expect(fs.existsSync(filePath)).toBe(false);
        });

        it('removed file should not be in the database', async () => {
            const testId = uuid.v4();
            await dbService.setById(testId, { any: 'data' });
            const filePath = path.join(TEST_DB_PATH, DbStores.Users, `${testId}.json`);
            expect(fs.existsSync(filePath)).toBe(true);
            await dbService.removeItemById(testId);
            const result = await dbService.getById(testId);
            expect(result).toBeNull();
        });

        it('should return false for non-existent file', async () => {
            const result = await dbService.removeItemById('non-existent');
            expect(result).toBe(false);
        });
    });

    describe('setById and updateById 100 objects', () => {
        it('should set 100 objects immediately', async () => {

            const operations = [];
            for (let i = 0; i < 100; i++) {
                const testId = `${i}`;
                operations.push(dbService.setById(testId, {
                    name: `John Paul ${i}`,
                    myValue: i,
                }));
            }

            await Promise.all(operations);


            for (let i = 0; i < 100; i++) {
                const testId = `${i}`;
                const result = await dbService.getById(testId);
                expect(result).toBeTruthy();
                expect(result?._id).toBe(testId);
                expect(result?.name).toBe(`John Paul ${i}`);
                expect(result?.myValue).toBe(i);
                expect(result?.metadata.createdAt).toBeDefined();
                expect(result?.metadata.updatedAt).toBeUndefined();
            }
        });

        it('Should lock object when updation is fired 100 times', async () => {
            const testId = uuid.v4();
            const testData = { name: 'John Doe', email: 'john@example.com', age: 30 };
            await dbService.setById(testId, testData);
            const updations = [];
            for (let i = 0; i < 100; i++) {
                updations.push(
                    dbService
                        .updateById(testId, {
                            name: `John Doe ${i}`
                        })
                );
            }
            await Promise.all(updations);
            const updatedDoc = await dbService.getById(testId);
            expect(updatedDoc?.name).toBe('John Doe 0');
            expect(updatedDoc?.email).toBe(testData.email);
            expect(updatedDoc?.age).toBe(testData.age);
            expect(updatedDoc?.metadata.createdAt).toBeDefined();
            expect(updatedDoc?.metadata.updatedAt).toBeDefined();
            expect(updatedDoc?._id).toBe(testId);
        });

        it('Should update one object 100 times', async () => {
            const testId = uuid.v4();
            const testData = { name: 'John Doe', email: 'john@example.com', age: 30 }
            await dbService.setById(testId, testData);
            for (let i = 0; i < 100; i++) {
                const updatedDocId = await dbService.updateById(testId, { name: `John Doe ${i}` });
                const currentDoc = await dbService.getById(updatedDocId ?? '');
                expect(currentDoc?.name).toBe(`John Doe ${i}`);
                expect(currentDoc?._id).toBe(testId);
            }
        });
    });

    describe('getAllByField', () => {
        // 25 names
        const names = ['Alice', 'Bob', 'Diana', 'Eve', 'Frank', 'George', 'Hannah', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Patrick', 'Quinn', 'Ryan', 'Sarah', 'Thomas', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zane'];

        beforeEach(async () => {
            let namesCounter = 0;

            await dbService.__drop()
            for (let i = 0; i < 100; i++) {
                const testId = uuid.v4();
                const currentName = names[namesCounter];
                const docData = {
                    name: `${currentName}-${i}`,
                    email: `${currentName.toLowerCase()}-${i}@example.com`,
                }
                await dbService.setById(testId, docData);
                namesCounter = ((namesCounter + 1) > (names.length - 1)) ? 0 : namesCounter + 1;
            }
        });

        it('should find documents by exact field match', async () => {
            const exactResult = await dbService.getAllByField('name', names[0], {
                page: 1,
                size: 10
            });

            expect(exactResult.items).toHaveLength(0);
            expect(exactResult.hasMore).toBe(false);

            const exactResultTwo = await dbService.getAllByField('name', `${names[0]}-0`, {
                page: 1,
                size: 10
            });
            expect(exactResultTwo.items).toHaveLength(1);
            expect(exactResultTwo.items[0].name).toBe(`${names[0]}-0`);
            expect(exactResultTwo.hasMore).toBe(false);
        });

        it('should find documents by phrase containment', async () => {
            const resultPageOne = await dbService.getAllByField('email', 'example.com', {
                containPhrase: true,
                page: 1,
                size: 10
            });

            expect(resultPageOne.items).toHaveLength(10);
            expect(resultPageOne.hasMore).toBe(true);

            const resultPageThree = await dbService.getAllByField('email', 'example.com', {
                containPhrase: true,
                page: 9,
                size: 5
            });
            expect(resultPageThree.items).toHaveLength(5);
            expect(resultPageThree.hasMore).toBe(true);

            const resultPageLast = await dbService.getAllByField('email', 'example.com', {
                containPhrase: true,
                page: 10,
                size: 10
            });

            expect(resultPageLast.items).toHaveLength(10);
            expect(resultPageLast.hasMore).toBe(false);
        });

        it('should handle pagination correctly', async () => {
            const page1 = await dbService.getAllByField('name', names[0], {
                containPhrase: true,
                page: 1,
                size: 2
            });
            expect(page1.items).toHaveLength(2);
            expect(page1.hasMore).toBe(true);
            const page2 = await dbService.getAllByField('name', names[0], {
                containPhrase: true,
                page: 2,
                size: 2
            });
            expect(page2.items).toHaveLength(2);
            expect(page2.hasMore).toBe(false);
        });

        it('should return empty array for non-matching field', async () => {
            const result = await dbService.getAllByField('name', 'NonExistent', {
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