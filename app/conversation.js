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
		},
		{
			name: "arrivingWhatTime",
			body: "What time will you be arriving?",
			expectedResponse: Number,
		},
		{
			name: "howManyInParty",
			body: "How many people are in your party?",
			expectedResponse: Number,
		}
	]
};

module.exports = conversation;