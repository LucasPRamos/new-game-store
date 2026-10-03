const version = 1;

const cachename =
    'app-cache-v' + version;


const arquivos = [

    "./",

    "./index.html",

    "./css/style.css",

    "./js/app.js",

    "./produtos.json",

    "./manifest.json",

    "./imagens/icone192.png",

    "./imagens/icone512.png",

    "./imagens/notebook.jpg",

    "./imagens/mouse.jpg",

    "./imagens/teclado.jpg"

];


// ==============================
// INSTALAÇÃO
// ==============================

self.addEventListener(
    'install',
    function (event) {

        event.waitUntil(

            caches
                .open(cachename)

                .then(function (cache) {

                    return cache.addAll(
                        arquivos
                    );

                })
        );

    }
);


// ==============================
// ATIVAÇÃO
// ==============================

self.addEventListener(
    'activate',
    function (event) {

        event.waitUntil(

            caches.keys()

                .then(function (nomesCaches) {

                    return Promise.all(

                        nomesCaches.map(
                            function (nome) {

                                if (nome !== cachename) {

                                    return caches.delete(nome);

                                }

                            }
                        )
                    );

                })
        );

    }
);


// ==============================
// CACHE
// ==============================

self.addEventListener(
    'fetch',
    function (event) {

        event.respondWith(

            caches
                .match(event.request)

                .then(function (response) {

                    if (response !== undefined) {

                        return response;

                    }


                    return fetch(event.request)

                        .then(function (response) {

                            let clone =
                                response.clone();


                            caches
                                .open(cachename)

                                .then(function (cache) {

                                    cache.put(
                                        event.request,
                                        clone
                                    );

                                });


                            return response;

                        })

                        .catch(function () {

                            return caches.match(
                                './index.html'
                            );

                        });

                })
        );

    }
);