const { app } = require('@azure/functions');
const axios = require('axios');
const cheerio = require('cheerio');

app.http('foodAndCoNorth', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (context) => {
        try {
            const date = new Date();    
            const formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();        
            const response = await axios.get('https://www.shop.foodandco.dk/api/WeeklyMenu?restaurantId=1073&languageCode=da-DK&date=' + formattedDate);
            const menuItems = response.data.days.reduce((acc, day) => {
                const menusForDay = day.menus.map(menuItem => {
                    return {name: menuItem.menu, type: menuItem.type}
                });
                return acc.concat(menusForDay);
              }, []);
            return { body: JSON.stringify(menuItems), headers: { 'Content-Type': 'application/json' } };
        } catch (error) {
            return { status: 500, body: 'Error occurred while scraping the menu.' };
        }
    }
});
