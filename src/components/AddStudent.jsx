import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';

const AddStudent = () => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!name || !notes) {
      setError("Имя студента и заметки должны быть заполнены");
      return;
    }

    try {
      const response = await axiosInstance.post("/students", {
        name,
        notes,
      });
      console.log("Студент успешно добавлен:", response.data);
      setSuccess(true);
      setName("");
      setNotes("");
    } catch (error) {
      setError("Ошибка при добавлении студента");
    }
  };

  return (
    <div className="container">
      <h2>Добавление студента</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Имя студента</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите имя студента"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Заметки</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Введите заметки"
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSubmit} className="mt-3">
          Сохранить
        </Button>
        {success && (
          <div className="mt-3" style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', borderRadius: '5px' }}>
            Студент успешно добавлен
          </div>
        )}
      </Form>
      <br />
      <Link to="/students">
        <Button variant="secondary">Перейти к списку студентов</Button>
      </Link>
    </div>
  );
};

export default AddStudent;
 