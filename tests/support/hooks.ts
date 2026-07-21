import { BeforeAll, AfterAll, Before } from '@cucumber/cucumber';
import { startTestApp, stopTestApp } from './test-app';

BeforeAll({ timeout: 60000 }, async function () {
  await startTestApp();
});

AfterAll({ timeout: 30000 }, async function () {
  await stopTestApp();
});

Before(async function () {
  this.response = null;
  this.accessToken = null;
  this.createdEntityId = null;
  this.lastError = null;
});
