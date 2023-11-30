# README for Azure Functions: FoodAndCoMenu API

This repository contains the Azure Functions code for the FoodAndCoMenu service. The service provides two HTTP triggers, each serving a distinct purpose:

1. **JSON API Endpoint** (`/api/foodandconorth`): This endpoint returns a JSON-formatted menu for a week.
2. **Formatted Webpage Endpoint** (`/api/foodandconorthniceformat`): This endpoint displays the menu on a webpage, enhanced with AI-generated images for each dish.

---

## Table of Contents
- [Endpoints](#endpoints)
  - [JSON API Endpoint](#1-json-api-endpoint)
  - [Formatted Webpage Endpoint](#2-formatted-webpage-endpoint)
- [AI Image Generation](#ai-image-generation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Endpoints

### 1. JSON API Endpoint
- **URL**: `https://foodandcomenu.azurewebsites.net/api/foodandconorth`
- **Method**: `GET`
- **Response Format**:
  ```json
  [
    {
      "day": "Day and Date",
      "dishes": [
        {
          "type": "Dish Type",
          "name": "Dish Name"
        },
        // More dishes...
      ]
    },
    // More days...
  ]
  ```

### 2. Formatted Webpage Endpoint
- **URL**: `https://foodandcomenu.azurewebsites.net/api/foodandconorthniceformat`
- **Method**: `GET`
- **Description**: Displays a formatted webpage with the menu, where each dish is accompanied by an AI-generated image.

---

## AI Image Generation
The AI image generation for the webpage endpoint is achieved through a Node.js script that interfaces with an AI service. Ensure that the AI service is properly configured and accessible.

---

## Deployment
If a pull-requst is accepted the feature will be automatically deployed right away.

---

## Contributing

We welcome contributions to this project. Here's how you can contribute:

1. **Fork the Repository**: Click on the 'Fork' button at the top right corner of this page.
2. **Clone Your Fork**: `git clone https://github.com/magnusBag/weekly-food-menu-visionshuset-aalborg.git`
3. **Create a New Branch**: `git checkout -b your-feature-branch`
4. **Make Your Changes**: Implement your feature or fix.
5. **Commit Your Changes**: `git commit -am 'Add some feature'`
6. **Push to the Branch**: `git push origin your-feature-branch`
7. **Create a New Pull Request**: Go to your fork on GitHub and click the 'New pull request' button. Provide a description of your changes and submit the request.

Please ensure your code adheres to the project's coding standards and include tests that validate your changes if possible.

---

## License
This project is licensed under the [MIT License](LICENSE.md).

---
