import { cleanTestDatabase, cleanTestLogs } from './setup-helpers';

beforeAll(async () => {
    console.log('🧹 Cleaning test environment before all tests...');
    await cleanTestDatabase();
    await cleanTestLogs();
});

afterAll(async () => {
    await cleanTestDatabase();
    await cleanTestLogs();
    console.log('🧹 Test environment cleaned after all tests!');
});
