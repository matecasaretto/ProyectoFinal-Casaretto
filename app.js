document.addEventListener('DOMContentLoaded', function() {
    const iconCart = document.querySelector('.icon-cart');
    const iconClose = document.querySelector('.icon-close');
    const cartProductsContainer = document.querySelector('.container-cart-products');
    const comprarButton = document.querySelector('.finalizar-compra');
    
    const carInfo = document.querySelector(".cart-product");
    const rowProduct = document.querySelector(".row-product");
    const productsList = document.querySelector("#contenedor");
    let allProducts = [];
    const valorTotal = document.querySelector(".total-pagar");
    const contadorProductos = document.querySelector("#contador-productos");

    // Carga los productos almacenados en el Local Storage al cargar la página
    const storedProducts = localStorage.getItem('cartProducts');
    allProducts = storedProducts ? JSON.parse(storedProducts) : [];

    // Función que simula una operación asincrónica para agregar productos al carrito
    function agregarProductoAlCarrito(producto) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                allProducts.push(producto);
                resolve('Producto agregado al carrito');
            }, 1000);
        });
    }

    // Función para finalizar la compra
    function finalizarCompra() {
        if (allProducts.length > 0) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const total = allProducts.reduce((acc, product) => acc + product.cantidad * parseInt(product.precio.slice(1)), 0);
                    resolve(total);
                }, 1000);
            });
        } else {
            return Promise.reject(new Error("El carrito está vacío. Agrega productos antes de comprar."));
        }
    }

    comprarButton.addEventListener('click', () => {
        finalizarCompra()
            .then(total => {
                Swal.fire({
                    icon: 'success',
                    title: '¡Compra exitosa!',
                    text: `Tu compra ha sido realizada con éxito. Total a pagar: $${total}`,
                    timer: 3000,
                    showConfirmButton: false,
                    onClose: () => {
                        allProducts = [];
                        localStorage.removeItem('cartProducts');
                        mostrarHTML();
                    }
                });
            })
            .catch(error => {
                Toastify({
                    text: error.message,
                    duration: 3000,
                    position: "left"
                }).showToast();
            });
    });

    iconCart.addEventListener('click', () => {
        cartProductsContainer.style.display = 'block';
    });
    
    iconClose.addEventListener('click', () => {
        cartProductsContainer.style.display = 'none';
    });

    // Fetch para cargar los productos desde el archivo JSON
    fetch('productos.json')
        .then(response => response.json())
        .then(productos => {
            mostrarProductos(productos);
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });

    function mostrarProductos(productos) {
        productsList.innerHTML = ''; // Limpiar la lista de productos

        productos.forEach(producto => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.innerHTML = `
                <p>${producto.nombre}</p>
                <p class="precio-producto">${producto.precio}</p>
                <button class="boton-comprar">Agregar al carrito</button>
            `;
            productsList.appendChild(productItem);
        });
    }

    productsList.addEventListener("click", e => {
        if (e.target.classList.contains("boton-comprar")) {
            const product = e.target.parentElement;

            const infoProduct = {
                cantidad: 1,
                nombre: product.querySelector("p").textContent,
                precio: product.querySelector(".precio-producto").textContent
            };
            
            const exist = allProducts.some(product => product.nombre === infoProduct.nombre);
            if (exist) {
                const products = allProducts.map(product => {
                    if (product.nombre === infoProduct.nombre) {
                        product.cantidad++;
                        return product;
                    } else {
                        return product;
                    }
                });
                allProducts = [...products];
            } else {
                allProducts = [...allProducts, infoProduct];
            }
            mostrarHTML();

            Toastify({
                text: "Producto agregado al carrito",
                duration: 3000,
                position: "left"
            }).showToast();
        }
    });

    rowProduct.addEventListener("click", (e) => {
        if (e.target.classList.contains("icon-close")) {
            const product = e.target.parentElement;
            const nombre = product.querySelector("p").textContent;

            allProducts = allProducts.filter(product => product.nombre !== nombre);
            mostrarHTML();

            Toastify({
                text: "Eliminado del carrito",
                duration: 3000,
                position: "left",
                style: {
                    background: "blue",
                }
            }).showToast();
        }
    });

    const mostrarHTML = () => {
        rowProduct.innerHTML = "";

        let total = 0;
        let totalOfProductos = 0;

        allProducts.forEach(product => {
            const containerProduct = document.createElement("div");
            containerProduct.classList.add("cart-product");

            containerProduct.innerHTML = `
            <div class="info-cart-product">
                <span class="cantidad-producto-carrito">${product.cantidad}</span>
                <p class="titulo-producto-carrito">${product.nombre}</p>
                <span class="precio-producto-carrito">${product.precio}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-close">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            `;
            rowProduct.append(containerProduct);
            total = total + parseInt(product.cantidad * product.precio.slice(1));
            totalOfProductos = totalOfProductos + product.cantidad;
        });

        valorTotal.innerText = `$${total}`;
        contadorProductos.innerText = totalOfProductos;

        localStorage.setItem('cartProducts', JSON.stringify(allProducts));
    };

    mostrarHTML();
});
