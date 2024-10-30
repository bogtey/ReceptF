import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Button, ListGroup, FormControl, Container, Row, Col } from 'react-bootstrap';
import axiosInstance from '../axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PollList = () => {
  const [polls, setPolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [photos, setPhotos] = useState({});
  const { token, checkTokenValidity } = useContext(AuthContext);

  const fetchPhotos = async () => {
    try {
      const response = await axiosInstance.get(`/admin/get/all/photos`);
      const photosData = response.data.reduce((acc, photo) => {
        if (photo.surveyId) {
          const url = `data:${photo.contentType};base64,${photo.data}`;
          acc[photo.surveyId] = url;
        }
        return acc;
      }, {});
      setPhotos(photosData);
    } catch (error) {
      console.error('Ошибка при получении фотографий:', error);
    }
  };

  const fetchPolls = useCallback(async () => {
    try {
      await checkTokenValidity();
      const token = localStorage.getItem('jwt');
      const decoded = jwtDecode(token);
      const response = await axiosInstance.get('/admin/get/all/surveys/' + decoded.id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setPolls([]);
    }
  }, [token, checkTokenValidity]);

  useEffect(() => {
    fetchPolls();
    fetchPhotos(); // Загружаем фотографии
  }, [fetchPolls]);

  const deletePoll = async (id) => {
    if (!id) {
      console.error('Invalid poll ID');
      return;
    }

    try {
      await checkTokenValidity();
      await axiosInstance.post(`/admin/delete/survey/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPolls();
    } catch (error) {
      console.error('Error deleting poll:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPolls = polls.filter((poll) =>
    poll.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="p-0 d-flex flex-column vh-100">
      <Row className="flex-grow-1 m-0">
        <Col xs={12} md={8} lg={6} className="mx-auto p-0 d-flex flex-column">
          <div className="bg-light shadow flex-grow-1 d-flex flex-column">
            <div className="p-4">
              <h2 className="text-center mb-4">Мои Рецепты</h2>
              <FormControl
                type="text"
                placeholder="Поиск рецепта"
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-3"
              />
              <p className="text-start mb-3">
                Найдено {filteredPolls.length} рецептов
              </p>
            </div>
            <ListGroup className="flex-grow-1 overflow-auto">
              {filteredPolls.length > 0 ? (
                filteredPolls.map((poll) => (
                  <ListGroup.Item key={poll.surveyId} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {photos[poll.surveyId] ? (
                        <img src={photos[poll .surveyId]} alt="Фото" style={{ width: '50px', height: 'auto', marginRight: '10px' }} />
                      ) : (
                        <div className="bg-secondary" style={{ width: '50px', height: '50px', marginRight: '10px' }}></div>
                      )}
                      <strong>{poll.question}</strong>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deletePoll(poll.surveyId)}
                    >
                      Удалить
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>Пусто</ListGroup.Item>
              )}
            </ListGroup>
            <div className="p-4">
              <Link to="/poll" className="d-grid">
                <Button variant="primary" className="mb-3">
                  Добавить рецепт
                </Button>
              </Link>
              <Link to="/students" className="d-grid">
                <Button variant="outline-primary" className="mb-3">
                  Назад
                </Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PollList;