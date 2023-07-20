/*  Дмитрий Гофф.
 *  Тестовое задание
 *  17 июля 2023
 */

const https = require("https");
const fs = require("fs");

/* Функция для загрузки продуктов */
async function getProducts() {
  return new Promise((resolve) => {
    const options = {
      hostname: "djari.ru",
      path: "/",
      headers: "User-Agent: Googlebot/2.1 (+http://www.google.com/bot.html)",
      method: "GET",
      json: true,
    };

    try {
      https
        .get(options, (res) => {
          let data = "";
          console.log("Status Code:", res.statusCode);
          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const tag =
                '<script id="vite-plugin-ssr_pageContext" type="application/json">';

              // находим начало тега с json, обрезаем начало и конец
              const startIndex = data.indexOf(tag);
              if (startIndex > 0) {
                data = data.slice(startIndex + tag.length);
                const endIndex = data.indexOf("</script>");
                data = data.slice(0, endIndex);

                // в полученный код преобразуем в JSON-объект
                const parsedData = JSON.parse(data);

                // оставляем только массив с продуктами
                const products =
                  parsedData?.pageContext?.initialStoreState?.products?.all;
                const result = [];
                if (products) {
                  products.forEach((product) => {
                    result.push({
                      name: product.name,
                      price: product?.parameters[0].cost,
                    });
                  });
                }
                resolve(result);
              }
              resolve(null);
            } catch (err) {
              console.log(err.message);
            }
          });
        })
        .on("error", (err) => {
          console.log("Error: ", err.message);
        });
    } catch (error) {
      console.log(error.message);
    }
  });
}

/**
 * Функция записи JSON в файл
 * @param {string} name имя файла
 * @param {JSON} json JSON-объект
 */
function writeToFile(name, json) {
  try {
    fs.writeFile(name, JSON.stringify(json), (err) => {
      if (err) {
        console.error(err);
      } else console.log("Список продуктов успешно записан в файл!");
    });
  } catch (err) {
    console.log(err.message);
  }
}

// Получаем список продуктов и записываем в файл
getProducts().then((products) => writeToFile("products.json", products));
