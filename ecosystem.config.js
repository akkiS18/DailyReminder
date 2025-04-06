module.exports = {
	apps: [
		{
			name: "reminder", 
			script: "./bot.js",
			env: {
				TZ: "Asia/Tashkent", 
			},
		},
	],
};
