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

# 👽 About

Bob The Bot is a simple, competitive, community driven [Discord.js](https://github.com/discordjs) bot.

#### WARNING: THIS BOT IS NOT DONE YET! THIS BOT IS NOT BEING HOSTED, DO NOT EXPECT THE BOT TO RESPOND.

## Adding this bot to your discord server

1: Paste this link in your browser <br />
`https://discord.com/api/oauth2/authorize?client_id=1036359071508484237&permissions=8&scope=bot%20applications.commands`

2: Select the server you want to add the bot to <br />
![Image failed to load][serverselect]

3: Click 'Continue', and then 'Authorise'

[serverselect]: docs/step_2.png "Select the server"

# 📦 How to build

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

###### If you're using this software, please follow the terms of the [Apache License below](#%EF%B8%8F-license)

<!--Title start
This template is licensed under the MIT license (https://choosealicense.com/licenses/mit/).
The MIT License is a permissive open-source license that allows you to use this template for any purpose, including commercial purposes, as long as you include a copy of the license and retain the copyright notice. You can also modify and distribute the template, as long as you include the same license and copyright notice as the original template. You are not required to share your modifications or derivative works with others. You are free to use this template in your own projects without any limitations.

NOTE: This template is licensed under the MIT license. The software itselfs under the Apache License V2.0.
Title end-->

<!--Start template-->

# ⚖️ License

This work is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

<!--Alternatively, you can link it to your LICENSE file-->

To use this work in your projects, you must follow the Apache License v2.0 terms.

Summarized,

- You must include a copy of the license in any distribution of the software.
- You must provide clear attribution to the original authors of the software.
- If you modify the software, you must include a notice stating that you have made changes to the original software.
- If you distribute the software, you must include a disclaimer of warranties.

###### Not sure how to attribute? You can include a copy of the [License](https://github.com/UndefinedToast/BobTheBot/blob/main/LICENSE.md) in your software or you can copy the text below into your readme.md file.
```
###### ❤️ [@UndefinedToast](https://github.com/UndefinedToast)/[BobTheBot](https://github.com/UndefinedToast/BobTheBot) - [Apache License 2.0](https://github.com/UndefinedToast/BobTheBot/blob/main/LICENSE.md)
```

## What is the Apache License 2.0?

The Apache 2.0 License is a permissive open-source license that allows the use, modification, and distribution of software and intellectual property. It allows users to use the software for any purpose, including commercial purposes, as long as they include a copy of the license and retain the copyright notice. The Apache 2.0 License also allows users to distribute modified versions of the software, as long as they include the same license and copyright notice as the original software. In addition, users must also include a copy of the Apache 2.0 License with any distribution of the software, and they must also provide a copy of the Apache 2.0 License to anyone to whom they distribute the software. The Apache 2.0 License is often used for software projects that require a strong emphasis on patent protection, as it includes a patent license grant that allows users to use any patents that are necessary for using the software.

<!--End template-->
