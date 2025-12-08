# tests/integration/lab-9-s3.hurl
# 1. POST a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`

# Confirm that the server returns a 201
HTTP/1.1 201

# Capture the Location header value to a variable named url
[Captures]
url: header "Location"

# 2. GET the fragment you just created using the url
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns a 200
HTTP/1.1 200
# Confirm that the type of the fragment is text/plain
Content-Type: text/plain
# Confirm that the body is equal to Hello S3!
`Hello S3!`

# 3. DELETE the fragment using the url
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns a 200
HTTP/1.1 200

# 4. Try to GET the fragment again using the url
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns a 404
HTTP/1.1 404