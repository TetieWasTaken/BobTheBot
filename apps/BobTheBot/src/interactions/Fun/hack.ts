import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import fs from "fs";

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hack")
    .setDescription("Hacks a user (fake)")
    .addUserOption((option) => option.setName("target").setDescription("user to target").setRequired(true))
    .setDMPermission(true),
  cooldownTime: 10 * 1000,
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("target");

    if (!user) return interaction.reply({ content: "Something went wrong, try again", ephemeral: true });

    if (user.bot) {
      return interaction.reply({
        content: ":wrench: You can't hack bots!",
        ephemeral: true,
      });
    }
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: ":wrench: Did you just try to hack yourself?!",
        ephemeral: true,
      });
    }
    await interaction.reply({
      content: `:computer: Hacking <@${user.id}>...`,
    });

    const emailTxt = fs.readFileSync("./resources/hackdocs/emailextensions.txt").toString().split("\n");
    const passwordsTxt = fs.readFileSync("./resources/hackdocs/passwords.txt").toString().split("\n");
    const randomNum = Math.floor(Math.random() * 100);

    const randomEmail = emailTxt[randomNum];
    const randomPassword = passwordsTxt[randomNum];

    const username = user.username;

    const replyArray = [
      ":e_mail: Finding email... `12,5%`",
      `:e_mail: Email found! \`${username.replace(/\s/g, "")}${randomEmail}\` \`25%\``,
      ":asterisk: Finding password... `37,5%`",
      `:asterisk: Password found! \`${randomPassword}\` \`50%\``,
      ":keyboard: Logging in... `62,5%`",
      ":keyboard: Logged in! `75%`",
      ":money_with_wings: Finding bank details... `86,5%`",
      `:money_with_wings: Bank details found! Email: \`${
        (username.replace(/\s/g, ""), randomEmail)
      }\` Password: \`${randomPassword}\` \`100%\``,
      `:computer: <@${user.id}> has been hacked!`,
    ];
    let i = 0;
    let replyInterval = setInterval(() => {
      if (i < replyArray.length) {
        let editReplyMessage = [replyArray[i]].toString();
        interaction.editReply({
          content: editReplyMessage,
        });
        i++;
      } else {
        clearInterval(replyInterval);
      }
    }, 2500);

    return;
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
