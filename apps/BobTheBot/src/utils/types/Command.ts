import type {
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  Locale,
} from "discord.js";

type BaseApplicationCommandOption = {
  channel_types?: ChannelType[];
  choices?: ApplicationCommandOptionChoiceData[];
  description: string;
  description_localizations?: Record<Locale, string>;
  max_length?: number;
  max_value?: number;
  min_length?: number;
  min_value?: number;
  name: string;
  name_localizations?: Record<Locale, string>;
  options?: ApplicationCommandOption[];
  required?: boolean;
};

type ApplicationCommandOption =
  | (BaseApplicationCommandOption & {
      autocomplete?: false;
      type: ApplicationCommandOptionType;
    })
  | (BaseApplicationCommandOption & {
      autocomplete?: true;
      type:
        | ApplicationCommandOptionType.Integer
        | ApplicationCommandOptionType.Number
        | ApplicationCommandOptionType.String;
    });

/**
 * Type for a command.
 *
 * For consistency, default_member_permissions and dm_permission is required
 *
 * @experimental
 * @example
 * ```ts
 * const ExampleCommand: Command = {
 *  name: "example",
 * description: "This is an example command",
 * options: [
 *     {
 *       name: "example",
 *       description: "This is an example option",
 *       type: 3,
 *       required: true,
 *     },
 *   ],
 * default_member_permissions: "0",
 * dm_permission: true,
 * } as const;
 * ```
 */
export type Command = {
  default_member_permissions: string | undefined;
  description: string;
  description_localizations?: Record<Locale, string>;
  dm_permission: boolean;
  name: string;
  name_localizations?: Record<Locale, string>;
  nsfw?: boolean;
  options?: ApplicationCommandOption[];
  type?: ApplicationCommandType;
};
