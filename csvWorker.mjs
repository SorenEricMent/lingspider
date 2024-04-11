// csvWorker.mjs
import { parentPort } from 'worker_threads';
import fs from 'fs';
import csvParser from 'csv-parser';

parentPort.once('message', ({ filePath, date, french, spanish }) => {
    const results = {};
    fs.createReadStream(filePath)
        .pipe(csvParser({ headers: ['word', 'occurrence'] }))
        .on('data', (row) => {
            console.log(row + " " + date + " " + filePath)
            const word = row.word;
            const occurrence = parseInt(row.occurrence, 10);
            const isAscii = /^[\x00-\x7F]*$/.test(word);
            const isNotFrenchOrSpanish = !french.includes(word) && !spanish.includes(word);
            const isNotNumber = isNaN(parseInt(word));
            const doesNotContainSpecialChars = !word.includes('#') && !word.includes('_');
        
            if (isAscii && isNotFrenchOrSpanish && isNotNumber && doesNotContainSpecialChars) {
                results[word] = results[word] ? results[word] + occurrence : occurrence;
            }
        })        
        .on('end', () => {
            console.log("Worker for " + date + " suicided!")
            parentPort.postMessage({ date, results });
        })
        .on('error', (err) => {
            parentPort.postMessage({ error: err.message });
        });
});
