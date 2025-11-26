#Should pass if this link returns a 404 error
GET http://localhost:8080/this-route-does-not-exist
HTTP/1.1 404
