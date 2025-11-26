# Test posting a fragment with unsupported Content-Type produces 415 error
POST http://localhost:8080/v1/fragments
Content-Type: invalid/type
[BasicAuth]
user1@email.com:password1

`This is some test content with an unsupported type`

HTTP/1.1 415
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.status" == "error"
jsonpath "$.error" == "Unsupported Media Type"