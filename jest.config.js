module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-sorted', 'jest-extended']
  // setupFilesAfterEnv: ["<rootDir>/prisma/singleton.ts"],
};
