# Test posting a JSON fragment and retrieving it
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

{
  "name": "test",
  "value": 123,
  "active": true,
  "tags": ["hurl", "integration", "test"]
}

HTTP/1.1 201
[Captures]
url: header "Location"
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 97

# Verify the JSON fragment can be retrieved with correct content
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
Content-Length: 102
[Asserts]
jsonpath "$.name" == "test"
jsonpath "$.value" == 123
jsonpath "$.active" == true
jsonpath "$.tags" count == 3
jsonpath "$.tags[0]" == "hurl"
jsonpath "$.tags[1]" == "integration"
jsonpath "$.tags[2]" == "test"