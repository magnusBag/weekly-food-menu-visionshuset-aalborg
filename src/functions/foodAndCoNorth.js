const { app } = require('@azure/functions');
const axios = require('axios');
const cheerio = require('cheerio');

app.http('foodAndCoNorth', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (context) => {

        try {
            const response = await axios.get('https://www.shop.foodandco.dk/visionshuset');
            const html = response.data;
            const $ = cheerio.load(html);
            const daysMenu = [];

            let currentDay = null;

            $('.products.clearfix li').each((index, element) => {
                if ($(element).hasClass('headline')) {
                    currentDay = $(element).find('h3').text().trim();
                } else if ($(element).hasClass('product') && currentDay) {
                    const dishType = $(element).find('div').first().text().trim();
                    const dishName = $(element).find('div').last().text().trim();

                    let dayObject = daysMenu.find(day => day.day === currentDay);
                    if (!dayObject) {
                        dayObject = { day: currentDay, dishes: [] };
                        daysMenu.push(dayObject);
                    }
                    console.log(dayObject);
                    dayObject.dishes.push({ type: dishType, name: dishName });
                }
            });

            return { body: JSON.stringify(daysMenu), headers: { 'Content-Type': 'application/json' } };
        } catch (error) {
            return { status: 500, body: 'Error occurred while scraping the menu.' };
        }
    }
});
