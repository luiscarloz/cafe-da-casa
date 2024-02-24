import './index.css';

const MenuItem = ({ item, onAddToCart }) => {
    return (
      <div className="menu-item">
        <div>{item.name}</div>
        <div>{item.price}</div>
        <button onClick={() => onAddToCart(item)}>Adicionar ao carrinho</button>
      </div>
    );
  };

export default MenuItem;
