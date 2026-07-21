@regression @api @usuarios
Feature: Users
  As an authenticated user
  I want to manage system users
  So that I can administer access

  Scenario: List users without authentication returns 401
    When I request GET /api/v1/core/usuarios
    Then the response status code should be 401

  Scenario: List users authenticated
    Given I login with email "admin@teste.com" and password "Test@123456"
    When I request GET /api/v1/core/usuarios authenticated
    Then the response status code should be 200
    And the response body should be an array

  Scenario: Get logged user by ID
    Given I login with email "admin@teste.com" and password "Test@123456"
    And I store the logged user ID
    When I request the stored user authenticated
    Then the response status code should be 200
    And the response body should contain "email" with value "admin@teste.com"
