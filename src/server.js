// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Настройка CORS
app.use(cors({
    origin: 'http://localhost:3000', // Разрешите запросы только с этого источника
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Разрешенные методы
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
}));

app.use(express.json());

// Ваши маршруты
app.put('/admin/update/survey/:id', (req, res) => {
    // Логика обновления опроса
    res.json({ message: 'Survey updated successfully' });
});

// Запуск сервера
app.listen(3333, () => {
    console.log('Server is running on http://localhost:3333');
});