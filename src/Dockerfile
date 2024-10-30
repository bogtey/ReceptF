# Используем официальный образ Node.js в качестве базового
FROM node:14

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код приложения
COPY . .

# Сборка приложения
RUN npm run build

# Устанавливаем сервер для статических файлов
RUN npm install -g serve

# Запускаем приложение
CMD ["serve", "-s", "build"]

# Экспонируем порт
EXPOSE 3000
