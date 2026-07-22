@regression @api @orgaos
Feature: Orgaos
  As an API client
  I want to manage orgaos (tenants)
  So that I can administer entities in the system

  Scenario: Create new orgao
    When I create a new orgao with valid data
    Then the response status code should be 201
    And the response body should contain "id"
    And the response body should contain "cnpj"

  Scenario: List orgaos
    When I request GET /api/v1/core/orgaos
    Then the response status code should be 200
    And the response body should contain "items"
    And the response body should contain "meta"

  Scenario: Get orgao without authentication
    Given there is an orgao in the database
    When I request the stored orgao
    Then the response status code should be 200
    And the response body should contain "cnpj"
