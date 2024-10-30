import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { Container, Row, Col, Form, Button, Image, Spinner, Modal } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import BackgroundWrapper from './BackgroundWrapper'; // Импортируйте BackgroundWrapper
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pseudonym, token } = useContext(AuthContext);
  const [survey, setSurvey] = useState(null);
  const [userFullName, setUserFullName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Pagination states for comments
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchSurveyDetails = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/admin/get/surveys/${id}`);
        setSurvey(response.data);
        setUserFullName(response.data.man.pseudonym);
      } catch (error) {
        console.error('Ошибка при получении деталей опроса:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyDetails();
  }, [id]);

  const handleAddComment = async () => {
    if (newTitle.trim() === '') {
      alert('Пожалуйста, заполните поле комментария.');
      return;
    }
  
    const newComment = `${pseudonym}: ${newTitle}`;
    const updatedTitles = survey.title
      ? `${survey.title} || ${newComment}`
      : newComment;
  
    console.log('Отправляемые данные:', {
      ...survey,
      title: updatedTitles,
    });
  
    try {
      await axiosInstance.put(`/admin/update/survey/${id}`, {
        ...survey,
        title: updatedTitles,
      });
      alert('Комментарий успешно добавлен!');
      setNewTitle('');
      setSurvey(prev => ({ ...prev, title: updatedTitles }));
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
  };

  const openImageModal = (src) => {
    setSelectedImage(src);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
  };

  // Pagination logic for comments
  const totalComments = survey?.title ? survey.title.split(' || ').length : 0;
  const totalPages = Math.ceil(totalComments / itemsPerPage);
  const indexOfLastComment = currentPage * itemsPerPage;
  const indexOfFirstComment = indexOfLastComment - itemsPerPage;
  const currentComments = survey?.title ? survey.title.split(' || ').slice(indexOfFirstComment, indexOfLastComment) : [];

  return (
    <BackgroundWrapper> {/* Оберните содержимое в BackgroundWrapper */}
      <Container fluid className="p-0 d-flex flex-column" style={{ minHeight: '100vh' }}>
        <Row className="flex-grow-0 m-0">
          <Col xs={12} md={8} lg={6} className="mx-auto p-0 d-flex flex-column">
            <div className="bg-light shadow flex-grow-1 d-flex flex-column">
              {loading ? (
                <div className="p-4 text-center">
                  <Spinner animation="border" role="status" />
                  <p>Загрузка...</p>
                </div>
              ) : survey ? (
                <>
                  <div className="p-4">
                    <div className="d-flex mb-4">
                      <Link to="/" style={{ textDecoration: 'none' }}>
                        <Button variant="light" className="p-2" title="Вернуться назад">
                          <FontAwesomeIcon icon ={faArrowLeft} />
                        </Button>
                      </Link>
                      <h2 className="text-left mb-4">{survey.question}</h2>
                    </div>

                    <div className="text-right mb-4">
                      <strong> Автор: {userFullName || 'Неизвестно'}</strong>
                    </div>

                    <div className="mb-4">
                      {survey.photos && survey.photos.length > 0 ? (
                        survey.photos.map((photo, index) => (
                          <Image 
                            key={index}
                            src={`data:${photo.contentType};base64,${photo.data}`} 
                            alt="Увеличенное фото" 
                            style={{ width: '200px', height: '200px', objectFit: 'cover', cursor : 'pointer', marginRight: '10px' }} 
                            onClick={() => openImageModal(`data:${photo.contentType};base64,${photo.data}`)} 
                          />
                        ))
                      ) : (
                        <div 
                          className="bg-secondary d-flex align-items justify-content-center"
                          style={{ width: '200px', height: ' 200px', margin: '0 auto' }}
                        >
                          <span className="text-white">Нет фото</span>
                        </div>
                      )}
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label>Состав</Form.Label>
                      <Form.Control as="textarea" rows={5} value={survey.note} readOnly />
                    </Form.Group>

                    {token ? (
                      <>
                        <Form.Group>
                          <Form.Label>Новый коммент</Form.Label>
                          <Form.Control
                            type="text"
                            value ={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                          />
                          <Button variant="primary" onClick={handleAddComment} className="mt-3">
                            Отправить
                          </Button>
                        </Form.Group>

                        <Form.Group>
                          <br />
                          <Form.Label>Комментарии</Form.Label>
                          {currentComments.map((comment, index) => (
                            <div key={index} className="mb-2">
                              • {comment}
                            </div>
                          ))}
                        </Form.Group>

                        <div className="d-flex justify-content-evenly">
                          <Button
                            variant="secondary"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </Button>
                          <p>
                            Страница {currentPage} из {totalPages}
                          </p>
                          <Button
                            variant="secondary"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p>Вы должны авторизоваться, чтобы иметь доступ к комментариям.</p>
                    )}

                    <Modal show={showImageModal} onHide={closeImageModal} size="xl">
                      <Modal.Header closeButton>
                        <Modal.Title>Увеличенное фото</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Image src={selectedImage} alt="Увеличенное фото" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                      </Modal.Body>
                    </Modal>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <p>Ошибка при получении деталей опроса</p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </BackgroundWrapper>
  );
};

export default StudentDetails;