import type { ChatInputCommandInteraction } from "discord.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const TestCommand = {
  name: "test",
  description: "Test command",
  default_member_permissions: "0",
  dm_permission: true,
} as const;

export function execute(interaction: ChatInputCommandInteraction) {
  interaction.reply("test");
}
