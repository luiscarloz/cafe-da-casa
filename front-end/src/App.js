import './App.css';
import Menu from '../src/menu/index'

function App() {
  const menuItems = [
    { name: 'Café', price: 'R$ 5.00' },
    { name: 'Cappuccino', price: 'R$ 7.00' },
    { name: 'Latte', price: 'R$ 6.00' },
  ];
  return (
    <div className="App">
      <Menu menuItems={menuItems} />
    </div>
  );
}

export default App;
