# fragments

Lab 1 CCP555/2025F: Fragments back-end API

## Github Commands

$ git status : Determine all the files that have changed

$ git add : Add changes from the working directory to the staging area

$ git commit -m "[message]" : Saves repository changes on local. Captures a snapshot of the project's currently staged changes

## Lint

$ npm run lint : Makes sure there are no errors that need to be fixed

## Test/Run Server

$ node src/server.js : Test that the server can be started manually on the browser

$ curl.exe localhost:8080 (In PowerShell) : Runs the server on PowerShell

$ curl.exe -s localhost:8080 | jq (In PowerShell) : Fetches JSON from the local server and the 'jq' formats it nicely for easier to read. -s silents to have no error messages.

$ curl.exe -i localhost:8080 (In PowerShell) : Includes response headers with the body which sees extra info (metadata) before the actual response.

$ npm start : Standard command to start the app in production mode

$ npm run dev : Starts the app in development mode. Often uses tools that helps reloads the app automatically when you change the code.

$ npm run debug Starts the app with debugging enabled. Lets you attach a debugger to step through the code
