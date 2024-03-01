import React, { useState } from 'react';
import './index.css';
import { Modal, CircularProgress } from '@mui/material';
import Checkout from '../checkout';
import axios from 'axios';

const CartModal = ({ items, onClose, removeFromCart }) => {

  const totalPrice = items.reduce((total, item) => {
    const itemPrice = parseFloat(item.item.price.replace('R$', '').replace(',', '.'))
    return total + itemPrice * item.quantity;
  }, 0).toFixed(2)  

  
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false)
  const [formData, setFormData] = useState({ nome: '', telefone: '', aniversario: '' })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [userId, setUserId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  
  const closeSecondModal = () => {
    setIsSecondModalOpen(false);
  }
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCancelOrder = () => {
    onClose();
    removeFromCart(null, true);
    setFormData({ nome: '', telefone: '', aniversario: '' });
  }  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.nome && formData.telefone && formData.aniversario) {
      try {
        const response = await axios.post('https://cafe-da-casa-api.onrender.com/users/create', {
          name: formData.nome,
          whatsapp: formData.telefone,
          birthday: formData.aniversario
        });
        const userId = response; // Extrai o user-id da resposta
        setUserId(userId.data[0].id)
        setOpenModal(false);
        setIsSecondModalOpen(true);
      } catch (error) {
        console.error('Erro ao enviar o formulário:', error);
        // Lógica para lidar com erros, como exibir uma mensagem de erro ao usuário
      }
    } else {
      alert("Por favor, preencha todos os campos antes de continuar.");
    }
  }
  
  const enviarPedido = async () => {
    try {
      // Atualiza o estado do pedido para incluir o paymentStatus como "pending"
      console.log(items.map(item => ({ product_id: item.item.product_id, quantity: item.quantity })), 'order_details' )
      console.log(items , 'items' )
      const pedidoAtualizado = {
        user_id: userId, // Assuma que userId foi definido anteriormente
        payment_status: 'pending', // Define o paymentStatus como "pending"
        order_status: 'pending', // Pode definir o order_status inicial como "pending" ou outro valor apropriado
        total: calcularTotal(), // Função para calcular o total do pedido
        order_details: items.map(item => ({ product_id: item.item.product_id, quantity: item.quantity })) // Mapeia os itens do carrinho para o formato esperado pelo backend
      };

      // Envia uma requisição POST para o backend com os dados do pedido
      const response = await axios.post('https://cafe-da-casa-api.onrender.com/orders/create', pedidoAtualizado);
      console.log('Pedido enviado com sucesso:', response.data);
      setOrderId(response.data[0].order_id)
      setPedidoEnviado(true);
    } catch (error) {
      console.error('Erro ao enviar o pedido:', error);
      // Lógica para lidar com erros, como exibir uma mensagem de erro ao usuário
    }
  };

  // Função para calcular o total do pedido
const calcularTotal = () => {
  if (!items || items.length === 0) {
    return 0; // Retorna 0 se não houver itens no carrinho
  }
  
  return items.reduce((total, item) => {
    const itemPrice = item.item && item.item.price ? parseFloat(item.item.price.replace('R$', '').replace(',', '.')) : 0;
    return total + itemPrice * item.quantity;
  }, 0).toFixed(2);
};


  const handlePagarNoBalcao = () => {
    // Verifica se o pedido já foi enviado para evitar envios duplicados
    if (!pedidoEnviado) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      // Chama a função para enviar o pedido
      enviarPedido();
    }
  };

  return (
    <div className="cart-modal-container">
      <div className={`cart-modal`}>
        <div className="cart-title-itens-ctn">
          <img src="https://cdn-icons-png.flaticon.com/128/3091/3091221.png" loading="lazy" alt="sacola de compras" title="sacola de compras" width="55" height="55" />
          {items.map((item, index) => (
            <div style={{ width: '80%', textAlign: '-webkit-center' }} key={index}>
              {[...Array(item.quantity)].map((_, i) => (
                <div className="itens-ctn" key={i}>
                  <div>
                  <span className="itens-label">{item.item.label}:</span>
                  <span className="itens-price">{item.item.price}</span>  
                  </div>
                  <button className='btn-remove' onClick={() => removeFromCart(index)}>
                    <img src="https://cdn-icons-png.flaticon.com/128/8385/8385056.png" loading="lazy" alt="marca x " title="marca x " width="11" height="11"></img>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className='btns-container'>
          <button className="fechar-pedido-btn" onClick={() => setIsModalOpen(true)}>Concluir R${totalPrice}</button>
          <button className="continuar-pedido-btn" onClick={onClose}>Continuar o pedido</button>
        </div>
      </div>
      {!openModal && <Modal
          open={isModalOpen}
          onClose={closeModal}
        >
          <div className='modal-ctn'>
            <form onSubmit={handleSubmit}>
              <h1>Preencha para continuar.</h1>
              <button className='btn-close' onClick={closeModal}>
                <svg style={{ color: 'white', width: "30px", height: "20px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z" width="20px" height="20px" fill="white"></path>
                </svg>
              </button>
              <h2>Nome</h2>
              <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} />
              <h2>Whatsapp *aqui voce recebera um aviso de pedido pronto para retirada</h2>
              <input type="tel" name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder='ex: 6199999-9999' />
              <h2>Aniversario</h2>
              <input type="text" name="aniversario" value={formData.aniversario} onChange={handleInputChange} />
              <button className='submit-btn' type="submit">Proximo Passo</button>
              <button className='cancel-order-btn' type="button" onClick={handleCancelOrder}>Cancelar Pedido</button>
            </form>
          </div>
        </Modal>}
      
      {isSecondModalOpen && (
        <Modal
          open={isSecondModalOpen}
          onClose={closeSecondModal}
        >
          <div className='modal-ctn'>
            <div className='local-pagamento-modal'>
              {!pedidoEnviado && (
                <div style={{width: '100%', textAlign: '-webkit-center'}}>
                  <button onClick={handlePagarNoBalcao}>Pagar no Balcão</button>
                  <Checkout items={items} userId={userId}/>
                </div>  
              )}
              {pedidoEnviado && (
                <div>
                        {loading ? (
                  <div className='loading-container'>
                    <CircularProgress style={{color: 'white'}}/>
                  </div>
                ) : (
                  <div className='pix-pagamento-ctn'>
                    <h1 style={{marginBottom: 0}}>Pedido Confirmado!</h1>
                    <h1 style={{marginTop: 0, marginBottom: 15}}>#{orderId}</h1> 
                    <h2 style={{marginBottom: 5}}>Quando você receber uma mensagem no seu WhatsApp para retirada, vá ao balcão realizar o pagamento...</h2>
                    <p style={{width: '80%'}}>Assim que seu pedido estiver pronto, você receberá uma mensagem para a retirada!<br /> Caso não receba a mensagem em 20 minutos, se direcione até o balcão.</p>
                    <p>O Café da Casa agradece, Deus abençoe!</p>
                  </div>
                )}
                </div>
              )}
              
            </div>            
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CartModal;
