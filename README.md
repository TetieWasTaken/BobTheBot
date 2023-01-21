<div align="center">
	<br />
	<p>
        <p>
        <h1>
        Bob The Bot
        </h1>
		<a href="https://discord.gg/FJ5DMEb8zA"><img src="https://cdn.discordapp.com/avatars/1036359071508484237/bac39af1334b3cec9f8e727efdbc5931.webp?size=256" alt="Bob the bot" /></a>
        </p>
	</p>
</div>

## About

Bob The Bot is a simple, competitive, community driven [Discord.js](https://github.com/discordjs) bot.

# WARNING: THIS BOT IS NOT DONE YET! THIS BOT IS NOT BEING HOSTED, DO NOT EXPECT THE BOT TO RESPOND.

## Adding this bot to your discord server

1: Paste this link in your browser <br />
`https://discord.com/api/oauth2/authorize?client_id=1036359071508484237&permissions=8&scope=bot%20applications.commands`

2: Select the server you want to add the bot to <br />
![Image failed to load][serverselect]

3: Click 'Continue', and then 'Authorise'

[serverselect]: docs/step_2.png "Select the server"

## How to build

If you want to use this code in your own project/bot, you can follow the steps below.
This guide does not include how to set up your bot, you can follow [this guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#setting-up-a-bot-application) for more information

1. Clone this repository using the following command: `git clone https://github.com/UndefinedToast/BobTheBot.git`.
2. Run `npm install` to install all the required dependencies.
3. Add a .env file in the root with the following;

```
BOT_TOKEN = <YOUR_BOT_TOKEN>
MONGO_DATABASETOKEN = <mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<CONNECTION_URL>?retryWrites=true&w=majority>
WEATHER_API_KEY = <YOUR_OPENWEATHERMAP_API_KEY>
ENV = production
```

To configure your bot locally, you need to remove `ENV = production` and add: `GUILD_ID = <YOUR_LOCAL_GUILD_ID>`

4. Run `npm run start` or `node master.js` and the bot should be up and running!

###### Please keep the LICENSE.md file in your project, or show any other kind of attribution to this repository!
