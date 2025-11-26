# Test posting a fragment without authentication produces 401 error
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
```
This is test content without authentication
```

HTTP 401
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.error.message" contains "Unauthorized"