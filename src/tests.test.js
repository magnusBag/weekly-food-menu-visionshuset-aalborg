const { generateHtml } = require("./functions/foodAndCoNorthNiceFormat.js");

describe("generateHtml", () => {
  it("should generate correct HTML structure for given menu data", () => {
    const mockMenuData = [
      {
        day: "Mandag\nd.\n27. november",
        dishes: [
          {
            type: "Dagens varme ret",
            name: "Helstegt kyllingelår serveret med stegte kartofler, bagte rodfrugter og sky",
          },
          {
            type: "Dagens vegetar ret",
            name: "Cremet suppe med stegte svampe hertil hjemmebagt brød",
          },
        ],
      },
      {
        day: "Tirsdag\nd.\n28. november",
        dishes: [
          {
            type: "Dagens vegetar ret",
            name: "Vegansk ristaffel med filet stykker hertil diverse toppings og mango chutney",
          },
          {
            type: "Dagens lune ret",
            name: "Toast med skinke og ost ",
          },
        ],
      },
      {
        day: "Onsdag\nd.\n29. november",
        dishes: [
          {
            type: "Dagens varme ret",
            name: "Fiskemandens fiskefrikadeller med hjemmerørt remoulade, citron og tyttebær",
          },
          {
            type: "Dagens vegetar ret",
            name: "Tomat suppe med gulerod og suppehorn hertil hjemmebagt brød",
          },
        ],
      },
      {
        day: "Torsdag\nd.\n30. november",
        dishes: [
          {
            type: "Glædelig jul",
            name: "Grønlangkål med stegt medister, rødbeder, sennep og brunede kartofler",
          },
          {
            type: "Vegetar ret",
            name: "Stuvede hvidkål med kanel sukker",
          },
        ],
      },
      {
        day: "Fredag\nd.\n1. december",
        dishes: [
          {
            type: "Dagens varme ret",
            name: "Lun leverpostej med bacon, champignon, rødbeder og hjemmebagt rugbrød",
          },
          {
            type: "Rigtig god weekend",
            name: ".",
          },
        ],
      },
    ];

    const html = generateHtml(mockMenuData);
    expect(html).toContain("<html>");
    expect(html).toContain("<head>");
  });
});

// Path: src/functions/foodAndCoNorthNiceFormat.js
// test parseMenuData
const { parseMenuData } = require("./functions/foodAndCoNorthNiceFormat.js");
describe("parseMenuData", () => {
  it("should parse menu data correctly", () => {
    const mockMenuData = {
      weekNumber: 48,
      firstDateOfWeek: "2023-11-27T00:00:00",
      days: [
        {
          dayOfWeek: "Mandag",
          date: "2023-11-27T00:00:00",
          menus: [
            {
              type: "Dagens varme ret",
              menu: "Helstegt kyllingelår serveret med stegte kartofler, bagte rodfrugter og sky",
              friendlyUrl:
                "/visionshuset/helstegt-kyllingelaar-serveret-med-stegte-kartofler-bagte-rodfrugter-og-sky-0",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
            {
              type: "Dagens vegetar ret",
              menu: "Cremet suppe med stegte svampe hertil hjemmebagt brød",
              friendlyUrl:
                "/visionshuset/cremet-suppe-med-stegte-svampe-hertil-hjemmebagt-broed-0",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
          ],
        },
        {
          dayOfWeek: "Tirsdag",
          date: "2023-11-28T00:00:00",
          menus: [
            {
              type: "Dagens vegetar ret",
              menu: "Vegansk ristaffel med filet stykker hertil diverse toppings og mango chutney",
              friendlyUrl:
                "/visionshuset/vegansk-ristaffel-med-filet-stykker-hertil-diverse-toppings-og-mango-chutney-0",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
            {
              type: "Dagens lune ret",
              menu: "Toast med skinke og ost ",
              friendlyUrl: "/visionshuset/toast-med-skinke-og-ost-0",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
          ],
        },
        {
          dayOfWeek: "Onsdag",
          date: "2023-11-29T00:00:00",
          menus: [
            {
              type: "Dagens varme ret",
              menu: "Fiskemandens fiskefrikadeller med hjemmerørt remoulade, citron og tyttebær",
              friendlyUrl:
                "/visionshuset/fiskemandens-fiskefrikadeller-med-hjemmeroert-remoulade-citron-og-tyttebaer-0",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
            {
              type: "Dagens vegetar ret",
              menu: "Tomat suppe med gulerod og suppehorn hertil hjemmebagt brød",
              friendlyUrl:
                "/visionshuset/tomat-suppe-med-gulerod-og-suppehorn-hertil-hjemmebagt-broed-25",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
          ],
        },
        {
          dayOfWeek: "Torsdag",
          date: "2023-11-30T00:00:00",
          menus: [
            {
              type: "Glædelig jul",
              menu: "Grønlangkål med stegt medister, rødbeder, sennep og brunede kartofler",
              friendlyUrl:
                "/visionshuset/groenlangkaal-med-stegt-medister-roedbeder-sennep-og-brunede-kartofler-0",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
            {
              type: "Vegetar ret",
              menu: "Stuvede hvidkål med kanel sukker",
              friendlyUrl: "/visionshuset/stuvede-hvidkaal-med-kanel-sukker",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
          ],
        },
        {
          dayOfWeek: "Fredag",
          date: "2023-12-01T00:00:00",
          menus: [
            {
              type: "Dagens varme ret",
              menu: "Lun leverpostej med bacon, champignon, rødbeder og hjemmebagt rugbrød",
              friendlyUrl:
                "/visionshuset/lun-leverpostej-med-bacon-champignon-roedbeder-og-hjemmebagt-rugbroed-0",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
            {
              type: "Rigtig god weekend",
              menu: ".",
              friendlyUrl: "/visionshuset/ff7935ce-7f8a-4c80-b380-5c936e96aee8",
              image:
                "https://images.foodandco.dk/Cache/7000/26db3d14e906a285ea7351e22a11617c.jpg",
            },
          ],
        },
      ],
    };
    const parsedMenuData = parseMenuData(mockMenuData);
    expect(parsedMenuData.length).toEqual(5);
    expect(parsedMenuData[0].day).toEqual("Mandag\nd.\n27. november");
    expect(parsedMenuData[0].dishes.length).toEqual(2);
    expect(parsedMenuData[0].dishes[0].type).toEqual("Dagens varme ret");
    expect(parsedMenuData[0].dishes[0].name).toEqual(
      "Helstegt kyllingelår serveret med stegte kartofler, bagte rodfrugter og sky"
    );
  });
});
