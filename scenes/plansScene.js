const { Scenes } = require("telegraf");
const { readData, writeData } = require("../services/fileService");
const welcomeText = require("../texts/welcomeText");
const aboutText = require("../texts/aboutText");

const plansScene = new Scenes.WizardScene(
	"plansScene",
	async (ctx) => {
		ctx.reply("📝 Marhamat, yozib qoldiring – men eslab qolaman!");
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
		const readingDataPlan = await readData("./data/plan-data.json");
		const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);
		const index = readingDataPlan.findIndex((i) => i.id === ctx.from.id);

		if (findMe) {
			findMe.data.push(msg);
			readingDataPlan[index] = findMe;
			await writeData("./data/plan-data.json", readingDataPlan);
			ctx.reply("🎉 Ajoyib! Xabaringizni muvaffaqiyatli saqladim. ✅");
		}
		return ctx.scene.leave();
	}
);

module.exports = { plansScene };
