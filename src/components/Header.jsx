import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Dropdown } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import './fonts.css';

const Header = () => {
  const { token, userName, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  const logoStyle = {
    fontFamily: "'ofont.ru_Czizh', sans-serif",
    fontSize: '24px'
  };

  return (
    <Navbar bg="black" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/" style={logoStyle}>
          ВкуснаяЕда
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/student-feed">Рецепты</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {token ? (
              <>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                    {userName}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/students">Мои Рецепты</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile">Профиль</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>Выйти</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <Dropdown>
                <Dropdown.Toggle variant="outline-light">
                  Добавить рецепт
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/login">
                    Войти
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/register">
                    Регистрация
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;