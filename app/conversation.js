var conversation = {
	messages: [
		{
			name: "introStep",
			body: "hello thanks for texting us, whats you first name?",
			expectedResponse: String,
		},
		{
			name: "lastName",
			body: "cool now whats you last name",
			expectedResponse: String,
		}
	]
};

module.exports = conversation;