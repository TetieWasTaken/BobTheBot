/**
 * Constant color values for use in embeds
 *
 * @readonly
 * @example
 * ```
 * import { EmbedBuilder } from 'discord.js';
 * import { Color } from './constants.js';
 * // ...
 * const successEmbed = new EmbedBuilder()
 *  .setColor(Color.DiscordSuccess)
 *  .setTitle('Success!')
 *
 * const warningEmbed = new EmbedBuilder()
 *  .setColor(Color.DiscordWarning)
 *  .setTitle('Warning!')
 * ```
 */
export const enum Color {
  DiscordSuccess = 0x57f287, // green
  DiscordWarning = 0xfee75c, // yellow
  DiscordDanger = 0xed4245, // red
  DiscordPrimary = 0x5865f2, // blurple
  DiscordEmbedBackground = 0x2f3136, // jet/dark grey
  DiscordGem = 0xeb459e, // fuchsia
}
