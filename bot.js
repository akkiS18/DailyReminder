const { Telegraf, Scenes, session, Markup } = require("telegraf");
const fs = require("fs");
const schedule = require("node-schedule");

const bot = new Telegraf("7138667594:AAHOPSZOKYf0pmy0P-aq8M4vrFcct1Wtk80");

bot.telegram.setMyCommands([
	{ description: "Start", command: "start" },
	{ description: "Bot haqida", command: "bot_haqida" },
]);

const welcomeText = `
🤖 *Assalomu alaykum*  

Men – *DailyReminder* botman 📅  
Sizga har kuni *kunlik rejalarni* eslatib turaman va *g‘oya yoki fikrlaringizni* yozib qo‘yib, keyinchalik qayta ko‘rish imkoniyatini beraman  

📝 Mening yordamim bilan muhim narsalarni unutib qo‘ymaysiz 🚀  
`;

const aboutBotText = `
🤖 *Bot haqida*  

Bu bot sizning *shaxsiy yordamchingiz\\!* 📝 Kunlik rejalar va eslatmalarni saqlaydi, o‘z vaqtida eslatadi\\.  

🔹 *Mavjud funksiyalar:*  
✅ *G'oyalarni yoki idealarni yozish va keyin olish*  
✅ *Kundalik eslatmalarni saqlash*  
✅ *Har bir kundalik xabarni aniq soatda eslatish*  

🔜 *Yaqin orada qo‘shiladigan funksiyalar:*  
🚀 *G'oyalarni va kundalik eslatmalarni tahrirlash*  

🛠 Taklif yoki muammolar bo‘lsa, @S18\\_2003 ga yozing\\! 😊
`;

const readData = async (path) => {
	try {
		const read = await fs.promises.readFile(path, "utf8");
		return JSON.parse(read);
	} catch (error) {
		console.log("READ FILE ERROR:", error.message);
		return [];
	}
};

const writeData = async (path, data) => {
	try {
		await fs.promises.writeFile(path, JSON.stringify(data, null, 2));
		console.log("WRITE SUCCESS");
	} catch (error) {
		console.log("WRITE FILE ERROR:", error.message);
	}
};

// 🌅 Daily Scene
const dailyScene = new Scenes.WizardScene(
	"dailyScene",
	async (ctx) => {
		ctx.reply(
			"📌 Har kuni eslatilishi kerak bo‘lgan xabarni shu yerga yozing."
		);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const msg = ctx.message.text;
		const readingDataDaily = await readData("./daily-data.json");
		const findMe = readingDataDaily.find((i) => i.id === ctx.from.id);
		const index = readingDataDaily.findIndex((i) => i.id === ctx.from.id);

		if (findMe) {
			findMe.data.push(msg);
			readingDataDaily[index] = findMe;
			await writeData("./daily-data.json", readingDataDaily);
			ctx.reply(
				"✅ Xabarni saqladim! Endi har kuni ertalab 08:00 da sizga eslatib turaman. ⏰"
			);
		}
		return ctx.scene.leave();
	}
);

// 📝 Plans Scene
const plansScene = new Scenes.WizardScene(
	"plansScene",
	async (ctx) => {
		ctx.reply("📝 Marhamat, yozib qoldiring – men eslab qolaman!");
		return ctx.wizard.next();
	},
	async (ctx) => {
		const msg = ctx.message.text;
		const readingDataPlan = await readData("./plan-data.json");
		const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);
		const index = readingDataPlan.findIndex((i) => i.id === ctx.from.id);

		if (findMe) {
			findMe.data.push(msg);
			readingDataPlan[index] = findMe;
			await writeData("./plan-data.json", readingDataPlan);
			ctx.reply("🎉 Ajoyib! Xabaringizni muvaffaqiyatli saqladim. ✅");
		}
		return ctx.scene.leave();
	}
);

// Sahna va session middleware qo'shish
const stage = new Scenes.Stage([dailyScene, plansScene]);
bot.use(session());
bot.use(stage.middleware());

// Start Command
bot.command("start", async (ctx) => {
	const readingDataDaily = await readData("./daily-data.json");
	const readingDataPlan = await readData("./plan-data.json");
	const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);

	if (!findMe) {
		await writeData("./daily-data.json", [
			...readingDataDaily,
			{ id: ctx.from.id, data: [] },
		]);
		await writeData("./plan-data.json", [
			...readingDataPlan,
			{ id: ctx.from.id, data: [] },
		]);
	}

	ctx.reply(
		welcomeText,
		Markup.keyboard([
			["🌅 Kunlik"],
			["📝 G'oya yoki fikrlar"],
			["📜 G'oya va fikrlarni ko'rish"],
		]).resize()
	);
});

bot.command("bot_haqida", (ctx) => {
	ctx.replyWithMarkdownV2(aboutBotText);
});

bot.hears("🌅 Kunlik", (ctx) => ctx.scene.enter("dailyScene"));
bot.hears("📝 G'oya yoki fikrlar", (ctx) => ctx.scene.enter("plansScene"));

// 📜 G'oyalarni ko‘rsatish
bot.hears("📜 G'oya va fikrlarni ko'rish", async (ctx) => {
	const readingDataPlan = await readData("./plan-data.json");
	const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);

	if (findMe?.data.length > 0) {
		const text = `📌 G'oyalar va fikrlar:\n\n${findMe.data
			.map((item, index) => `${index + 1}. ${item}`)
			.join("\n\n")}`;
		ctx.reply(text);
	} else {
		ctx.reply(
			"💡 Sizda hozircha hech qanday g‘oya yoki fikr yo‘q! Yangi fikr kelganida bemalol yozib qo‘ying – men uni saqlab qo‘yaman! 😉"
		);
	}
});

schedule.scheduleJob("0 8 * * *", async () => {
	const readingDataDaily = await readData("./daily-data.json");

	for (const user of readingDataDaily) {
		if (user.data.length > 0) {
			const text = `📌 Sizning kundalik eslatmalaringiz:\n\n${user.data
				.map((item, index) => `${index + 1}. ${item}`)
				.join("\n\n")}`;
			bot.telegram.sendMessage(user.id, text).catch((err) => {
				console.log(`Failed to send message to ${user.id}:`, err.message);
			});
		}
	}

	console.log("📢 Daily reminders sent at 08:00 AM");
});

bot.launch();

// Rejalarni yoki idealarni yozib qoyishim va uni soraganimda qaytarishi = 1

// Kundalikni har kuni qaysi vaqtda eslatishini o'rnatish kerak = 1

// Har bir kundalik xabar har kuni nechchida eslatilishini belgilash mumkin bo'lsin

// Rejani ham kundalikni ham edit qilish mumkin bo'lsin

// zanjir uchun kutubxona qidirish = 1
