TODO

X Add test for message step that exceeds convosteps

X Add ability to save responses

X add validation to user response

X Allow for multiple conversation, this could be identified by the twilio number the number came from, or perhaps a code that the user texts to start out

X Add test to mimic post request

X bcrypt password

- Add middleware to bad user response, check to see if response is right type, return warning early rather than running it through all class methods, this will allow for cleaner code within message request class. Also should check to see if step is beyond limit in middleware so we can quickly return default response.

- Add and require phone number in convo's, use this to identify conversation

- Deploy to heroku

- Add ability to make new workflows through api

- Add api route to allow csv download

