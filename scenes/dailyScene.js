const { Scenes } = require("telegraf");
const { readData, writeData } = require("../services/fileService");
const welcomeText = require("../texts/welcomeText");
const aboutText = require("../texts/aboutText");

const dailyScene = new Scenes.WizardScene(
	"dailyScene",
	async (ctx) => {
		ctx.reply(
			"📌 Har kuni eslatilishi kerak bo‘lgan xabarni shu yerga yozing."
		);
		return ctx.wizard.next();
	},
	async (ctx) => {
		if (ctx.message.text === "/start") {
			ctx.reply(welcomeText);
			return ctx.scene.leave();
		}
		if (ctx.message.text === "/bot_haqida") {
			ctx.reply(aboutText);
			return ctx.scene.leave();
		}

		const msg = ctx.message.text;
		const readingDataDaily = await readData("./data/daily-data.json");
		const user = readingDataDaily.find((i) => i.id === ctx.from.id);
		const index = readingDataDaily.findIndex((i) => i.id === ctx.from.id);

		if (user) {
			user.data.push(msg);
			readingDataDaily[index] = user;

			await writeData("./data/daily-data.json", readingDataDaily);
			ctx.reply(
				`✅ Xabar saqlandi! Endi har kuni ${user.time}:00 da eslatiladi.`
			);
		}
		return ctx.scene.leave();
	}
);

module.exports = { dailyScene };
