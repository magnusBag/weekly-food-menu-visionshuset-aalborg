const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");
const axios = require("axios");
const { STATUS_CODES } = require("http");
require("dotenv").config();
const Buffer = require("buffer").Buffer;

const FOOD_AND_CO_API_URL =
  "https://www.shop.foodandco.dk/api/WeeklyMenu?restaurantId=1073&languageCode=da-DK&date=";
const OPENAI_API_URL = "https://api.openai.com/v1/images/generations";

// Function to get current year and week number
function getWeekNumber() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return [d.getUTCFullYear(), weekNo];
}

// Function to generate HTML content
function generateHtml(daysMenu) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${generateHead()}
      </head>
      <body>
        <h1>Weekly Menu</h1>
        <div class="menu-container">
          ${daysMenu
            .map(
              (day, index) => `
            <div class="day-container ${
              isPastDate(day.day) ? "minimized" : ""
            }" id="day-${index}">
              <h2 class="day" onclick="toggleDay('day-${index}')">${
                day.day
              }</h2>
              <ul class="dishes">
                ${day.dishes
                  .map(
                    (dish) => `
                  <li class="dish">
                    <div class="dish-info"><strong>${dish.type}</strong>: ${
                      dish.name
                    }</div>
                    ${
                      dish.picUrl
                        ? `<div class="dish-image"><img src="${dish.picUrl}" alt="${dish.name}"></div>`
                        : ""
                    }
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `
            )
            .join("")}
        </div>
      </body>
    </html>`;
}

// Function to generate HTML head
function generateHead() {
  return `
    <meta charset="UTF-8">
    <title>MBA menu</title>
    <script>
      function toggleDay(dayId) {
        var element = document.getElementById(dayId);
        var dishes = element.querySelector('.dishes');
        if (element.classList.contains('minimized')) {
          dishes.style.maxHeight = '500px';
        } else {
          dishes.style.maxHeight = '0';
        }
        element.classList.toggle('minimized');
      }
    </script>
    <style>
      body { font-family: 'Arial', sans-serif; color: #333; }
      .menu-container { max-width: 800px; margin: auto; padding: 20px; }
      h1 { text-align: center; color: #007bff; font-weight: normal; }
      .day-container { background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 20px; padding: 15px; }
      .day { font-weight: bold; font-size: 1.2em; cursor: pointer; }
      ul { list-style-type: none; padding: 0; margin-left: 20px; }
      .dish { display: flex; align-items: center; border-bottom: 1px solid #eaeaea; padding: 10px 0; }
      .dish:last-child { border-bottom: none; }
      .dish-info { flex-grow: 1; font-style: italic; }
      .dish-image img { border-radius: 5px; max-width: 150px; max-height: 150px; margin-left: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      .day-container.minimized .dishes { display: none; }
      .dishes { overflow: hidden; transition: max-height 0.3s ease-out; }
      li.dish:hover { background-color: #f0f0f0; transition: transform 0.3s ease-out; }
    </style>`;
}

// Helper function to check if a date is in the past
function isPastDate(day) {
  const [dayNum, monthName] = day.match(/(\d+)\. (\w+)/).slice(1);
  const dayDate = new Date(
    `${monthName} ${dayNum}, ${new Date().getFullYear()}`
  );
  return dayDate < new Date();
}

// Function to upload content to Azure Blob Storage
async function uploadToBlobStorage(
  content,
  blobName,
  containerName = "weekly-food-menu"
) {
  const blobServiceClient = new BlobServiceClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(content, Buffer.byteLength(content));
}

// Function to upload base64 image to Azure Blob Storage
async function uploadBase64ImageToBlobStorage(
  base64,
  blobName,
  containerName = "food-images"
) {
  const buffer = Buffer.from(base64, "base64");
  const blobServiceClient = new BlobServiceClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: "image/png" },
  });
  return blockBlobClient.url;
}

// Function to get data from Azure Blob Storage
async function getDataFromBlobStorage(blobName) {
  const blobServiceClient = new BlobServiceClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient =
    blobServiceClient.getContainerClient("weekly-food-menu");
  const blobClient = containerClient.getBlobClient(blobName);
  try {
    const downloadBlockBlobResponse = await blobClient.download();
    const jsonString = await streamToString(
      downloadBlockBlobResponse.readableStreamBody
    );
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

// Helper function to convert a ReadableStream to a string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => chunks.push(data.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}

// Function to fetch menu data from Food & Co web page
async function getDataFromFoodAndCoWebPage() {
  const formattedDate = new Date().toISOString().split("T")[0];
  const response = await axios.get(`${FOOD_AND_CO_API_URL}${formattedDate}`);
  const daysMenu = response.data.days.map((day) => ({
    day: `${day.dayOfWeek}\nd.\n${new Date(day.date).getDate()}. ${new Date(
      day.date
    ).toLocaleString("default", { month: "long" })}`,
    dishes: day.menus.map((menu) => ({ type: menu.type, name: menu.menu })),
  }));
  return processMenuWithPics(daysMenu);
}

// Function to create an image from a prompt using OpenAI's API
async function createImageFromPrompt(prompt, blobName, model = "dall-e-3") {
  const imageSize = model === "dall-e-3" ? "1024x1024" : "512x512";
  let response;
  try {
    response = await axios.post(
      OPENAI_API_URL,
      { model, prompt, n: 1, size: imageSize, response_format: "b64_json" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
  } catch (error) {
    if (error.response.status === 429) {
      // set a timeout of a min and 1 sec and retry
      console.log("Retrying after 1 min", { prompt, blobName });
      await new Promise((resolve) => setTimeout(resolve, 61000));
      return createImageFromPrompt(prompt, blobName);
    }
  }
  const base64 = response.data.data[0].b64_json;
  return uploadBase64ImageToBlobStorage(base64, blobName);
}

// Function to process menu and attach images to dishes
async function processMenuWithPics(daysMenu) {
  const daysMenuWithPics = await Promise.all(
    daysMenu.map(async (day, dayIndex) => {
      const dishesWithPics = await Promise.all(
        day.dishes.map(async (dish, dishIndex) => {
          const prompt =
            dish.name === "." ? "Nice weekend for a programmer" : dish.name;
          const picUrl = await createImageFromPrompt(
            prompt,
            `${dayIndex}-${dishIndex}.png`
          );
          return { ...dish, picUrl };
        })
      );
      return { ...day, dishes: dishesWithPics };
    })
  );
  return daysMenuWithPics;
}

function parseMenuData(data) {
  const daysMenu = data.days.map((day) => {
    return {
      day: `${day.dayOfWeek}\nd.\n${new Date(day.date).getDate()}. ${new Date(
        day.date
      ).toLocaleString("default", { month: "long" })}`,
      dishes: day.menus.map((menu) => ({
        type: menu.type,
        name: menu.menu,
      })),
    };
  });
  return daysMenu;
}

// Azure function handler
app.http("foodAndCoNorthNiceFormat", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (context) => {
    try {
      const [year, week] = getWeekNumber();
      const blobName = `menu-${year}-${week}.json`;
      let menuData = await getDataFromBlobStorage(blobName);
      if (!menuData) {
        menuData = await getDataFromFoodAndCoWebPage();
        await uploadToBlobStorage(JSON.stringify(menuData), blobName);
      }
      const menuHtml = generateHtml(menuData);
      return { body: menuHtml, headers: { "Content-Type": "text/html" } };
    } catch (error) {
      console.log(error);
      return { status: 500, body: "Error occurred while scraping the menu." };
    }
  },
});

module.exports = { generateHtml, parseMenuData: parseMenuData };
