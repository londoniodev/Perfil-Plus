const cheerio = require('cheerio');
const $ = cheerio.load('<body><nav>hello</nav><main>world</main></footer></body>');
$('nav').remove();
console.log($('body').html());
