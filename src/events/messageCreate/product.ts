import { Message } from "discord.js";
import { renderProduct } from "../../utils/components.js";

export default async (message: Message) => {
  try {
    if (!message.guild) return;

    const { content } = message;

    const [command, ...args] = content.split(" ");
    if (command !== "!check_product") return;

    const productName = args.join(" ").trim();

    const url = `${process.env.TCGGO_API_BASE_URL}/pokemon/products/search?search=${productName}&rapidapi-key=${process.env.TCGGO_API_KEY}&sort=relevance`;

    console.log(url);

    const res = await fetch(url, {
      method: "GET",
    });

    console.log(res);

    const data = await res.json();
    console.log(data);

    const card = data.data.find(
      (d: any) => d.name.toLowerCase() === productName.toLowerCase(),
    );

    if (!card) return await message.reply("No product found with that name!");

    const prices = card.prices.cardmarket;

    if (prices.currency !== "EUR")
      return await message.reply(
        "Could not find the EU price for this product!",
      );

    await renderProduct(message, card, "product");
  } catch (error) {
    console.error(error);
  }
};
