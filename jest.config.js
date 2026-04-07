const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Forneça o caminho para o seu app Next.js para carregar next.config.js e arquivos .env em seu ambiente de teste
  dir: './',
})

// Adicione qualquer configuração personalizada do Jest para ser transmitida ao Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Lidar com aliases de módulo
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/archive/'],
}

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js que é assíncrona
module.exports = createJestConfig(customJestConfig)
