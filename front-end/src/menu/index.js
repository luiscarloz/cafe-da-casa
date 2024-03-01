import React, { useState, useEffect } from 'react'
import CartModal from '../cart-modal/index'
import { Button, Modal, Fade, CircularProgress } from '@mui/material'
import './index.css'
import axios from 'axios';

const Menu = () => {
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartItems, setCartItems] = useState([])
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [itensModalOpen, setItensModalOpen] = useState(false)
  const [pedidoIniciado, setPedidoIniciado] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [miniModalOpen, setMiniModalOpen] = useState(false)
  const [optionsClassicosState, setoptionsClassicosState] = useState({})
  const [optionsGeladosState, setOptionsGeladosState] = useState({})
  const [optionsComidasState, setOptionsComidasState] = useState({})
  const [optionsEspeciaisState, setOptionsEspeciaisState] = useState({})
  const [optionsDocesState, setOptionsDocesState] = useState({})
  const [optionsLojinhaState, setOptionsLojinhaState] = useState({})
  const [quantity, setQuantity] = useState(1)




  useEffect(() => {
    const fetchProducts = async () => {
      try {
          const response = await axios.get('https://cafe-da-casa-api.onrender.com/products/all');
          const products = response.data;
          if (!products) return;
      
          // Função de ordenação
          const sortProducts = (a, b) => {
            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            return 0;
          };
      
          // Filtragem e ordenação dos produtos por categoria
          const classicosProducts = products.filter(product => product.category === 'classico').sort(sortProducts);
          setoptionsClassicosState(classicosProducts.map(product => ({
            product_id: product.id,
            label: product.name,
            description: product.description || 'Descrição indisponível',
            img: `<img src="${product.image_url}" alt="${product.name}" />`,
            price: `R$ ${product.price.toFixed(2)}`,
          })));
      
          const geladosProducts = products.filter(product => product.category === 'gelados').sort(sortProducts);
              setOptionsGeladosState(geladosProducts.map(product => ({
                product_id: product.id,
                label: product.name,
                description: product.description || 'Descrição indisponível',
                img: `<img src="${product.image_url}" alt="${product.name}" />`,
                price: `R$ ${product.price.toFixed(2)}`,
              })));
      
              const especiaisProducts = products.filter(product => product.category === 'especiais').sort(sortProducts);
              setOptionsEspeciaisState(especiaisProducts.map(product => ({
                product_id: product.id,
                label: product.name,
                description: product.description || 'Descrição indisponível',
                img: `<img src="${product.image_url}" alt="${product.name}" />`,
                price: `R$ ${product.price.toFixed(2)}`,
              })));
      
              const comidasProducts = products.filter(product => product.category === 'comidas').sort(sortProducts);
              setOptionsComidasState(comidasProducts.map(product => ({
                product_id: product.id,
                label: product.name,
                description: product.description || 'Descrição indisponível',
                img: `<img src="${product.image_url}" alt="${product.name}" />`,
                price: `R$ ${product.price.toFixed(2)}`,
              })));
      
              const docesProducts = products.filter(product => product.category === 'doces').sort(sortProducts);
              setOptionsDocesState(docesProducts.map(product => ({
                product_id: product.id,
                label: product.name,
                description: product.description || 'Descrição indisponível',
                img: `<img src="${product.image_url}" alt="${product.name}" />`,
                price: `R$ ${product.price.toFixed(2)}`,
              })));
      
              const lojinhaProducts = products.filter(product => product.category === 'lojinha').sort(sortProducts);
              setOptionsLojinhaState(lojinhaProducts.map(product => ({
                product_id: product.id,
                label: product.name,
                description: product.description || 'Descrição indisponível',
                img: `<img src="${product.image_url}" alt="${product.name}" />`,
                price: `R$ ${product.price.toFixed(2)}`,
              })));
          // Restante do código de obtenção e configuração dos produtos...
          setLoadingProducts(false)
          setLoading(false); // Marca o carregamento como concluído após a busca dos produtos.
    } catch (error) {
      console.error('Erro ao obter os produtos:', error);
      setLoading(false); // Marca o carregamento como concluído em caso de erro.
      setLoadingProducts(false)
    }
  };

  const delay = setTimeout(() => {
    fetchProducts();
  }, 2000); // 2 segundos de atraso antes de buscar os produtos

  return () => clearTimeout(delay);
}, []);


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
    console.log(cartItems, 'cartItems')
  }
  const removeFromCart = (index, reset) => {
    if (reset) {
      setCartItems([]);
      setPedidoIniciado(false)
    } else {
      const newCartItems = [...cartItems];
      if (newCartItems[index].quantity > 1) {
        newCartItems[index].quantity--; 
      } else {
        newCartItems.splice(index, 1);
      }
      setCartItems(newCartItems);
    }
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
  const handleOpenSecondModal = (label, description, img, price, product_id) => {
    // setLoading(false)
    setSelectedItem({ label, description, img, price, product_id })
    openMiniModal()
  }

  const totalQuantity = cartItems.reduce((total, currentItem) => total + currentItem.quantity, 0);
  const totalPrice = cartItems.reduce((total, currentItem) => total + (parseFloat(currentItem.item.price.replace('R$', '').replace(',', '.')) * currentItem.quantity), 0).toFixed(2);

  let options = []
  switch(selectedOption) {
    case 'Classicos':
      optionsClassicosState.forEach(option => {
        options.push(option);
      })
    break;
    
    case 'Gelados':
      optionsGeladosState.forEach(option => {
        options.push(option)
      })
    break
    case 'Especiais':
      optionsEspeciaisState.forEach(option => {
        options.push(option)
      })
    break
    case 'Comidas':
      optionsComidasState.forEach(option => {
        options.push(option)
      })
    break
    case 'Doces':
      optionsDocesState.forEach(option => {
        options.push(option)
      })
    break
    case 'Lojinha':
      optionsLojinhaState.forEach(option => {
        options.push(option)
      })
    break
    default:
      options = []
  }

  // ...imports e código anterior

return (  
  <div>  
    {!pedidoIniciado ? (
      <div className='bemvindoCtn'>
        <button onClick={iniciarPedido}>Iniciar Pedido</button>
      </div>
    ) : (
      <div>
        {loading ? (
          <div className='loading-container'>
            <CircularProgress style={{color: 'white'}}/>
          </div>
        ) : (
          <div className='opcoesMenuCtn'>
            <div className='opcoesMenuDivCtn'>
              <div className='opcoesMenuDiv'>
                <button className='opcoesMenuItem' onClick={() => handleOptionClick('Classicos')}>
                  <img class="styles_image__5tr0_" src="../../capa-classicos.jpg" />
                  <h2>Classicos</h2>
                </button>
                <button className='opcoesMenuItem' onClick={() => handleOptionClick('Gelados')}>
                  <img class="styles_image__5tr0_" src="../../capa-gelados.jpg"/>
                  <h2>Gelados</h2>
                </button>
              </div>
              <div className='opcoesMenuDiv'>
                <button className='opcoesMenuItem'>
                  <img class="styles_image__5tr0_" onClick={() => handleOptionClick('Especiais')} src="../../capa-especiais.jpg" />
                  <h2>Especiais</h2>
                </button>
                <button className='opcoesMenuItem'>
                  <img class="styles_image__5tr0_" onClick={() => handleOptionClick('Comidas')} src="../../capa-comidas.jpg"/>
                  <h2>Comidas</h2>
                </button>
              </div>
              <div className='opcoesMenuDiv'>
                <button className='opcoesMenuItem'>
                  <img class="styles_image__5tr0_" onClick={() => handleOptionClick('Doces')} src="../../APP_Brigadeiro.jpg"/>
                  <h2>Doces</h2>
                </button>
                <button className='opcoesMenuItem'>
                  <img class="styles_image__5tr0_" onClick={() => handleOptionClick('Lojinha')} src="../../capa-lojinha.jpg"/>
                  <h2>Lojinha</h2>
                </button>
              </div>
            </div>
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
                  {loadingProducts ? (
                    <div className='loading-container'>
                      <CircularProgress style={{ color: 'black', zIndex: 9999 }} />
                    </div>
                  ) : (
                    options
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((option, index) => (
                        <div key={index} className='itensBtn'>
                          <Button onClick={() => handleOpenSecondModal(option.label, option.description, option.img, option.price, option.product_id)}>
                            <span className='itemImg' dangerouslySetInnerHTML={{ __html: option.img }} /> 
                            <div className='textItemCtn'>
                              <span className='itemTitle'>{option.label}</span> 
                              <span className='itemDesc'>{option.description}</span> 
                              <span className='itemPrice'>{option.price}</span> 
                            </div>
                          </Button>
                        </div>
                      ))
                  )}
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
    )}
  </div>
)

// ...exportação e final do código

}

export default Menu
