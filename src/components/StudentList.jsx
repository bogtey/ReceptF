import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Button, ListGroup, FormControl, Container, Row, Col, Modal, Form, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faArrowLeft, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../axiosInstance';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import BackgroundWrapper from './BackgroundWrapper'; // Импортируйте BackgroundWrapper

const StudentList = () => {
  const [surveys, setSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editedSurvey, setEditedSurvey] = useState(null);
  const [showSurveyDetails, setShowSurveyDetails] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [photos, setPhotos] = useState({});
  const { token, checkTokenValidity } = useContext(AuthContext);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  const fetchPhotos = async (manId, surveyId) => {
    if (!manId || !surveyId) {
      console.warn('manId или surveyId отсутствует');
      return null;
    }
    try {
      const response = await axiosInstance.get(`/admin/get/photo/${manId}/${surveyId}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const imageUrl = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
        return imageUrl;
      }
    } catch (error) {
      console.error('Ошибка при получении фотографий:', error);
      return null;
    }
  };

  const fetchSurveys = useCallback(async () => {
    try {
      await checkTokenValidity();
      const token = localStorage.getItem('jwt');
      const decoded = jwtDecode(token);
      const response = await axiosInstance.get(`/admin/get/all/surveys/${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setSurveys(response.data);
        const photosPromises = response.data.map(async (survey) => {
          const photoUrl = await fetchPhotos(decoded.id, survey.surveyId);
          return { surveyId: survey.surveyId, photoUrl };
        });
        const photosData = await Promise.all(photosPromises);
        const photosMap = {};
        photosData.forEach(({ surveyId, photoUrl }) => {
          if (photoUrl) {
            photosMap[surveyId] = photoUrl;
          }
        });
        setPhotos(photosMap);
      } else {
        setSurveys([]);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]);
    }
  }, [token, checkTokenValidity]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Сбросить страницу при изменении поиска
  };

  const handleSurveyClick = (survey) => {
    setShowSurveyDetails(survey.surveyId);
    setEditedSurvey({ 
      ...survey,
      manId: survey.man.manId 
    });
  };

  const closeModals = () => {
    setShowPhotoModal(false);
    setShowInfoModal(false);
    setEditedSurvey(null);
    setNewTitle('');
    setSelectedFile(null);
  };

  const uploadPhoto = async () => {
    const { surveyId, manId } = editedSurvey || {};
    alert('Фото успешно загружено. Не забудьте сохранить изменения!');
    if (!surveyId || !manId) {
      alert('Ошибка: отсутствует идентификатор анкеты или manId.');
      return;
    }
    if (!selectedFile) {
      alert('Ошибка: файл не выбран.');
      return;
 }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axiosInstance.post(`/admin/upload/photo/${surveyId}/${manId}`, formData, {
        headers : { Authorization: `Bearer ${token}` },
      });
      const photoUrl = response.data.photoUrl;
      setEditedSurvey(prevState => ({
        ...prevState,
        photoUrl: photoUrl
      }));
      setPhotos(prevPhotos => ({
        ...prevPhotos,
        [surveyId]: photoUrl // Сохраняем URL в состоянии photos
      }));
      closeModals();
    } catch (error) {
      console.error('Error uploading photo:', error.response || error);
      alert('Ошибка при загрузке фото: ' + (error.response?.data || error.message));
    }
  };

  const deletePhoto = async () => {
    const { surveyId } = editedSurvey || {};
    if (!surveyId) {
      alert('Ошибка: отсутствует идентификатор анкеты.');
      return;
    }

    try {
      await axiosInstance.delete(`/admin/delete/photo/${surveyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotos(prevPhotos => {
        const updatedPhotos = { ...prevPhotos };
        delete updatedPhotos[surveyId]; // Удаляем фото из состояния
        return updatedPhotos;
      });
      alert('Фото успешно удалено.');
      closeModals();
    } catch (error) {
      console.error('Error deleting photo:', error.response || error);
      alert('Ошибка при удалении фото: ' + (error.response?.data || error.message));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // Устанавливаем выбранный файл в состояние
    }
  };

  const updateSurvey = async () => {
    try {
      await axiosInstance.put(`/admin/update/survey/${editedSurvey.surveyId}`, editedSurvey, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSurveys();
      closeModals();
    } catch (error) {
      console.error('Ошибка при обновлении опроса:', error);
      alert('Ошибка при обновлении опроса: ' + (error.response?.data || error.message));
    }
  };

  const handleAddTitle = () => {
    if (newTitle.trim() !== '') {
      const updatedTitles = editedSurvey.title
        ? `${editedSurvey.title} || ${newTitle}` // Изменение разделителя на "|| "
        : newTitle;
      setEditedSurvey({ ...editedSurvey, title: updatedTitles });
      setNewTitle('');
    }
  };

  const handleRemoveTitle = (titleToRemove) => {
    const updatedTitles = editedSurvey.title
      .split('|| ')
      .filter((title) => title !== titleToRemove)
      .join('|| ');
    setEditedSurvey({ ...editedSurvey, title: updatedTitles });
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
    <BackgroundWrapper>
      <Container fluid className="p-0 d-flex flex-column vh-100">
        <Row className="flex-grow-1 m-0">
          <Col xs={12} md={8} lg={6} className="mx-auto p-0 d-flex flex-column">
            <div className="bg-light shadow flex-grow-1 d-flex flex-column">
              <div className="p-4 d-flex align-items-center">
                
                <h2 className="text-center mb-4">Это мои рецепты - это мое !</h2>
              </div>
              <FormControl
  type="text"
  placeholder="Поиск"
  value={searchTerm}
  onChange={handleSearchChange}
  className="mb-3"
/>
<div className="d-flex justify-content-evenly align-items-center mb-3">
  <p className="text-start mb-0">
    Найдено {filteredSurveys.length} рецептиков
  </p>
  <div className="d-flex">
    <Link to="/poll" style={{ textDecoration: 'none' }}>
      <Button variant="light" className="p-2 me-2" title="Добавить новый">
        <FontAwesomeIcon icon={faPlus} />
      </Button>
    </Link>
    <Link to="/polls" style={{ textDecoration: 'none' }}>
      <Button variant="light" className="p-2 me-2" title="Изменить список">
        <FontAwesomeIcon icon={faEdit} />
      </Button>
    </Link>
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Button variant="light" className="p-2" title="Вернуться назад">
        <FontAwesomeIcon icon={faArrowLeft} />
      </Button>
    </Link>
  </div>
</div>
<ListGroup className="flex-grow-1">
                {currentSurveys.length > 0 ? (
                  currentSurveys.map((survey) => (
                    <ListGroup.Item key={survey.surveyId} action onClick={() => handleSurveyClick(survey)}>
                      <Row>
                        <Col xs={3} md={2}>
                          {photos[survey.surveyId] ? (
                            <Image 
                              src={photos[survey.surveyId]} 
                              thumbnail 
                              style={{ width: '150px', height: 'auto' }} 
                            />
                          ) : (
                            <div className="bg-secondary" style={{ width: '100%', paddingBottom: '100%' }}></div>
                          )}
                        </Col>
                        <Col xs={9} md={10}>
                          <strong>{survey.question}</strong>
                          {showSurveyDetails === survey.surveyId && (
                            <>
                              <Row className="mt-3">
                                <Col md={8}>
                                  {survey.note && (
                                    <div>
                                      <Form.Label className="font-weight-bold">Составчик:</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={5}
                                        value={survey.note}
                                        readOnly
                                        className="mb-3"
                                      />
                                    </div>
                                  )}
                                  {survey.title && (
                                    <div>
                                      <Form.Label className="font-weight-bold">Мысли супер поваров:</Form.Label>
                                      {survey.title.split('|| ').map((title, index) => (
                                        <div key={index}>• {title}</div>
                                      ))}
                                    </div>
                                  )}
                                </Col>
                                <Col md={4} className="d-flex flex-column justify-content-end">
                                  <Button variant="primary" onClick={() => setShowPhotoModal(true)} className="mb-2">
                                    Изменить фото
                                  </Button>
                                  <Button variant="primary" onClick={() => setShowInfoModal(true)} className="mb-2">
                                    Изменить информацию
                                  </Button>
                                </Col>
                              </Row>
                            </>
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>Пусто</ListGroup.Item>
                )}
              </ListGroup>
              <div className="p-4 d-flex justify-content-evenly align-items-center">
  <Button
    style={{
      width: '40px',
      height: '40px',
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

        {/* Модальное окно для изменения фото */}
        <Modal show={showPhotoModal} onHide={closeModals} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Изменить фото</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editedSurvey && (
              <>
                <Form.Group>
                  <Form.Label>Фото студента</Form.Label>
                  {editedSurvey.photoUrl || photos[editedSurvey.surveyId] ? (
                    <div>
                      <Image 
                        src={editedSurvey.photoUrl || photos[editedSurvey.surveyId]} 
                        thumbnail 
                        style={{ width: '150px', height: 'auto' }} 
                        className="mb-2" 
                      />
                      <Button variant="danger" onClick={deletePhoto}>Удалить фото</Button>
                    </div>
                  ) : (
                    <div className="bg-secondary mb-2" style={{ width: '200px', height: '200px' }}></div>
                  )}
                  <Form.Control type="file" onChange={handleFileChange} />
                  <Button variant="primary" onClick={uploadPhoto} className="mt-2">Загрузить новое фото</Button>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModals}>
              Закрыть
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Модальное окно для изменения информации */}
        <Modal show={showInfoModal} onHide={closeModals} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Изменить информацию</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editedSurvey && (
              <>
                <Form.Group>
                  <Form.Label>Название</Form.Label>
                  <FormControl
                    type="text"
                    value={editedSurvey.question}
                    onChange={(e) => setEditedSurvey({ ...editedSurvey, question: e.target.value })}
                  />
                </Form.Group>
                <Form.Group>
                  <br />
                  <Form.Label>Составчик</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={editedSurvey.note}
                    onChange={(e) => setEditedSurvey({ ...editedSurvey, note: e.target.value })}
                  />
                </Form.Group>
                <Form.Group>
                  <br />
                  <Form.Label>Список комментариев</Form.Label>
                  {editedSurvey.title && editedSurvey.title.split('|| ').map((title, index) => (
                    <div key={index} className="mb-2">
                      {title}
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleRemoveTitle(title)}
                      >
                        Убрать
                      </Button>
                    </div>
                  ))}
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModals}>
              Закрыть
            </Button>
            <Button variant="primary" onClick={updateSurvey}>
              Сохранить изменения
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </BackgroundWrapper>
  );
};

export default StudentList;