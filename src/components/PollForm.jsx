import React, { useState, useContext } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PollForm = () => {
  const [pollQuestion, setPollQuestion] = useState("");
  const [options, setOptions] = useState([{ id: 1, text: "" }]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { token, checkTokenValidity } = useContext(AuthContext);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);
  
    // Проверяем только заполнение заметок
    if (!note) {
      setError("Основная информация должна быть заполнена");
      return;
    }
  
    try {
      const optionsString = options.map(option => option.text).join(", ");
      await checkTokenValidity(); // Проверяем токен перед отправкой запроса
      const decoded = jwtDecode(token);
      
      const response = await axiosInstance.post(
        "/admin/create/survey/",
        {
          question: pollQuestion,
          title: optionsString,
          note: note,
          man: {
            manId: decoded.id
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Полный ответ сервера при создании голосования:", response);
      
      if (response.status === 200 || response.status === 201) {
        console.log("Голосование успешно создано");
        setSuccess(true);
        setPollQuestion("");
        setOptions([{ id: 1, text: "" }]);
        setNote("");
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Ошибка при создании голосования:", error);
      if (error.response) {
        console.error("Данные ответа сервера:", error.response.data);
        console.error("Статус ответа сервера:", error.response.status);
        console.error("Заголовки ответа сервера:", error.response.headers);
        setError(`Ошибка при создании голосования: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error("Запрос был сделан, но ответ не получен:", error.request);
        setError("Ошибка сети. Пожалуйста, проверьте ваше соединение.");
      } else {
        console.error("Ошибка при настройке запроса:", error.message);
        setError(`Ошибка при создании голосования: ${error.message}`);
      }
    }
  };

  return (
    <Container fluid className="p-0 d-flex flex-column vh-100">
      <Row className="flex-grow-1 m-0">
        <Col xs={12} md={8} lg={6} className="mx-auto p-0 d-flex flex-column">
          <div className="bg-light shadow flex-grow-1 d-flex flex-column">
            <div className="p-4">
              <h2 className="text-center mb-4">Добавление рецепта</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Рецепт</Form.Label>
                  <Form.Control
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Название"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Состав</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Введите основную информацию"
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button variant="primary" onClick={handleSubmit} className="mb-3">
                    Сохранить
                  </Button>
                </div>
                {success && (
                  <div className="alert alert-success mb-3">
                    Успешно
                  </div>
                )}
              </Form>
            </div>
            <div className="p-4">
              <Link to="/students" className="d-grid">
 <Button variant="outline-primary" className="mb-3">
                  Перейти к списку
                </Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PollForm;