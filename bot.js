const { Telegraf, Scenes, session, Markup } = require("telegraf");

const welcomeText = require("./texts/welcomeText");
const aboutText = require("./texts/aboutText");
const { readData, writeData } = require("./services/fileService");
const { dailyScene } = require("./scenes/dailyScene");
const { plansScene } = require("./scenes/plansScene");
const { showScene } = require("./scenes/showScene");
const { settingScene } = require("./scenes/settingScene");
const { sendDailyReminders } = require("./services/scheduler");

const bot = new Telegraf("6684407456:AAHJDFWwJOICM62l1nJC-9ZOOOz55DfMMqk"); //7138667594:AAHOPSZOKYf0pmy0P-aq8M4vrFcct1Wtk80

// Sahna va session middleware qo'shish
const stage = new Scenes.Stage([
	dailyScene,
	plansScene,
	showScene,
	settingScene,
]);

bot.use(session());
bot.use(stage.middleware());

bot.telegram.setMyCommands([
	{ description: "Start", command: "start" },
	{ description: "Bot haqida", command: "bot_haqida" },
]);

// Start Command
bot.command("start", async (ctx) => {
	const readingDataDaily = await readData("./data/daily-data.json");
	const readingDataPlan = await readData("./data/plan-data.json");
	const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);

	if (!findMe) {
		await writeData("./data/daily-data.json", [
			...readingDataDaily,
			{ id: ctx.from.id, data: [], time: "8" },
		]);
		await writeData("./data/plan-data.json", [
			...readingDataPlan,
			{ id: ctx.from.id, data: [] },
		]);
	}

	ctx.reply(
		welcomeText,
		Markup.keyboard([
			["🌅 Har kuni"],
			["📝 G'oya yoki fikrlar"],
			["👀 Ko'rish", "⚙️ Sozlash"],
		]).resize()
	);
});

bot.command("bot_haqida", (ctx) => {
	ctx.replyWithMarkdownV2(aboutText);
});

bot.hears("🌅 Har kuni", (ctx) => ctx.scene.enter("dailyScene"));
bot.hears("📝 G'oya yoki fikrlar", (ctx) => ctx.scene.enter("plansScene"));
bot.hears("👀 Ko'rish", (ctx) => ctx.scene.enter("showScene"));
bot.hears("⚙️ Sozlash", (ctx) => ctx.scene.enter("settingScene"));

sendDailyReminders(bot);

bot.launch();

// Rejalarni yoki idealarni yozib qoyishim va uni soraganimda qaytarishi = 1

// Kundalikni har kuni qaysi vaqtda eslatishini o'rnatish kerak = 1

// Har bir kundalik xabar har kuni nechchida eslatilishini belgilash mumkin bo'lsin

// Rejani ham kundalikni ham edit qilish mumkin bo'lsin

// zanjir uchun kutubxona qidirish = 1
