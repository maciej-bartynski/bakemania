// jest.config.js
module.exports = {
    // Używa ts-jest do kompilacji TypeScript
    preset: 'ts-jest',

    // Środowisko Node.js (nie browser)
    testEnvironment: 'node',

    // Gdzie szukać testów
    roots: ['<rootDir>/server'],

    // Pattern dla plików testowych
    testMatch: ['**/__tests__/**/*.test.ts'],

    // Setup wykonywany przed każdym testem
    setupFilesAfterEnv: ['<rootDir>/server/__tests__/setup.ts'],

    // Co liczyć w coverage
    collectCoverageFrom: [
        'server/**/*.ts',
        '!server/**/*.d.ts',
        '!server/__tests__/**',
        '!server/server-dist/**',
    ],

    // Timeout dla testów (w ms)
    testTimeout: 10000,

    // Wyczyść mocks między testami
    clearMocks: true,

    // Pokaż szczegółowe informacje o testach
    verbose: true,
};