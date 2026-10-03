let telaAnterior = 'tela-home';
let telaAtual = 'tela-home';

let produtosCarregados = [];


// ==============================
// NAVEGAÇÃO
// ==============================

function navegar(destino) {

    let telas = document.getElementsByClassName('tela');

    Array.from(telas).forEach(element => {

        element.classList.remove('show');
        element.classList.add('collapse');

    });

    document.getElementById(destino).classList.remove('collapse');
    document.getElementById(destino).classList.add('show');

    telaAnterior = telaAtual;
    telaAtual = destino;
}


// ==============================
// VOLTAR
// ==============================

function voltar() {

    navegar(telaAnterior);

}


// ==============================
// CARREGAR DADOS
// ==============================

async function obterProdutos() {

    try {

        /*
         * Primeiro tenta usar o Web Service
         * utilizado na aula.
         */

        const response = await axios.get(
            'https://fakestoreapi.com/products',
            {
                timeout: 5000
            }
        );

        console.log("Fake Store API disponível.");

        return response.data;

    } catch (error) {

        /*
         * Se a API estiver indisponível,
         * usa os dados locais.
         */

        console.warn(
            "Fake Store API indisponível. Usando produtos locais."
        );

        const responseLocal =
            await axios.get('produtos.json');

        return responseLocal.data;
    }
}


// ==============================
// CARREGAR POR CATEGORIA
// ==============================

async function carregarPorCategoria(categoria) {

    const telaLista =
        document.getElementById("tela-home");

    navegar('tela-home');


    telaLista.innerHTML = `

        <div class="col-12 status-api">

            <div class="spinner-border text-dark"
                 role="status">
            </div>

            <p class="mt-3">
                Carregando produtos...
            </p>

        </div>
    `;


    try {

        produtosCarregados =
            await obterProdutos();


        /*
         * Seleciona somente nossos produtos.
         *
         * Isso também evita que os produtos
         * aleatórios da Fake Store substituam
         * a organização da nossa loja.
         */

        let produtos;


        if (categoria === 'todos') {

            produtos =
                produtosCarregados.filter(produto =>

                    produto.category === 'eletronicos' ||
                    produto.category === 'acessorios'

                );

        } else {

            produtos =
                produtosCarregados.filter(produto =>

                    produto.category === categoria

                );

        }


        /*
         * Se a Fake Store respondeu mas não possui
         * nossas categorias personalizadas,
         * carrega os produtos locais.
         */

        if (produtos.length === 0) {

            const local =
                await axios.get('produtos.json');

            produtosCarregados =
                local.data;


            if (categoria === 'todos') {

                produtos =
                    produtosCarregados;

            } else {

                produtos =
                    produtosCarregados.filter(produto =>

                        produto.category === categoria

                    );

            }
        }


        renderizarProdutos(produtos);


    } catch (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );


        telaLista.innerHTML = `

            <div class="col-12 status-api">

                <div class="alert alert-danger erro-api">

                    <h4>
                        Erro ao carregar os produtos
                    </h4>

                    <p>
                        Não foi possível carregar os dados da loja.
                    </p>

                    <button class="btn btn-dark"
                            onclick="carregarPorCategoria('todos')">

                        Tentar novamente

                    </button>

                </div>

            </div>
        `;
    }
}


// ==============================
// MOSTRAR CARDS
// ==============================

function renderizarProdutos(produtos) {

    const telaLista =
        document.getElementById("tela-home");


    telaLista.innerHTML = "";


    produtos.forEach(produto => {

        const card =
            document.createElement("div");


        card.className = "col";


        card.innerHTML = `

            <div class="card produto-card h-100 shadow-sm"
                 onclick="abrirDetalhes(${produto.id})">

                <img
                    src="${produto.image}"
                    class="card-img-top p-3"
                    alt="${produto.title}"
                >

                <div class="card-body">

                    <h5 class="card-title">
                        ${produto.title}
                    </h5>

                    <p class="preco">
                        R$ ${produto.price
                            .toFixed(2)
                            .replace(".", ",")}
                    </p>

                    <button class="btn btn-dark">
                        Ver detalhes
                    </button>

                </div>

            </div>
        `;


        telaLista.appendChild(card);

    });
}


// ==============================
// DETALHES
// ==============================

async function abrirDetalhes(id) {

    const detalhesProduto =
        document.getElementById("detalhes-produto");


    navegar('tela-produto');


    let produto =
        produtosCarregados.find(
            item => item.id === id
        );


    /*
     * Caso ainda não esteja carregado,
     * consulta o JSON.
     */

    if (!produto) {

        try {

            const response =
                await axios.get('produtos.json');

            produto =
                response.data.find(
                    item => item.id === id
                );

        } catch (error) {

            console.error(error);

        }
    }


    if (!produto) {

        detalhesProduto.innerHTML = `

            <div class="alert alert-danger">
                Produto não encontrado.
            </div>
        `;

        return;
    }


    detalhesProduto.innerHTML = `

        <div class="row g-4">

            <div class="col-md-4 text-center">

                <img
                    src="${produto.image}"
                    class="img-fluid imagem-detalhes"
                    alt="${produto.title}"
                >

            </div>


            <div class="col-md-8">

                <h2>
                    ${produto.title}
                </h2>

                <p>
                    <strong>Categoria:</strong>
                    ${formatarCategoria(produto.category)}
                </p>

                <p>
                    <strong>Preço:</strong>
                    R$ ${produto.price
                        .toFixed(2)
                        .replace(".", ",")}
                </p>

                <p>
                    <strong>Descrição:</strong>
                    ${produto.description}
                </p>

                <p>
                    <strong>Avaliação:</strong>
                    ${produto.rating.rate} ⭐
                    (${produto.rating.count} avaliações)
                </p>

            </div>

        </div>
    `;
}


// ==============================
// NOME DA CATEGORIA
// ==============================

function formatarCategoria(categoria) {

    if (categoria === "eletronicos") {

        return "Eletrônicos";

    }

    if (categoria === "acessorios") {

        return "Acessórios";

    }

    return categoria;
}


// ==============================
// SERVICE WORKER
// ==============================

if ('serviceWorker' in navigator) {

    navigator.serviceWorker
        .register("./service-worker.js")

        .then(function () {

            console.log(
                "Service Worker registrado."
            );

        })

        .catch(function (error) {

            console.error(
                "Erro no Service Worker:",
                error
            );

        });
}


// ==============================
// INSTALAR PWA
// ==============================

let pedidoInstalacao;


window.addEventListener(
    'beforeinstallprompt',
    function (installPrompt) {

        installPrompt.preventDefault();

        pedidoInstalacao =
            installPrompt;

        document
            .getElementById("installAppBt")
            .classList
            .add('show');
    }
);


async function installApp() {

    if (!pedidoInstalacao) {

        return;

    }

    pedidoInstalacao.prompt();

    await pedidoInstalacao.userChoice;

    pedidoInstalacao = null;

    document
        .getElementById("installAppBt")
        .classList
        .remove('show');
}


// ==============================
// INICIAR
// ==============================

carregarPorCategoria('todos');