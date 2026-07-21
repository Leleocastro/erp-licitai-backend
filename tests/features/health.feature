@smoke @api @health
Feature: Health Check
  As an API client
  I want to check the server health
  So that I can ensure the service is operational

  Scenario: Verify server health
    Given the server is running
    When I request GET /api/v1/health
    Then the response status code should be 200
    And the response body should contain "status" with value "ok"
