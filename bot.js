const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");

const bot = new Telegraf("7138667594:AAHOPSZOKYf0pmy0P-aq8M4vrFcct1Wtk80");

bot.telegram.setMyCommands([
	{ description: "Start", command: "start" },
	{ description: "Change time for daily", command: "change" },
]);

let currentStatus = 0;
const hour = 12;
let reminderTime = hour * 60 * 60 * 1000;

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

// Kundalik mayda chuyda ishlarni eslatishi. Bir marta eslatgandan keyin datadan o'chsin
// Rejalarni yoki idealarni yozib qoyishim va uni soraganimda qaytarishi

// Kundalikni qancha vaqtdan keyin eslatishimni sorasin

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
		`Assalomu alaykum ${ctx.from.first_name}. Qayerni gullatamiz bugun. Menga ish bormi?`,
		Markup.keyboard([
			["🌅 Daily"],
			["📝 Plans or Ideas"],
			["📜 Give me my plans"],
		]).resize()
	);
	currentStatus = 0;
});

bot.command("change", (ctx) => {
	currentStatus = 4;

	ctx.reply("Necha soatdan keyin eslatay hay?");
});

bot.on("message", async (ctx) => {
	const msg = ctx.message.text;
	const readingDataDaily = await readData("./daily-data.json");
	const readingDataPlan = await readData("./plan-data.json");

	if (currentStatus === 0) {
		if (msg === "🌅 Daily") {
			ctx.reply("Marhamat yozing togo. Nimani eslatishim kerak?");
			currentStatus = 1;
		} else if (msg === "📝 Plans or Ideas") {
			currentStatus = 2;
			ctx.reply(
				"Jiddiy ishmi? Qanaqa plan bor. Yoki idea keb qoldimi miyachaga"
			);
		} else if (msg === "📜 Give me my plans") {
			const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);

			if (findMe?.data.length > 0) {
				const text = `📝 ${findMe.data.join("\n\n")}`;
				ctx.reply(`📌 Your plans or ideas:\n\n${text}`);
			}
		}
	} else if (currentStatus === 1) {
		const findMe = readingDataDaily.find((i) => i.id === ctx.from.id);
		const index = readingDataDaily.findIndex((i) => i.id === ctx.from.id);

		if (findMe) {
			const data = findMe.data;

			readingDataDaily[index] = { id: findMe.id, data: [...data, msg] };
			await writeData("./daily-data.json", readingDataDaily);

			ctx.reply("Boldi tm eslab qoldim bro ✌🏻");

			if (findMe?.data.length > 0) {
				const text = `📝 ${findMe.data.join("\n\n")}`;
				setTimeout(() => {
					bot.telegram.sendMessage(
						ctx.from.id,
						`📌 Your daily routine:\n\n${text}`
					);
					writeData("./daily-data.json", []);
				}, reminderTime);
			}
			currentStatus = 0;
		}
	} else if (currentStatus === 2) {
		const findMe = readingDataPlan.find((i) => i.id === ctx.from.id);
		const index = readingDataPlan.findIndex((i) => i.id === ctx.from.id);

		if (findMe) {
			const data = findMe.data;

			readingDataPlan[index] = { id: findMe.id, data: [...data, msg] };
			await writeData("./plan-data.json", readingDataPlan);

			ctx.reply("Planni qichchuviku 😁. Saqlab qoydim ✅");
			currentStatus = 0;
		}
	} else if (currentStatus === 4) {
		if (!isNaN(+msg)) {
			hour = +msg;
		} else {
			console.log("Bu number emas!");
		}
		currentStatus = 0;
	}
	console.log(currentStatus);
});

bot.launch();
