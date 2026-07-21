@regression @api @auth
Feature: Authentication
  As a system user
  I want to authenticate against the API
  So that I can access protected resources

  Scenario: Login with valid credentials
    Given there is a user with email "admin@teste.com" and password "Test@123456"
    When I request POST /api/v1/auth/login with email "admin@teste.com" and password "Test@123456"
    Then the response status code should be 201
    And the response body should contain "access_token"
    And the response body should contain "refresh_token"

  Scenario: Login with invalid password
    Given there is a user with email "admin@teste.com" and password "Test@123456"
    When I request POST /api/v1/auth/login with email "admin@teste.com" and password "SenhaErrada"
    Then the response status code should be 401
    And the response body should contain "message"

  Scenario: Get logged user data
    Given I login with email "admin@teste.com" and password "Test@123456"
    And I store the logged user ID
    When I request GET /api/v1/auth/me with valid token
    Then the response status code should be 200
    And the response body should contain "email" with value "admin@teste.com"
