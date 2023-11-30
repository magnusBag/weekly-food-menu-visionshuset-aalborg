const { app } = require('@azure/functions');
const axios = require('axios');

app.http('foodAndCoNorth', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (context) => {
        try {
            const date = new Date();    
            const formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();        
            const response = await axios.get('https://www.shop.foodandco.dk/api/WeeklyMenu?restaurantId=1073&languageCode=da-DK&date=' + formattedDate);
            const daysMenu = response.data.days.map(day => {
                return {
                  day: `${day.dayOfWeek}\nd.\n${new Date(day.date).getDate()}. ${new Date(day.date).toLocaleString('default', { month: 'long' })}`,
                  dishes: day.menus.map(menu => ({
                    type: menu.type,
                    name: menu.menu,
                  }))
                };
              });
            return { body: JSON.stringify(daysMenu), headers: { 'Content-Type': 'application/json' } };
        } catch (error) {
            return { status: 500, body: 'Error occurred while scraping the menu.' };
        }
    }
});
