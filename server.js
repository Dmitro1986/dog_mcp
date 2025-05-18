const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 8080;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // Собираем основные метаданные
        const metadata = {
            title: $('title').text(),
            description: $('meta[name="description"]').attr('content') || '',
            keywords: $('meta[name="keywords"]').attr('content') || ''
        };

        // Собираем все заголовки
        const headers = {
            h1: $('h1').map((i, el) => $(el).text()).get(),
            h2: $('h2').map((i, el) => $(el).text()).get(),
            h3: $('h3').map((i, el) => $(el).text()).get()
        };

        // Собираем все ссылки
        const links = $('a').map((i, el) => ({
            text: $(el).text(),
            href: $(el).attr('href')
        })).get();

        // Собираем все изображения
        const images = $('img').map((i, el) => ({
            alt: $(el).attr('alt'),
            src: $(el).attr('src')
        })).get();

        res.json({
            status: 'success',
            url: url,
            data: {
                metadata,
                headers,
                links: links.slice(0, 10), // Ограничиваем количество ссылок
                images: images.slice(0, 10) // Ограничиваем количество изображений
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});