import React, { useState, useEffect, useCallback } from 'react';
import { Button, ListGroup, FormControl, Container, Row, Col } from 'react-bootstrap';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const StudentFeed = () => {
  const [surveys, setSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [photos, setPhotos] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

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

  const fetchSurveys = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/admin/get/surveys`);
      setSurveys(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
    fetchPhotos();
  }, [fetchSurveys]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredSurveys = surveys.filter((survey) =>
    survey.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastSurvey = currentPage * itemsPerPage;
  const indexOfFirstSurvey = indexOfLastSurvey - itemsPerPage;
  const currentSurveys = filteredSurveys.slice(indexOfFirstSurvey, indexOfLastSurvey);
  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container fluid className="p-0 d-flex flex-column vh-100">
      <Row className="flex-grow-0 m-0">
        <Col xs={12} md={8} lg={6} className="mx-auto p-0 d-flex flex-column">
          <div className="bg-light shadow flex-grow-1 d-flex flex-column">
            <div className="p-4">
              <h2 className="text-center mb-4">Все блюда</h2>
              <FormControl
                type="text"
                placeholder="Введите желаемый рецепт"
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-3"
              />
              <p className="text-start mb-3">
                Найдено {filteredSurveys.length} рецептов
              </p>
            </div>
            <ListGroup className="flex-grow-1">
              {currentSurveys.length > 0 ? (
                currentSurveys.map((survey) => (
                  <ListGroup.Item key={survey.surveyId} action>
                    <Link to={`/student/${survey.surveyId}`} className="d-flex justify-content-between align-items-center text-decoration-none">
                      <div className="d-flex align-items-center">
                        <img src={photos[survey.surveyId]} alt="Фото" style={{ width: '50px', height: 'auto', marginRight: '10px' }} />
                        <strong>{survey.question}</strong>
                      </div>
                    </Link>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>Нету</ListGroup.Item>
              )}
            </ListGroup>
            <div className="d-flex justify-content-evenly align-items-center p-3">
              <Button
                style={{
                  width: '40px',
                  height: '40px ',
                  color: 'white',
                  backgroundColor: 'gray',
                  border: 'none',
                  borderRadius: '5px',
                }}
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </Button>
              <p>
                Страница {currentPage} из {totalPages}
              </p>
              <Button
                style={{
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  backgroundColor: 'gray',
                  border: 'none',
                  borderRadius: '5px',
                }}
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentFeed;