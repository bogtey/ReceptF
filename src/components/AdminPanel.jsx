import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const AdminPanel = () => {
  return (
    <Container>
      <h1 className="mt-5 mb-4">Админ Панель</h1>
      <Row>
        <Col md={4}>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Управление пользователями</h5>
              <p className="card-text">Добавление, редактирование и удаление пользователей</p>
              <Button variant="primary">Перейти</Button>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Управление продуктами</h5>
              <p className="card-text">Добавление, редактирование и удаление продуктов</p>
              <Button variant="primary">Перейти</Button>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Статистика</h5>
              <p className="card-text">Просмотр статистики и отчетов</p>
              <Button variant="primary">Перейти</Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;
