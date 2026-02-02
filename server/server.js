const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Папка, файлы которой нужно прочитать
const directoryPath = path.join(__dirname, 'files');

// Статические файлы (HTML, CSS, клиентский JS)
app.use(express.static('public'));

// API для получения списка файлов
app.get('/api/files', (req, res) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Не удалось прочитать папку' });
        }
        res.json(files); // Отправляем массив имен файлов
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
