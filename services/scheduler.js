const schedule = require("node-schedule");
const { readData } = require("./fileService");

const sendDailyReminders = async (bot) => {
	const readingDataDaily = await readData("./data/daily-data.json");

	for (const user of readingDataDaily) {
		schedule.scheduleJob(`0 ${user.time} * * *`, async () => {
			if (user.data.length > 0) {
				const text = `📌 Sizning kundalik eslatmalaringiz:\n\n${user.data
					.map((item, index) => `${index + 1}. ${item}`)
					.join("\n\n")}`;

				bot.telegram.sendMessage(user.id, text).catch((err) => {
					console.log(
						`❌ Xatolik: ${user.id} foydalanuvchiga yuborilmadi:`,
						err.message
					);
				});
			}
			console.log("📢 Kundalik eslatmalar yuborildi.");
		});
	}
};

module.exports = { sendDailyReminders };
