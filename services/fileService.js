const fs = require("fs");

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

const removeData = async (path, index, id) => {
	const data = await readData(path);
	const findMe = await data.find((i) => i.id == id);

	if (findMe?.data.length > 0) {
		const newData = await findMe.data.filter((_, i) => i != index - 1);
		const newMe = { ...findMe, data: newData };
		const lastVersion = data.map((i) => (i.id === newMe.id ? newMe : i));

		// console.log(newData);
		try {
			await fs.promises.writeFile(path, JSON.stringify(lastVersion, null, 2));
			console.log("ITEM REMOVED SUCCESSFULLY");
			return `${index} raqamli eslatma o'chirildi 🗑️`;
		} catch (error) {
			console.log("REMOVE DATA THROUGH INDEX ERROR:", error.message);
			return "Xatolik! Iltimos to'g'ri sonni tanlaganinggizni tekshirib, qayta urinib ko'ring";
		}
	}
};

const editData = async (path, text, id, index) => {
	const data = await readData(path);
	const findMe = await data.find((i) => i.id == id);

	if (findMe?.data.length > 0) {
		findMe.data[index - 1] = text;
		const lastVersion = data.map((i) => (i.id === findMe.id ? findMe : i));

		try {
			await fs.promises.writeFile(path, JSON.stringify(lastVersion, null, 2));
			console.log("ITEM EDITED SUCCESSFULLY");
			return `${index} raqamli eslatma o'zgartirildi ✏️`;
		} catch (error) {
			console.log("EDIT DATA THROUGH INDEX ERROR:", error.message);
			return "Xatolik! Iltimos to'g'ri sonni tanlaganinggizni tekshirib, qayta urinib ko'ring";
		}
	}
};

const changeTime = async (time, id) => {
	const data = await readData("./data/daily-data.json");
	const findMe = await data.find((i) => i.id == id);
	const newMe = { ...findMe, time: time };
	const lastVersion = data.map((i) => (i.id === newMe.id ? newMe : i));
	const hour = time.padStart(2, "0");
	
	try {
		await fs.promises.writeFile(
			"./data/daily-data.json",
			JSON.stringify(lastVersion, null, 2)
		);
		console.log("TIME CHANGED SUCCESSFULLY");
		return `Vaqt o'zgartirildi. \nHar kuni eslatiladigan xabarlar vaqti: ${hour}:00`;
	} catch (error) {
		console.log("CHANGE TIME ERROR", error);
		return "Xatolik! Iltimos qayta urinib ko'ring";
	}
};

module.exports = { readData, writeData, removeData, editData, changeTime };
