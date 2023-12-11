# trello2obsidian

:warning: **NOTE**: This script uses Power-Up API key & tokens. See [Auth section](##Auth) for full details! :warning:

Converts your Trello boards into Obsidian Kanban Markdown files.

This isn't really ergonomic to use... check `index.ts` and update accordingly. It's relatively small.

Some considerations:

- `listHeaderCardNames` probably needs an update for your own personal situation.
- You need to set `API_KEY` and `API_TOKEN` in your environment accordingly.
  - See [Auth](##Auth) below!
- Run this with `npm run start`.
- Good luck.

## Auth
This script uses Power-Up API key/token. Follow these steps to create your own:
1. Make a Power-Up [here](https://trello.com/power-ups/admin/new).
2. Then, in your Power-Up's page, go to the API Key tab.
3. Copy the `API Key` and set the `API_KEY` environment variable to its value.
4. There should be a link available for generating a token. Click it and go through the flow.
5. You should receive a generated token after following step 4. Copy this to the `API_TOKEN` environment variable.
6. You're done!

I learned this myself from [this link](https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/). Read it and the rest of Trello docs to learn more. I am not an expert.

## Known Bugs

See [Issues](https://github.com/Utagai/trello2obsidian/issues)!
