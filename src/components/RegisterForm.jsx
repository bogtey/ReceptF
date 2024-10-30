import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState(""); // Переименовано в password
  const [pseudonym, setPseudonym] = useState(""); // Поле для псевдонима
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !password || !pseudonym) {
        setError("Все поля должны быть заполнены");
        return;
    }

    try {
        const userData = { name, surname: password, pseudonym }; // Измените password на surname
        const response = await axios.post("http://localhost:3333/auth/signup", userData);
        console.log("Регистрация прошла успешно:", response.data);
        navigate('/login');
    } catch (error) {
        if (error.response) {
            setError(error.response.data.message || "Ошибка при отправке данных");
        } else {
            setError("Ошибка при отправке данных");
        }
    }
};

  return (
    <Container className="mt-5" style={{ maxWidth: '450px' }}>
      <div className="bg-light shadow p-4 rounded" style={{ '--bs-bg-opacity': 0.90 }}>
        <h2 className="text-center mb-4">Регистрация</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Имя пользователя</Form.Label>
            <Form.Control 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя пользователя"
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="pseudonym">
            <Form.Label>Псевдоним</Form.Label> {/* Поле для псевдонима */}
            <Form.Control 
              type="text" 
              value={pseudonym} 
              onChange={(e) => setPseudonym(e.target.value)}
              placeholder="Введите псевдоним"
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="password">
            <Form.Label>Пароль</Form.Label> {/* Исправлено на "Пароль" */}
            <Form.Control 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100 py-2">
            Зарегистрироваться
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default RegisterForm;