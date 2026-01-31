import { useMenu } from '../context/MenuContext';
import { useLocation } from 'react-router-dom';
import './Menu.css';

const Menu: React.FC = () => {
  const { isOpen, closeMenu } = useMenu();
  const location = useLocation();

  const menuItems = [
    { path: '/home', label: 'Home' },
    { path: '/builder', label: 'Builder' },
    { path: '/game', label: 'Game' },
  ];

  const handleItemClick = (path: string) => {
    if (location.pathname !== path) {
      closeMenu();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="menu-backdrop" onClick={closeMenu} />
      )}

      {/* Menu */}
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>Menu</h2>
        </div>

        <nav className="menu-nav">
          {menuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(item.path);
                window.location.href = item.path;
              }}
            >
              <span className="menu-label">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Menu;
