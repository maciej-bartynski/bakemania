import { cleanTestDatabase, cleanTestLogs } from './setup-helpers';

beforeAll(async () => {
    console.log('🧹 Cleaning test database before all tests...');
    await cleanTestDatabase();
    await cleanTestLogs();
});

afterAll(async () => {
    await cleanTestDatabase();
    await cleanTestLogs();
    console.log('🧹 Test database cleaden after all tests!');
});
