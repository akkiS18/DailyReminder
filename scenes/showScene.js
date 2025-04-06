const { Scenes, Markup } = require("telegraf");
const { readData, removeData, editData } = require("../services/fileService");
const welcomeText = require("../texts/welcomeText");
const aboutText = require("../texts/aboutText");

const showScene = new Scenes.WizardScene(
	"showScene",
	async (ctx) => {
		const readingDataPlan = await readData("./data/plan-data.json");
		const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);

		if (findMe?.data.length > 0) {
			const text = `📌 G'oyalar va fikrlar:\n\n${findMe.data
				.map((item, index) => `${index + 1}. ${item}`)
				.join("\n\n")}`;
			ctx.reply(
				text,
				Markup.inlineKeyboard([
					[
						Markup.button.callback("✏️ O'zgartirish", "edit"),
						Markup.button.callback("🗑️ O'chirish", "delete"),
					],
					[Markup.button.callback("🔙 Ortga", "back")],
				])
			);
			return ctx.wizard.next();
		} else {
			ctx.reply(
				"💡 Sizda hozircha hech qanday g‘oya yoki fikr yo‘q! Yangi fikr kelganida bemalol yozib qo‘ying – men uni saqlab qo‘yaman! 😉"
			);
			return ctx.scene.leave();
		}
	},

	// FIRST PART
	async (ctx) => {
		if (ctx.message?.text === "/start") {
			ctx.reply(welcomeText);
			return ctx.scene.leave();
		}
		if (ctx.message?.text === "/bot_haqida") {
			ctx.reply(aboutText);
			return ctx.scene.leave();
		}

		const data = ctx.callbackQuery?.data;
		const readingDataPlan = await readData("./data/plan-data.json");
		const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);

		const buttons = findMe.data.map((_, index) =>
			Markup.button.callback(`${index + 1}`, `${index + 1}`)
		);

		const chunkedButtons = [];
		for (let i = 0; i < buttons.length; i += 3) {
			chunkedButtons.push(buttons.slice(i, i + 3));
		}

		if (!data) return;

		await ctx.answerCbQuery();

		if (data === "edit") {
			await ctx.reply(
				"✏️ Qaysi fikrni o‘zgartirmoqchisiz?",
				Markup.inlineKeyboard(chunkedButtons)
			);
			return ctx.wizard.next();
		}

		if (data === "delete") {
			await ctx.reply(
				"🗑️ Qaysi fikrni o‘chirmoqchisiz?",
				Markup.inlineKeyboard(chunkedButtons)
			);
			return ctx.wizard.selectStep(4);
		}

		if (data === "back") {
			await ctx.reply("🔙 Bosh menyuga qaytdik");
			return ctx.scene.leave();
		}
	},

	// EDIT PART 1
	async (ctx) => {
		if (ctx.message?.text === "/start") {
			ctx.reply(welcomeText);
			return ctx.scene.leave();
		}
		if (ctx.message?.text === "/bot_haqida") {
			ctx.reply(aboutText);
			return ctx.scene.leave();
		}

		const data = ctx.callbackQuery?.data;
		const readingDataPlan = await readData("./data/plan-data.json");
		const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);
		const findData = findMe.data.filter((_, index) => index === data - 1);

		await ctx.answerCbQuery();

		if (findData.length > 0) {
			ctx.reply(`Eslatma:\n ${findData[0]}\n\no'zgartirib qayta jo'nating`);
			ctx.wizard.state.someData = data;
			return ctx.wizard.next();
		}
	},

	// EDIT PART 2
	async (ctx) => {
		if (ctx.message?.text === "/start") {
			ctx.reply(welcomeText);
			return ctx.scene.leave();
		}
		if (ctx.message?.text === "/bot_haqida") {
			ctx.reply(aboutText);
			return ctx.scene.leave();
		}

		const data = ctx.wizard.state.someData;

		const res = await editData(
			"./data/plan-data.json",
			ctx.message.text,
			ctx.from.id,
			data
		);

		await ctx.reply(res);

		if (res) {
			const readingDataPlan = await readData("./data/plan-data.json");
			const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);

			const text = `📌 G'oyalar va fikrlar:\n\n${findMe?.data
				.map((item, index) => `${index + 1}. ${item}`)
				.join("\n\n")}`;

			await ctx.reply(
				text,
				Markup.inlineKeyboard([
					[
						Markup.button.callback("✏️ O'zgartirish", "edit"),
						Markup.button.callback("🗑️ O'chirish", "delete"),
					],
					[Markup.button.callback("🔙 Ortga", "back")],
				])
			);
		}

		return ctx.wizard.selectStep(1);
	},

	// DELETE PART
	async (ctx) => {
		if (ctx.message?.text === "/start") {
			ctx.reply(welcomeText);
			return ctx.scene.leave();
		}
		if (ctx.message?.text === "/bot_haqida") {
			ctx.reply(aboutText);
			return ctx.scene.leave();
		}

		const data = ctx.callbackQuery?.data;
		const readingDataPlan = await readData("./data/plan-data.json");
		const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);

		await ctx.answerCbQuery();

		if (findMe?.data.length > 0) {
			const res = await removeData("./data/plan-data.json", data, ctx.from.id);
			ctx.reply(res);
		}

		const readingDataPlan2 = await readData("./data/plan-data.json");
		const findMe2 = readingDataPlan2.find((i) => i.id === ctx.from.id);

		if (findMe2?.data.length > 0) {
			const text = `📌 G'oyalar va fikrlar:\n\n${findMe2?.data
				.map((item, index) => `${index + 1}. ${item}`)
				.join("\n\n")}`;

			ctx.reply(
				text,
				Markup.inlineKeyboard([
					[
						Markup.button.callback("✏️ O'zgartirish", "edit"),
						Markup.button.callback("🗑️ O'chirish", "delete"),
					],
					[Markup.button.callback("🔙 Ortga", "back")],
				])
			);

			return ctx.wizard.selectStep(1);
		} else {
			ctx.reply(
				"💡 Sizda hozircha hech qanday g‘oya yoki fikr yo‘q! Yangi fikr kelganida bemalol yozib qo‘ying – men uni saqlab qo‘yaman! 😉"
			);

			return ctx.scene.leave();
		}
	}
);

module.exports = { showScene };
