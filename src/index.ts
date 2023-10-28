import { request } from "https";
import fs from "fs/promises";
import path from "path";

const apiKey = process.env.API_KEY;
const apiToken = process.env.API_TOKEN;

// This refers to the cards that appear at the top of my lists that don't serve
// any purpose besides just aesthetically decorating each list.
const listHeaderCardNames = ["Backlog", "Design & Research", "Doing", "Done"];

type BoardResp = {
  name: string;
  id: string;
};

type ListResp = {
  name: string;
  id: string;
};

type CardResp = {
  name: string;
  idBoard: string;
  idList: string;
  desc: string;
  labels: { name: string }[];
};

type Board = {
  name: string;
  lists: List[];
};

type List = {
  name: string;
  cards: Card[];
};

type Card = {
  name: string;
  desc: string;
  labels: string[];
};

getProjects().then((boards: Board[]) => {
  const dir = "converted";
  fs.mkdir(dir, { recursive: true })
    .then(() => {
      boards.forEach((board) => {
        const markdown = generateMarkdown(board);
        const filename = path.join(dir, `${board.name}.md`);
        fs.writeFile(filename, markdown)
          .then(() => console.log(`Wrote ${filename}`))
          .catch((err) => console.error(`Error writing ${filename}: ${err}`));
      });
    })
    .catch((err) => console.error(`Error creating directory: ${err}`));
});

function generateMarkdown(board: Board): string {
  let markdown = `---\n\nkanban-plugin: basic\n\n---\n\n`;

  board.lists.forEach((list) => {
    markdown += `### ${list.name}\n\n`;

    list.cards.forEach((card) => {
      markdown += "- [ ] ";
      card.labels.forEach((label) => {
        markdown += `#${label.toLowerCase().replace(/\s/g, "-")} `;
      });

      markdown += `${card.name}<br><br><br>${card.desc.replace(/\n/g, "<br>")}`;

      markdown += "\n";
    });

    if (list.name === "Done") {
      markdown += "**Complete**\n";
    }

    markdown += "\n\n";
  });

  markdown += "%% kanban:settings\n";
  markdown += "```\n";
  markdown += `{"kanban-plugin":"basic"}\n`;
  markdown += "```\n";
  markdown += "%%\n";

  return markdown;
}

// Get's every project from Trello with all the information nicely organized for efficient conversion to Markdown.
async function getProjects(): Promise<Board[]> {
  const boardResps = await getBoards();
  return Promise.all(
    boardResps.map(async (boardResp) => {
      const cards: CardResp[] = await getCards(boardResp.id);
      const listIds = getListIdsFromCards(cards);
      const lists: List[] = await Promise.all(
        listIds.map(async (listId) => {
          const listResp: ListResp = await getList(listId);
          return {
            name: listResp.name,
            // NOTE: Yes, I know this isn't efficient.
            cards: cards
              .filter((card) => !listHeaderCardNames.includes(card.name))
              .filter((card) => card.idList === listId)
              .map((card): Card => {
                return {
                  name: card.name,
                  desc: card.desc,
                  labels: card.labels.map((label) => label.name),
                };
              }),
          };
        })
      );
      return {
        name: boardResp.name,
        lists: lists,
      };
    })
  );
}

function getListIdsFromCards(cardResps: CardResp[]): string[] {
  // NOTE: Yes, I know it isn't efficient either.
  return Array.from(new Set(cardResps.map((cardResp) => cardResp.idList)));
}

// TODO: Bunch of duplication in the get*() functions below.
async function getCards(boardId: string): Promise<CardResp[]> {
  const options = {
    hostname: "api.trello.com",
    path: `/1/boards/${boardId}/cards?key=${apiKey}&token=${apiToken}`,
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const cards = JSON.parse(data);
        cards;
        resolve(cards);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

async function getList(listId: string): Promise<ListResp> {
  const options = {
    hostname: "api.trello.com",
    path: `/1/lists/${listId}?key=${apiKey}&token=${apiToken}`,
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const list = JSON.parse(data);
        resolve(list);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

async function getBoards(): Promise<BoardResp[]> {
  const options = {
    hostname: "api.trello.com",
    path: `/1/members/me/boards?key=${apiKey}&token=${apiToken}`,
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const boards = JSON.parse(data);
        resolve(boards);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}
