import React, { useState } from 'react'
import CartModal from '../cart-modal/index'
import { Button, Modal, Fade } from '@mui/material'
import './index.css'

const Menu = ({ menuItems }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [itensModalOpen, setItensModalOpen] = useState(false)
  const [pedidoIniciado, setPedidoIniciado] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [miniModalOpen, setMiniModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  
  const addToCart = (item, quantity) => {
    const index = cartItems.findIndex((cartItem) => cartItem.item.label === item.label)
    if (index !== -1) {
      const updatedCartItems = [...cartItems]
      updatedCartItems[index].quantity += quantity
      setCartItems(updatedCartItems)
    } else {
      setCartItems([...cartItems, { item, quantity }])
    }
    setItensModalOpen(!itensModalOpen)
    setMiniModalOpen(!miniModalOpen)
    setQuantity(1)
  }
  const removeFromCart = (index) => {
    const newCartItems = [...cartItems]
    newCartItems.splice(index, 1)
    setCartItems(newCartItems)
  }
  const toggleCartModal = () => {
    setCartModalOpen(!cartModalOpen)
  }
  const toggleItensModal = () => {
    setItensModalOpen(!itensModalOpen)
  }
  const iniciarPedido = () => {
    setPedidoIniciado(true)
  }
  const handleOptionClick = (option) => {
    setSelectedOption(option)
    setItensModalOpen(true)
  }
  const openMiniModal = () => {
    setMiniModalOpen(true)
  }
  const closeMiniModal = () => {
    setMiniModalOpen(false)
  }
  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }
  const handleOpenSecondModal = (label, description, img, price) => {
    setSelectedItem({ label, description, img, price })
    openMiniModal()
  }
const totalQuantity = cartItems.reduce((total, currentItem) => total + currentItem.quantity, 0);
const totalPrice = cartItems.reduce((total, currentItem) => total + (parseFloat(currentItem.item.price.replace('R$', '').replace(',', '.')) * currentItem.quantity), 0).toFixed(2);

  let options = []
  switch(selectedOption) {
    case 'bebidasQuentes':
      options = [
        { label: 'Café', description: 'Cafe preto quentinho gostoso', img: '<img class="styles_image__5tr0_" src="https://storage.googleapis.com/thecoffee-ws/images/purista-americano_480x480.jpg?GoogleAccessId=thecoffee-ws%40thecoffee-gke.iam.gserviceaccount.com&amp;Expires=1709317447&amp;Signature=JZdnGhmqW0j2Akmd12UHoJsYDezZJqO92pVVcxgmoKfe7q6YZLw6rodXX82g1GKV9Eigtn1qo3KEaZS0mP6nnG6qDGh%2FcGkkJx40PPP3jfCJmHZhReXMQoguYlnRftqOTBRu7GSUv5XA%2F188PWAECZ2HXK3SD9sDPNaDID4hpxlG557UVdB1tNV3WgDcKx3G0%2BtKLRaMtwtjS42WibJKicJ9A6kA6c%2FgytF4Yv5OC%2BxHOnRBkHH7Cq8XJHGplSFNukyVXoZnhJgosOzsekAbjHNlW6zXgp%2FMFbp4rshiI%2Bea3pM8ULHMcLW5BVyAFelQVtR%2BJOf1bVukDoGBV7Bz%2Bw%3D%3D">', price: 'R$10,00' },
        { label: 'Chá', description: 'Chazim ruim e quente', img: '<img class="styles_image__5tr0_" src="https://storage.googleapis.com/thecoffee-ws/images/quente-matcha-latte_480x480.jpg?GoogleAccessId=thecoffee-ws%40thecoffee-gke.iam.gserviceaccount.com&amp;Expires=1709317447&amp;Signature=Xv6XFUiSJvXPOTCYz0Dc5rn4BlSrbu6wj81%2Bhp3wU%2Fd2bEf%2BKxcytY2x%2Bp4Y1X03Rlrgk0KYs5qOYxI74BLkpNNLXMWB3FKk5HRPzcfaIJkk7h47zaXTAvc%2BFcgV8FpoTcOLUXLfyVJ6Sp1%2F58pn0fKFmui9AhnDIoX7pAZE6FqxsTEmBrq8MKMnPcfi93r5F%2BNSNrwBIzNjV32LBSNSHHSCkhrDXjaeyeQpgkF38fl17k4pB0D4yzT9wM4wVXN2wooxrnOUrNYd9MrBI%2BF5e4NWvhYNJ7JmvuDu8j1k2l52T6iagBCqNE42iEhSYJLuUhGYyWQuMG94MrnMG2leZw%3D%3D">', price: 'R$12,00' },
        { label: 'Chocolate Quente', description: 'Chocolatezinho quente delicia', img: '<img class="styles_image__5tr0_" src="https://storage.googleapis.com/thecoffee-ws/images/quente-urban-chocolat_480x480.jpg?GoogleAccessId=thecoffee-ws%40thecoffee-gke.iam.gserviceaccount.com&amp;Expires=1709317448&amp;Signature=ojsRFw%2BR8LcH%2FNuq5v71P1AOj6tk6psrIcjci7rdKpUQZFJ8FTNNU32rVweDhVGgtj%2BTTl3XcqXZuu7fvVDFU9nsxqiYMSxZCn7ShLkEy2Ayqwke3e%2BuoEfJx1vCgcJ6EvadzO%2BTs%2BF6xWcSctsTgKNjL2TqsumfIdqKnXG4p5yDLmwOVct1fpXBHirN1GK5NvbTBTV4UM0Op%2BxaP0KMFrcFees0nKrC1ow2ixYoU6P2uYlz%2BWxEWcipjqgYeJ%2BfYaQuIvelqqKcvzZyHT1lEyJ8MBPg54DIdLYxCiAdlJACNH21GSSnt9nMBBrhjBWzW3SGGCtswTkPuFAjO4SBug%3D%3D">', price: 'R$15,50' }
      ]
      break
    case 'bebidasGeladas':
      options = ['Refrigerante', 'Suco', 'Frappuccino']
      break
    case 'salgados':
      options = ['Sanduíche', 'Pastel', 'Coxinha']
      break
    case 'sobremesas':
      options = ['Bolo', 'Sorvete', 'Pudim']
      break
    default:
      options = []
  }

  return (  
    <div>
      {!pedidoIniciado ? (
        <div className='bemvindoCtn'>
          <button onClick={iniciarPedido}>Iniciar Pedido</button>
        </div>
      ) : (
        <div className='opcoesMenuCtn'>
          <button className='opcoesMenuItem' onClick={() => handleOptionClick('bebidasQuentes')}>
          <img class="styles_image__5tr0_" src="https://storage.googleapis.com/thecoffee-ws/images/quente-truewhite_480x480.jpg?GoogleAccessId=thecoffee-ws%40thecoffee-gke.iam.gserviceaccount.com&amp;Expires=1709317447&amp;Signature=RXPHuZ6tp%2FLQaiMSQewBNMRVZ5DIa3JBq4ryvS%2BXpvElNU6xoYbCGtWkH9s8%2Bj0W9CPFfJPvA%2BIlOzHpufjcPuUCvtc7GMf%2Fa4DhmERLTknvJ1OdFd1vurDqtO8L%2ByTZ9TEwNprOks%2FI8y%2FvXIEmgeXa2FnOR8glQNFPiUuYT9QzHg4ek5jgn%2Bp%2B0XDKWqGlDzU3%2FjuF3hOiZSKsx%2FHvHVp3Mo23WCyNakKuurmO7Vf9jay0K0XolLCNvWzFyXrM0I132aHuTT%2BUullZB%2FZTFKLVmjFSHjllZrYetjy1U5F4cMDwzIKtP%2FhlbTMpzz3YwcxXutjG42OuTf8%2Fp98K%2Bw%3D%3D" />
            <h2>Bebidas Quentes</h2>
          </button>
          <button className='opcoesMenuItem'>
          <img class="styles_image__5tr0_" src="https://storage.googleapis.com/thecoffee-ws/images/purista-iced-latte_480x480.jpg?GoogleAccessId=thecoffee-ws%40thecoffee-gke.iam.gserviceaccount.com&amp;Expires=1709317448&amp;Signature=pDl8qlfYyyMmbg71BJfxGYBpjGEWUWOcOY%2BE7K38B14Ip%2B87Tcslq5Es%2B0Z4AoLYg3QpgPY1ky4H%2B4L56JBPBZuMB5x%2BUdQ0BRTSbHWixalDjsFyR65EfV8mAH1vIdM%2F1csIXZu2F5Br29%2B6KLTId6T4ePWE2PX6cBLVOQXUaaAC8NAlPHJ1xL%2Be%2FW%2FmoxuqwsPbJZlK5rNIn52YjbXvLEMTm35LZXxZkgEZFllqLYXAgJo1x1g0OZXGUUuKhVkkJ56UYwjUAEoBDlJJ7C8UIVg05%2Bidpu4KO%2BvgwQM8%2FtgkJY3NhYPCEJ90LoEWMZ4lMvax99eQSyiLYgj89UFQ3w%3D%3D" />
            <h2>Bebidas Geladas</h2>
          </button>
          <button className='opcoesMenuItem'>
          <img class="styles_image__5tr0_" src="https://storage.googleapis.com/thecoffee-ws/images/croissant-2_480x480.jpg?GoogleAccessId=thecoffee-ws%40thecoffee-gke.iam.gserviceaccount.com&amp;Expires=1709317449&amp;Signature=EAEj9FmuJdq2KeZTULFlzeq2NVJSw5GpRun3p3K3QPqk%2FJ%2FzXkyjWT9q9CYmso%2FNSkLYV3mbPaw%2BpJWiGqjC8gXqt%2B8QclxIJntnJk17bijyRk1U18tpoX6kUggdDPgv6QAcSuANeT9OwCY9%2Bub7rN52js523Ka5rwUTr2Wek5w4rHDJRyfzh94JXGvPmGUHL8kh1aw2Hnn3DN6UI9%2BoPib1xVUNFFkODHtzFZypCAlZVvapHJ0HZGZVtuql%2BLcl0s%2B46fmryAv8XaUm4qRxxnpnYL%2BxSHDCKQgBofOwT5iw0tSS0LlUt2u0mPAa2dXMRttHybWI8oWffbdJof2pKQ%3D%3D" />
            <h2>Salgados</h2>
          </button>
          <button className='opcoesMenuItem'>
          <img class="styles_image__5tr0_" src="https://storage.googleapis.com/thecoffee-ws/images/brownie_480x480.jpg?GoogleAccessId=thecoffee-ws%40thecoffee-gke.iam.gserviceaccount.com&amp;Expires=1709317450&amp;Signature=IhubZ0M7%2BrLDO4Vrq6%2FQ9yUOm3JceEujfskx95ZgDjhy4Z13MSvHHjq4PGSZ%2Fkuhjtamx9%2BOKxatEoygrzhS50fYre7JlTC71NICj40rxBmqtQiHMx9yGc7Rw61fB%2FRdKVVZs7UcAhu%2BJ4nPSxYRvBUQMcDuybIF3DhVNFNUYJkM1a3bw%2BOcYYrb80F3Ro4wYCGFjoepcwenJAqMhRRvJZ98roQE1s8c2QGysc5RzKqgF5uhM0lxJPa5SNHyvoYl3VTWBUdYMU8%2F8LoBJRGufbXnUf%2FMfoDYJBudcStskXpE3OR%2BTWRdvQkdP%2BjpfJk%2FKl7B4Bgh2Iju%2BMNcOEB0%2Fw%3D%3D" />
            <h2>Sobremesas</h2>
          </button>
          <button className='carrinhoBtn' onClick={toggleCartModal}>
            Carrinho ({totalQuantity}) R${totalPrice}
          </button>
          {cartModalOpen && <CartModal items={cartItems} onClose={toggleCartModal} removeFromCart={removeFromCart} />}
          <Modal
            open={itensModalOpen}
            onClose={toggleItensModal}
            closeAfterTransition
          >
            <Fade in={itensModalOpen}>
              <div className='menuItensModalCtn'>
              {options.map((option, index) => (
                <div key={index} className='itensBtn'>
                  <Button onClick={() => handleOpenSecondModal(option.label, option.description, option.img, option.price)}>
                    <span className='itemImg' dangerouslySetInnerHTML={{ __html: option.img }} /> 
                    <div className='textItemCtn'>
                      <span className='itemTitle'>{option.label}</span> 
                      <span className='itemDesc'>{option.description}</span> 
                      <span className='itemPrice'>{option.price}</span> 
                    </div>
                  </Button>
                </div>
              ))}
                <button className='carrinhoBtn' onClick={toggleCartModal}>
                  Carrinho ({totalQuantity}) R${totalPrice}
                </button>
              </div>
            </Fade>
          </Modal>
          <Modal
            open={miniModalOpen}
            onClose={closeMiniModal}
          >
            <div className="itemDetailsModal">
              {selectedItem && (
                <span className='itemImg' dangerouslySetInnerHTML={{ __html: selectedItem.img }}/> 
              )} 
              {selectedItem && selectedItem.label && (
                <div className='textItemCtnModal'>
                  <span className='itemTitleModal'>{selectedItem.label}</span> 
                  <span className='itemDescModal'>{selectedItem.description}</span> 
                  <div className='itemQuantityModal'>
                    <button onClick={decreaseQuantity}>-</button>
                    <span>{quantity}</span>
                    <button onClick={increaseQuantity}>+</button>
                  </div>
                  <button className="add-carrinho-btn"onClick={() => addToCart(selectedItem, quantity)}>Adicionar ao Carrinho</button>
                  
                </div>
              )}
            </div>
          </Modal>
      </div>
      )}
      
    </div>
  )
}

export default Menu