import { Worker } from 'worker_threads';
import fs from 'fs';
import path from 'path';

const french = JSON.parse(fs.readFileSync("./node_modules/an-array-of-french-words/index.json", 'utf8'));
const spanish = JSON.parse(fs.readFileSync("./node_modules/an-array-of-spanish-words/index.json", 'utf8'));
const directoryPath = path.join(process.cwd(), 'covid19_twitter', 'dailies');

var overallOccurrences = {};
var dailyOccurrences = {};

function processCSV(filePath, date, promises) {
    const promise = new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./csvWorker.mjs', import.meta.url));
        console.log("Started new worker for " + filePath);
        worker.postMessage({ filePath, date, french, spanish });
        worker.on('message', ({ results }) => {
            resolve(results);
        });
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });

    promises.push(promise);

    promise.then(results => {
        for (const [word, occurrence] of Object.entries(results)) {
            overallOccurrences[word] = (overallOccurrences[word] || 0) + occurrence;
            if (!dailyOccurrences[word]) {
                dailyOccurrences[word] = {};
            }
            dailyOccurrences[word][date] = occurrence;
        }
    }).catch(error => {
        console.error(`Error processing CSV file ${filePath}:`, error);
    });
}

function readFilesRecursively(dirPath, promises) {
    const directories = fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => dirent.isDirectory());

    for (const dir of directories) {
        const date = dir.name;
        const filePath = path.join(dirPath, date, `${date}_top1000bigrams.csv`);
        if (fs.existsSync(filePath)) {
            processCSV(filePath, date, promises);
        }
    }
}


// Start processing and wait for all CSV files to be processed
(async () => {
    const allPromises = [];
    readFilesRecursively(directoryPath, allPromises);
    await Promise.all(allPromises);

    // After processing all files, save the results to JSON files
    fs.writeFileSync('overall2.json', JSON.stringify(overallOccurrences, null, 2));
    fs.writeFileSync('result2.json', JSON.stringify(dailyOccurrences, null, 2));
})();



// import { default as word2vec} from 'word2vec';
// import { default as fs } from 'fs/promises';
// import * as dotenv from 'dotenv';
// import * as htmlparser2 from "htmlparser2";
// import { Builder, By, Key, until, WebElement } from 'selenium-webdriver';
// import chrome from 'selenium-webdriver/chrome.js';

// const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36';

// function wait(milliseconds) {
//     return new Promise((resolve) => setTimeout(resolve, milliseconds));
// }

// function findFirstTweetText(html) {
//   let content = null;
//   let isTweetTextElement = false;

//   const parser = new htmlparser2.Parser(
//     {
//       onopentag(name, attributes) {
//         if (attributes["data-testid"] === "tweetText") {
//           isTweetTextElement = true;
//         }
//       },
//       ontext(text) {
//         if (isTweetTextElement && content === null) {
//           content = text.trim();
//         }
//       },
//       onclosetag(tagname) {
//         if (isTweetTextElement) {
//           isTweetTextElement = false;
//         }
//       },
//     },
//     { decodeEntities: true }
//   );

//   parser.write(html);
//   parser.end();

//   return content;
// }
//   let options = new chrome.Options();
//   options.addArguments('window-size=1920,1080');
//   let driver = await new Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(options)
//     .build();

// dotenv.config();
// mainLoop();

// async function mainLoop() {
//   var start = 1;
//   await fetch('https://www.googleapis.com/customsearch/v1/siterestrict?key=' + process.env.GOOGLE_KEY
//   + "&cx=e3006f633aa09405d" + "&exactTerms=covid" + "&highRange=2023-01-01" + "&start=" + start)
//     .then((response) => response.text())
//     .then((body) => {
//       console.log(body);
//         let data = JSON.parse(body);
//         data["items"].forEach(async (element) => {
//           //status
//           if(element["link"].indexOf("status") != -1) {
//             console.log(element["link"]);
//             await fetchTwitter(element["link"]);
//           }
          
//         });
//     });
//     start+=10;
//     mainLoop();
// }

// //data-testid="tweetText"
// async function fetchTwitter(url) {
//   await wait(1600);
//   await driver.get(url);
//   await wait(1200);
//   try {
//     await wait(1200);
//     let text;
//     while (true) {
//       text = await driver.findElements(By.xpath('//div[@data-testid="tweetText"]'));
//       if(text.length != 0) break;
//     }
//     let data = await text[0].getText();
//     await write(data);
//   } catch(e) {
//     console.log(e);
//   }
  
// }

// async function write(content) {
//   try {
//     return fs.appendFile('./data.txt', content);
//   } catch (err) {
//     console.log(err);
//   }
// }





// // import { default as word2vec } from 'word2vec';

// // import { Builder, By, Key, until, WebElement } from 'selenium-webdriver';
// // import chrome from 'selenium-webdriver/chrome';

// // const username = "temp1@winslow.cloud"
// // const password = "spdXLING01"
// // const MIMIC = {
// //     "LOGIN_WAIT": 2200,
// //     "LOGIN_POST_WAIT": 2000
// // };

// // function wait(milliseconds: number): Promise<void> {
// //     return new Promise((resolve) => setTimeout(resolve, milliseconds));
// // }


// // async function asyncLoop() {
// //   let options = new chrome.Options();
// //   options.addArguments('window-size=1920,1080');
// //   let driver = await new Builder()
// //     .forBrowser('chrome')
// //     .setChromeOptions(options)
// //     .build();

// //   try {
// //     await driver.get('https://twitter.com/i/flow/login');
// //     await wait(MIMIC.LOGIN_WAIT);
// //     let inputElements: WebElement[] = await driver.findElements(By.tagName('input'));
// //     let divsWithRoleButton: WebElement[] = await driver.findElements(By.xpath('//div[@role="button"]'));
// //     //await driver.executeScript('arguments[0].focus();', inputElements[0]);
// //     inputElements[0].sendKeys(username);
// //     await wait(MIMIC.LOGIN_WAIT);
// //     divsWithRoleButton[2].click();
// //     await wait(MIMIC.LOGIN_WAIT);
// //     // Unusual
// //     inputElements = await driver.findElements(By.tagName('input'));
// //     inputElements[0].sendKeys("LinguistictheZZ");
// //     await wait(MIMIC.LOGIN_WAIT);
// //     divsWithRoleButton = await driver.findElements(By.xpath('//div[@role="button"]'));
// //     divsWithRoleButton[1].click();
// //     await wait(MIMIC.LOGIN_WAIT);
// //     //end
// //     inputElements = await driver.findElements(By.tagName('input'));
// //     inputElements[1].sendKeys(password);
// //     await wait(MIMIC.LOGIN_WAIT);
// //     divsWithRoleButton = await driver.findElements(By.xpath('//div[@role="button"]'));
// //     divsWithRoleButton[2].click();
// //     await wait(MIMIC.LOGIN_POST_WAIT);
// //     inputElements = await driver.findElements(By.tagName('input'));
// //     inputElements[1].sendKeys("(covid OR pandemic OR coronavirus ) since:2019-12-30");
// //     await wait(200);
// //     inputElements[1].sendKeys(Key.ENTER);
// //     await wait(500);
// //     let search = async () => {
// //         await wait(2400);
// //         await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
// //         search();
// //     };
// //     search();

// //   } finally {
// //     // await driver.quit();
// //   }
// // }

// // asyncLoop();
