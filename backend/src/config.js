require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  port: process.env.PORT || 4000,
  databaseUrl: isTest
    ? process.env.TEST_DATABASE_URL || 'postgres://tickets:tickets@localhost:5433/tickets_test'
    : process.env.DATABASE_URL || 'postgres://tickets:tickets@localhost:5432/tickets',
};
