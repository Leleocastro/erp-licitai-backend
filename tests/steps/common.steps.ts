import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { getSeedData } from '../support/test-app';

Then(/^the response status code should be (\d+)$/, function (statusCode: string) {
  expect(this.response).to.not.be.null;
  expect(this.response!.statusCode).to.equal(parseInt(statusCode));
});

Then(/^the response body should contain "([^"]+)"$/, function (key: string) {
  expect(this.response).to.not.be.null;
  expect(this.response!.body).to.have.property(key);
});

Then(/^the response body should contain "([^"]+)" with value "([^"]+)"$/, function (key: string, value: string) {
  expect(this.response).to.not.be.null;
  expect(this.response!.body).to.have.property(key);
  expect(String(this.response!.body[key])).to.equal(value);
});

Then(/^the response body should be an array$/, function () {
  expect(this.response).to.not.be.null;
  expect(this.response!.body).to.be.an('array');
});

Given(/^there is an orgao in the database$/, function () {
  const seed = getSeedData();
  expect(seed).to.not.be.null;
  expect(seed!.orgao).to.not.be.undefined;
});
