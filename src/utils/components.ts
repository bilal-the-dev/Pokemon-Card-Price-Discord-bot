import fetch from "node-fetch";
import {
  AttachmentBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MediaGalleryBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";

export async function downloadImage(url: string, filename = "image.png") {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to download image");
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  return {
    attachment: new AttachmentBuilder(buffer, { name: filename }),
    url: `attachment://${filename}`,
  };
}

type RenderType = "card" | "product";

export async function renderProduct(
  target: Message,
  card: any,
  type: RenderType = "card",
) {
  const imageData = await downloadImage(card.image, "image.png");

  const image = new MediaGalleryBuilder().addItems([
    {
      media: {
        url: imageData.url,
      },
    },
  ]);

  const title = new TextDisplayBuilder().setContent(
    `## [${card.name}](${card.tcggo_url})`,
  );

  const isCard = type === "card";

  const priceValue = isCard
    ? card.prices.cardmarket.lowest_near_mint
    : card.prices.cardmarket.lowest_EU_only;

  const mainInfo = new TextDisplayBuilder().setContent(
    isCard
      ? `**Rarity:** ${card.rarity}
**HP:** ${card.hp}
**Type:** ${card.supertype}
**🇬🇧 Card Market Low Price:** ${priceValue} €`
      : `**Set:** ${card.episode.name}
**Code:** ${card.episode.code}
**Release:** ${card.episode.released_at}
**🇬🇧 Card Market Low Price:** ${priceValue} €`,
  );

  const separator = new SeparatorBuilder()
    .setDivider(true)
    .setSpacing(SeparatorSpacingSize.Large);

  const container = new ContainerBuilder()
    .addMediaGalleryComponents(image)
    .addSeparatorComponents(separator)
    .addTextDisplayComponents(title)
    .addTextDisplayComponents(mainInfo);

  await target.reply({
    components: [container],
    files: [imageData.attachment],
    flags: MessageFlags.IsComponentsV2,
  });
}
