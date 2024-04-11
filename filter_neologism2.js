import fs from 'fs';

const overall = JSON.parse(fs.readFileSync("./overall2.json"));
const engWords = fs.readFileSync("./words_alpha.txt").toString().split("\n").map(x => {return x.toLowerCase().replace(/\s/g, "");});
const nameWords = fs.readFileSync("./first-names.txt").toString().split("\n").map(x => {return x.toLowerCase().replace(/\s/g, "");});
const includes = ["cov", "vac", "vax", "quan", "lock", "pan", "vir", "qu", "mask", "co", "x"];
const res = Object.entries(JSON.parse(fs.readFileSync("./result2.json"))).filter(x => {
    return includes.reduce((acc, neo) => {return acc || x[0].indexOf(neo) != -1}, false)
    && (overall[x[0]] < 800000) 
    && x[0].length > 5 && x[0].length < 18
    && engWords.indexOf(x[0]) == -1 
    && x[0].indexOf("india") == -1 // filter some hashtags
    && x[0].indexOf("italy") == -1
    && nameWords.indexOf(x[0]) == -1;
}).map(y => { return y[0]});

console.log(res);

fs.writeFileSync("./res2.txt", new Buffer.from(res.toString().replaceAll(",", "\n")));
