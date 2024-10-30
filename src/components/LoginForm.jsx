import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const auth = "/auth/signin";

const LoginForm = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name || !surname) {
        setError("Введите логин и пароль");
        return;
      }

      const userData = { name, surname };
      const response = await axiosInstance.post(auth, userData);
      const token = response.data;

      login(token);
      navigate('/student-feed');
    } catch (error) {
      setError(error.response?.data.message || "Ошибка при отправке данных");
    }
  };

  return (
    <Container className="mt-5" style={{maxWidth: '450px'}}>
      <div className="bg-light shadow p-4 rounded" style={{'--bs-bg-opacity': 0.90}}>
        <h2 className="text-center mb-4">Авторизация</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Логин</Form.Label>
            <Form.Control 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите логин"
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="surname">
            <Form.Label>Пароль</Form.Label>
            <Form.Control 
              type="password" 
              value={surname} 
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Введите пароль"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100 py-2">
            Войти
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default LoginForm;