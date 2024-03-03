import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './index.css';

const api = axios.create({
  baseURL: "https://api.mercadopago.com"
});

api.interceptors.request.use(async config => {
  config.headers.Authorization = 'Bearer APP_USR-8887376690913685-022714-7fab183d45e7c97ffda46fd9fc11c0d3-1025612599';
  return config;
});

const Checkout = ({ items, userId }) => {
  const [responsePayment, setResponsePayment] = useState(null);
  const [pixCode, setPixCode] = useState(null);
  const [statusPayment, setStatusPayment] = useState(false);
  const [totalPedido, setTotalPedido] = useState(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const pedidoEnviadoRef = useRef(false); // Usamos useRef para criar uma referência mutável

  const getStatusPayment = () => {
    if (responsePayment) {
      api
        .get(`v1/payments/${responsePayment.data.id}`)
        .then(response => {
          if (response.data.status === "approved" && !pedidoEnviadoRef.current) {
            setStatusPayment(true);
            enviarPedido();
            pedidoEnviadoRef.current = true; // Marcamos que o pedido foi enviado
          }
        })
        .catch(err => console.error("Erro ao verificar status do pagamento:", err));
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      getStatusPayment();
    }, 2000); // Chamada a cada 2 segundos

    return () => clearInterval(intervalId); // Limpando o intervalo quando o componente é desmontado

  }, [responsePayment]); // Executar o efeito apenas quando responsePayment mudar

  const handleSubmit = (event) => {
    event.preventDefault();
    const totalPrice = items.reduce((total, item) => {
      const itemPrice = parseFloat(item.item.price.replace('R$', '').replace(',', '.'));
      setTotalPedido(total + (itemPrice * item.quantity));
      return total + (itemPrice * item.quantity);
    }, 0);
    const itemTitles = items.map(item => item.item.label);
    const body = {
      "transaction_amount": totalPrice,
      "payment_method_id": "pix",
      "description": itemTitles.join(", "), // Joining all item labels into a string
      "payment_method_id": "pix",
      "payer": {
        "email": "cafedacasa@gmail.com",
        "first_name": "Cafe",
        "last_name": "da Casa",
        "identification": {
          "type": "CPF",
          "number": "01234567890",
        },
      }
    };

    api.post('v1/payments', body)
      .then(response => {
        setResponsePayment(response);
        setPixCode(response.data.point_of_interaction.transaction_data.qr_code);
      })
      .catch(err => {
        console.error("Erro ao enviar requisição de pagamento:", err);
      });
  };

  const copyToClipboard = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode)
        .then(() => setPixCopiado(true))
        .catch(err => console.error("Erro ao copiar código PIX:", err));
    }
  };

  const enviarPedido = async () => {
    try {
      // Atualiza o estado do pedido para incluir o paymentStatus como "pending"
      console.log(items.map(item => ({ product_id: item.item.product_id, quantity: item.quantity })), 'order_details');
      console.log(items, 'items');
      const pedidoAtualizado = {
        user_id: userId, // Assuma que userId foi definido anteriormente
        payment_status: 'approved', // Define o paymentStatus como "pending"
        order_status: 'pending', // Pode definir o order_status inicial como "pending" ou outro valor apropriado
        total: totalPedido, // Função para calcular o total do pedido
        order_details: items.map(item => ({ product_id: item.item.product_id, quantity: item.quantity })) // Mapeia os itens do carrinho para o formato esperado pelo backend
      };

      // Envia uma requisição POST para o backend com os dados do pedido
      const response = await axios.post('https://cafe-da-casa-api.onrender.com/orders/create', pedidoAtualizado);
      setOrderId(response.data[0].order_id)
      console.log('Pedido enviado com sucesso:', response.data);
      // setPedidoEnviado(true); // Não precisamos mais desta linha, pois usamos a ref
    } catch (error) {
      console.error('Erro ao enviar o pedido:', error);
      // Lógica para lidar com erros, como exibir uma mensagem de erro ao usuário
    }
  };

  return (
    <div className="checkout-ctn">
      {!responsePayment && <button className='pagar-pix-btn' onClick={handleSubmit}>Pagar com PIX</button>}
      {pixCode && (
        <div className="pix-pagamento-ctn">
        {responsePayment && (
          <div className='text-copiar-pix'>
            {!statusPayment ? (
              <div style={{ textAlign: '-webkit-center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center' }}>
                <h1>Pedido aguardando pagamento...</h1>
                <p>Copie o código abaixo para pagar via Pix: </p>
                <input type="text" readOnly value={pixCode} />
                <button onClick={copyToClipboard}>Copiar Código PIX</button>
                {pixCopiado && (
                  <svg
                    style={{   
                      width: '30px',
                      height: '30px',
                      fill: '#fff',
                      enableBackground: 'new 0 0 694.49 694.49'
                    }}  
                    version="1.1"
                    id="Camada_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 694.49 694.49"
                    xmlSpace="preserve"
                  >
                    <g>
                      <path d="M347.4,652.93C178.67,653.08,41.84,516.46,41.54,347.54C41.24,178.69,178.46,41.41,347.39,41.56
                        c168.85,0.15,305.56,136.91,305.56,305.69C652.95,516.02,516.25,652.78,347.4,652.93z M605.15,347.24
                        c0-142.27-115.44-257.76-257.76-257.89C205.16,89.23,89.6,204.59,89.34,346.95C89.08,489.32,204.98,605.27,347.4,605.13
                        C489.72,605,605.15,489.5,605.15,347.24z"/>
                      <path d="M306.23,394.47c1.76-2.51,2.88-4.72,4.54-6.38c45.11-45.2,90.3-90.32,135.42-135.53c7.42-7.44,15.75-11.36,26.33-8.12
                        c15.44,4.73,21.78,23.03,12.49,36.22c-1.7,2.42-3.83,4.58-5.93,6.68c-51.19,51.22-102.4,102.43-153.61,153.63
                        c-13.78,13.77-26.54,13.8-40.23,0.12c-23.92-23.91-47.87-47.79-71.73-71.76c-9.62-9.67-11.06-21.91-4.05-31.86
                        c8.37-11.86,24.43-13.89,35.53-3.89c8.56,7.71,16.47,16.16,24.64,24.3C281.31,369.54,292.97,381.22,306.23,394.47z"/>
                    </g>
                  </svg>
                )}
              </div>
            ) : (
              <div>
                <svg
                    style={{   
                      width: '70px',
                      height: '70px',
                      fill: '#fff',
                      enableBackground: 'new 0 0 694.49 694.49'
                    }}  
                    version="1.1"
                    id="Camada_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 694.49 694.49"
                    xmlSpace="preserve"
                  >
                    <g>
                      <path d="M347.4,652.93C178.67,653.08,41.84,516.46,41.54,347.54C41.24,178.69,178.46,41.41,347.39,41.56
                        c168.85,0.15,305.56,136.91,305.56,305.69C652.95,516.02,516.25,652.78,347.4,652.93z M605.15,347.24
                        c0-142.27-115.44-257.76-257.76-257.89C205.16,89.23,89.6,204.59,89.34,346.95C89.08,489.32,204.98,605.27,347.4,605.13
                        C489.72,605,605.15,489.5,605.15,347.24z"/>
                      <path d="M306.23,394.47c1.76-2.51,2.88-4.72,4.54-6.38c45.11-45.2,90.3-90.32,135.42-135.53c7.42-7.44,15.75-11.36,26.33-8.12
                        c15.44,4.73,21.78,23.03,12.49,36.22c-1.7,2.42-3.83,4.58-5.93,6.68c-51.19,51.22-102.4,102.43-153.61,153.63
                        c-13.78,13.77-26.54,13.8-40.23,0.12c-23.92-23.91-47.87-47.79-71.73-71.76c-9.62-9.67-11.06-21.91-4.05-31.86
                        c8.37-11.86,24.43-13.89,35.53-3.89c8.56,7.71,16.47,16.16,24.64,24.3C281.31,369.54,292.97,381.22,306.23,394.47z"/>
                    </g>
                  </svg>
                <h1 style={{marginBottom: 5}}>Pedido Confirmado!</h1>
                <h2 style={{marginTop: 0, marginBottom: 25}}>ATENÇÃO: Após o pagamento do pix, retorne para esta página para concluir o pedido!</h2>  
                <h1 style={{marginTop: 0, marginBottom: 25}}>#{orderId} | R${totalPrice}</h1>  
                <p style={{width: '80%'}}>Assim que seu pedido estiver pronto, você receberá uma mensagem para a retirada!<br /> Caso não receba a mensagem em 20 minutos, se direcione até o balcão.</p>
                <p>O Café da Casa agradece, Deus abençoe!</p>
              </div> 
              
            )}
          </div>
        )}
      </div>      
      )}


    </div>
  );
};

export default Checkout;
