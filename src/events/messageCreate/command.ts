import { Message } from "discord.js";
import { renderProduct } from "../../utils/components.js";

export default async (message: Message) => {
  try {
    if (!message.guild) return;

    const { content } = message;

    const [command, ...args] = content.split(" ");
    if (command !== "!check_card") return;

    // Find index where card number starts (starts with digit)
    const numberIndex = args.findIndex((arg) => /^\d/.test(arg));

    let cardName = "";
    let cardNumber = "";

    if (numberIndex === -1) {
      // No number provided → everything is name
      cardName = args.join(" ");
    } else {
      cardName = args.slice(0, numberIndex).join(" ");
      cardNumber = args[numberIndex];
    }

    console.log("Card Name:", cardName);
    console.log("Card Number:", cardNumber);

    const url = `${process.env.TCGGO_API_BASE_URL}/pokemon/cards/search?name=${cardName}&rapidapi-key=${process.env.TCGGO_API_KEY}${cardNumber ? `&card_number=${cardNumber}` : ""}&sort=relevance`;

    console.log(url);

    const res = await fetch(url, {
      method: "GET",
    });

    console.log(res);

    const data = await res.json();
    console.log(data);

    const card = data.data.find(
      (d: any) => d.name.toLowerCase() === cardName.toLowerCase(),
    );

    if (!card) return await message.reply("No card found with that name!");

    const prices = card.prices.cardmarket;

    if (prices.currency !== "EUR")
      return await message.reply("Could not find the EU price for this card!");

    await renderProduct(message, card);
  } catch (error) {
    console.error(error);
  }
};
