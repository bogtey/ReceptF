import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, Alert } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import axiosInstance from '../axiosInstance';

const Profile = () => {
    const { userName, manId, pseudonym, loading, setPseudonym } = useContext(AuthContext);
    const [tempPseudonym, setTempPseudonym] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        setTempPseudonym(pseudonym);
    }, [pseudonym]);

    const handlePseudonymChange = async () => {
        if (!manId) {
            setErrorMessage('Ошибка: идентификатор пользователя не найден.');
            return;
        }
    
        // Проверка на пустое поле
        if (tempPseudonym.trim() === '') {
            setErrorMessage('Ошибка: псевдоним не может быть пустым.');
            return;
        }
    
        // Проверка на уникальность псевдонима
        try {
            const checkResponse = await axiosInstance.get(`/auth/check-pseudonym/${tempPseudonym}`);
            console.log("Check pseudonym response:", checkResponse.data); // Log the response
            if (checkResponse.data) {
                setErrorMessage('Ошибка: псевдоним уже существует. Выберите другой.');
                return;
            }
        } catch (error) {
            console.error("Error checking pseudonym:", error); // Log the error
            setErrorMessage('Ошибка при проверке псевдонима. Попробуйте еще раз.');
            return;
        }
    
        // Обновление псевдонима
        try {
            const response = await axiosInstance.put(`/admin/update/pseudonym/${manId}`, { pseudonym: tempPseudonym });
            setSuccessMessage(response.data.message || 'Псевдоним обновлен успешно');
            setPseudonym(tempPseudonym); // Обновляем псевдоним в контексте
            setIsEditing(false);
            setErrorMessage(''); // Сброс сообщения об ошибке
        } catch (error) {
        }
    };

    return (
        <Container fluid className="p-0 d-flex flex-column vh-100">
            <Row className="flex-grow-1 m-0">
                <Col xs={12} md={8} lg={6} className="mx-auto p-0 d-flex flex-column">
                    <div className="bg-light shadow flex-grow-1 d-flex flex-column">
                        {loading ? (
                            <div className="p-4 text-center">
                                <Spinner animation="border" role="status" />
                                <p>Загрузка...</p>
                            </div>
                        ) : (
                            <Card className="text-center">
                                <Card.Header as="h5">Профиль пользователя</Card.Header>
                                <Card.Body>
                                    <Card.Title>{userName}</Card.Title>
                                    <Card.Text>
                                        <strong>Имя пользователя:</strong> {userName} <br />
                                        <strong>Псевдоним:</strong> {isEditing ? tempPseudonym : pseudonym || "Нет псевдонима"}
                                    </Card.Text>
                                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                                    {isEditing ? (
                                        <Form>
                                            <Form.Group controlId="formPseudonym">
                                                <Form.Label>Новый псевдоним</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={tempPseudonym}
                                                    onChange={(e) => setTempPseudonym(e.target.value)}
                                                />
                                            </Form.Group>
                                            <Button variant="primary" onClick={handlePseudonymChange}>Сохранить</Button>
                                            <Button variant="secondary" onClick={() => setIsEditing(false)}>Отменить</Button>
                                        </Form>
                                    ) : (
                                        <Button variant="primary" onClick={() => setIsEditing(true)}>Редактировать псевдоним</Button>
                                    )}
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;