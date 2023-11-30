const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const axios = require('axios');
require('dotenv').config();
const Buffer = require('buffer').Buffer;


app.http('foodAndCoNorthNiceFormat', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (context) => {

        try {
            const [year, week] = getWeekNumber();
            const blobName = `menu-${year}-${week}.json`;
            // Function to get data from Azure Blob Storage
            let menuData = await getDataFromBlobStorage(blobName);

            if (!menuData) {
                // Function to get data from Food & Co web page
                menuData = await getDataFromFoodAndCoWebPage();
                const menuJson = JSON.stringify(menuData);
                await uploadToBlobStorage(menuJson, blobName);
                console.log(`Uploaded menu data to blob storage: ${menuJson}`);
            } else{
                console.log(`Retrieved menu data from blob storage: ${JSON.stringify(menuData)}`);
            }
            
            // Generate HTML content
            const menuHtml = generateHtml(menuData);

            return {
                body: menuHtml,
                headers: { 'Content-Type': 'text/html' }
            };
        } catch (error) {
            console.log(error);
            return { status: 500, body: 'Error occurred while scraping the menu.' };
        }
    }
});

// Function to generate the main HTML structure
function generateHtml(daysMenu) {
    let html = '<!DOCTYPE html><html><head>' + generateHead() + '</head><body>';
    html += generateBody(daysMenu);
    html += '</body></html>';
    return html;
}

// Function to generate the HTML head with styling and meta tags
function generateHead() {
    return `
        <meta charset="UTF-8">
        <title>MBA menu</title>
        <script>
            function toggleDay(dayId) {
                var element = document.getElementById(dayId);
                var dishes = element.querySelector('.dishes');
                if (element.classList.contains('minimized')) {
                    // Expanding the menu
                    dishes.style.maxHeight = '500px';
                } else {
                    // Collapsing the menu
                    dishes.style.maxHeight = '0';
                }
                element.classList.toggle('minimized');
            }
            
        </script>
        <style>
            body { font-family: 'Arial', sans-serif; color: #333; }
            .menu-container { max-width: 800px; margin: auto; padding: 20px; }
            h1 { text-align: center; color: #4a4a4a; }
            .day-container { background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 20px; padding: 15px; }
            .day { color: #2a2a2a; }
            ul { list-style-type: none; padding: 0; }
            .dish { display: flex; align-items: center; border-bottom: 1px solid #eaeaea; padding: 10px 0; }
            .dish:last-child { border-bottom: none; }
            .dish-info { flex-grow: 1; }
            .dish-image img { border-radius: 5px; max-width: 150px; max-height: 150px; margin-left: 20px; }
            .day-container.minimized { cursor: pointer; }
            .day-container.minimized .dishes { display: none; }
            .dishes {
                overflow: hidden;
                transition: max-height 0.3s ease-out;
            }
            .day-container:not(.minimized) .dishes {
                max-height: 500px; /* Adjust as needed for content size */
            }
            body {
                color: #505050; /* Darker text for better readability */
                font-family: 'Helvetica Neue', sans-serif; /* Modern font */
            }
            
            .menu-container {
                background-color: #ffffff; /* White background for the menu */
                box-shadow: 0 2px 5px rgba(0,0,0,0.15); /* Subtle shadow for depth */
                border-radius: 8px; /* Rounded corners */
            }
            
            h1 {
                color: #007bff; /* Bright blue for a pop of color */
                font-weight: normal; /* Less bold for a lighter appearance */
            }
            
            .day-container {
                border: 1px solid #dddddd; /* Adding a border */
                transition: all 0.3s ease; /* Smooth transition for interactions */
            }
            
            .day {
                font-weight: bold; /* Making day headers stand out */
                font-size: 1.2em; /* Slightly larger font for visibility */
            }
            
            ul {
                margin-left: 20px; /* Indenting the list for better structure */
            }
            
            .dish {
                justify-content: space-between; /* Spacing out dish elements */
            }
            
            .dish-info {
                font-style: italic; /* Styling for a different look */
            }
            
            .dish-image img {
                box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Adding shadow to images */
            }
            li.dish {
                border-radius: 5px;
                padding: 3px 5px;

            }
            li.dish:hover, li.dish:focus {
                transition: transform 0.3s ease-out;
                background-color: #f0f0f0; /* Highlight effect on hover/focus */
            }
            day-container:hover, day-container:focus {
                trasform: scale(1.01);
                transition: transform 0.3s ease-out;
            }
            h2.day{
                cursor: pointer;
            }
            
        </style>
    `;
}


function generateBody(daysMenu) {
    let bodyContent = '<h1>Weekly Menu</h1><div class="menu-container">';
    const now = new Date();
    const currentYear = now.getFullYear();

    daysMenu.forEach((day, index) => {
        const dateParts = day.day.match(/(\d+)\. (\w+)/);
        const dayDate = new Date(`${dateParts[2]} ${dateParts[1]}, ${currentYear}, 13:00:00`);
        const isPast = dayDate < now;
        const dayClass = isPast ? 'day-container minimized' : 'day-container';

        bodyContent += `
            <div class="${dayClass}" id="day-${index}" onclick="toggleDay('day-${index}')">
                <h2 class="day">${day.day}</h2>
                <ul class="dishes">`;

        day.dishes.forEach(dish => {
            bodyContent += `
                <li class="dish">
                    <div class="dish-info">
                        <strong>${dish.type}</strong>: ${dish.name}
                    </div>`;
            if (dish.picUrl) {
                bodyContent += `
                    <div class="dish-image">
                        <img src="${dish.picUrl}" alt="${dish.name}">
                    </div>`;
            }
            bodyContent += `</li>`;
        });

        bodyContent += `</ul></div>`;
    });

    bodyContent += '</div>';
    return bodyContent;
}


function getWeekNumber() {
    const d = new Date(Date.now());
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}

async function uploadToBlobStorage(content, blobName, containerName = 'weekly-food-menu') {
    const blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content));
    console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
}

async function uploadBase64ImageToBlobStorage(base64, blobName, containerName = 'food-images') {
    // Decode base64 string to a buffer
    const buffer = Buffer.from(base64, 'base64');

    const blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length, { blobHTTPHeaders: { blobContentType: 'image/png' } });
    console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
    return blockBlobClient.url;
}

async function getDataFromBlobStorage(blobName) {
    const blobServiceClient = new BlobServiceClient('https://foodenv876f.blob.core.windows.net/weekly-food-menu?sp=rwl&st=2023-11-09T11:01:03Z&se=2026-12-12T19:01:03Z&spr=https&sv=2022-11-02&sr=c&sig=IkDn9mh8lVQiSzD1mB6kKVTCPws9HS30wm8HXCgZYQ8%3D');
    const containerClient = blobServiceClient.getContainerClient('weekly-food-menu');
    const blobClient = containerClient.getBlobClient(blobName);
    try {
        const downloadBlockBlobResponse = await blobClient.download();
        const downloadedData = await streamToJSON(downloadBlockBlobResponse.readableStreamBody);
        return downloadedData;
    } catch (error) {
        console.error(`Error downloading blob ${blobName}: ${error}`);
        return undefined;
    }
}

// Helper function to convert a ReadableStream to a string
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}

// Helper function to convert a ReadableStream to a JSON object
async function streamToJSON(readableStream) {
    const jsonString = await streamToString(readableStream);
    return JSON.parse(jsonString);
}

const FOOD_AND_CO_API_URL = 'https://www.shop.foodandco.dk/api/WeeklyMenu?restaurantId=1073&languageCode=da-DK&date=';
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';

async function getDataFromFoodAndCoWebPage(axiosInstance) {
    const formattedDate = formatDate(new Date());        
    const response = await axiosInstance.get(`${FOOD_AND_CO_API_URL}${formattedDate}`);
    const daysMenu = parseMenuData(response.data);
    return processMenuWithPics(daysMenu, axiosInstance);
};

function formatDate(date) {
    return new Intl.DateTimeFormat('en-GB').format(date);
}

function parseMenuData(data) {
    const daysMenu = data.days.map(day => {
        return {
          day: `${day.dayOfWeek}\nd.\n${new Date(day.date).getDate()}. ${new Date(day.date).toLocaleString('default', { month: 'long' })}`,
          dishes: day.menus.map(menu => ({
            type: menu.type,
            name: menu.menu,
          }))
        };
      });
      return daysMenu;
}

async function createImageFromPrompt(prompt, blobName, axiosInstance, model='dall-e-3') {
    try {
        const [year, week] = getWeekNumber();
        blobName = `${year}-${week}/${blobName}`;
        const imageSize = model === 'dall-e-3' ? '1024x1024' : '512x512';

        const response = await axiosInstance.post(`${OPENAI_API_URL}`, {
            model, prompt, n: 1, size: imageSize, response_format: 'b64_json'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        const base64 = response.data.data[0].b64_json;
        return uploadBase64ImageToBlobStorage(base64, blobName);
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log('Too many requests. Waiting for a minute...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            return createImageFromPrompt(prompt, blobName, axiosInstance, model);
        } else {
            throw error;
        }
    }
}

async function processMenuWithPics(daysMenu, axiosInstance) {
    return Promise.all(daysMenu.map(async (day, dayIndex) => {
        const dishesPromises = day.dishes.map((dish, i) => 
            createImageFromPrompt(dish.name, `${dayIndex}-${i}.png`, axiosInstance)
                .then(picUrl => ({ ...dish, picUrl }))
        );
        day.dishes = await Promise.all(dishesPromises);
        return day;
    }));
}

module.exports = { generateHtml, parseMenuData };
