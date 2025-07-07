
// Instancia de axios - Data
const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': APY_KEY,
        'language': navigator.language || "es-ES",
    },
});

function likedMoviesList() {
    // Convertimos lo del localStorage a un objeto
    const item = JSON.parse(localStorage.getItem('liked_movies'));
    let movies;

    // si item tiene algun valor, se agrega a movies
    // Si no, retorna un obj vacio
    if(item){
        movies = item;
    } else {
        movies = {};
    }
    return movies;
}

// localStorage
function likeMovie(movie) {

    const likedMovies = likedMoviesList();

    if(likedMovies[movie.id]) {
        likedMovies[movie.id] = undefined; // lo eliminamos
    } else {
        likedMovies[movie.id] = movie; // lo agregamos al array
    }

    // Llamamos el localStorage actualizado y convertido en string
    localStorage.setItem('liked_movies', JSON.stringify(likedMovies));
}

//--------------------------- Untils --------------------------

//(Observador de img)
const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting){
            const url = entry.target.getAttribute('data-img');
            entry.target.setAttribute('src', url);
        }
    });
});

// Funcion crear peli, recibe por argumento (Array. movies, un container, lazyLoad = carga de imgs, clean = limpieza del html)
function createMovies(
    movies, 
    container, 
    {
        lazyLoad = false, 
        clean = true,
    } = {},
) {
    if(clean) {
        container.innerHTML = "";
    }

    movies.forEach(movie => {

        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);

        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src', //Si lazyLoad es true lo agrega a dataImg si no a src
            'https://image.tmdb.org/t/p/w300' + movie.poster_path,
        );

        //Navegacion de la vista de detalles de cada peli
        movieImg.addEventListener('click', () => {
            location.hash = '#movie=' + movie.id;
        })

        movieImg.addEventListener('error', ()=> {
            movieImg.setAttribute(
                'src',
                'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.questionpro.com%2Fes%2Fhelp%2Fmobile%2Frss-para-encuestas.html&psig=AOvVaw2R2XX178zlLVcsbGIjwU6B&ust=1750855324473000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKiTlduKio4DFQAAAAAdAAAAABAE',
            );
        });

        // Boton de Fav
        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn'); 

        // Si la peli esta en localSto. le agrega la clase  para los stilos       
        likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked');
        movieBtn.addEventListener('click', () => {
            movieBtn.classList.toggle('movie-btn--liked');
            // Cargar la peli a local storage
            likeMovie(movie);
            getLikedMovies();
        });

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
        container.appendChild(movieContainer);
        
    });
}

function createCategories(categories, container) {
    container.innerHTML = "";

    categories.forEach(category => {

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id);
        //le pasamos un event listener a cada categoria concatenando su id
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        });
        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });
}

//---------------------- Lamados a la API ----------------------

// Funcion obtener imagenes de pelis en tendencias
async function getTrendingMoviesPreview() {

    const { data } = await api('trending/movie/day');
    const movies = data.results;

    createMovies(movies, trendingMoviesPreviewList, true);  //El valor de true es el lazyLoad
}

// Funcion obtener categorias de pelis
async function getCategoriesMoviesPreview() {

    const { data } = await api('genre/movie/list');
    const categories = data.genres;

    createCategories(categories, categoriesPreviewList);

}

// Funcion obtener imagenes de pelis en tendencias
async function getMoviesCategory(id) {

    const { data } = await api('discover/movie', {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(movies, genericSection, {lazyLoad: true});

}

function getPaginatedMoviesByCategory(id) {

    // func closures
    return async function () {
        const {
            scrollTop,
            scrollHeight,
            clientHeight
        } = document.documentElement;
    
        // Scroll a lo ultimo
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight -15)
    
        // LAoagina no es la ultima = pagActual menor a numeroTotalDePag
        const pageIsNotMAx = page < maxPage;
    
        // Si el Scroll esta abajo y El numero de Pagina es menor a la Ultima
        if(scrollIsBottom && pageIsNotMAx){
            page++;
            const { data } = await api('discover/movie', {
                params: {
                    with_genres: id,
                    page,
                },
            });
            const movies = data.results;
        
            createMovies(
                movies, 
                genericSection, 
                { 
                    lazyLoad: true, // carga de imagenes
                    clean : false  // visibilidad, scroll visible
                }
            );
        }
    }
}

// Funcion obtener pelicula por buscador
// la funcion recibe query, contiene el valor ingresado en el input
async function getMoviesBySearch(query) {

    const { data } = await api('search/movie', {
        params: {
            query,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(movies, genericSection);

}

//Funcion Closures
function getPaginatedMoviesBySearch(query) {

    return async function () {
        const {
            scrollTop,
            scrollHeight,
            clientHeight
        } = document.documentElement;
    
        // Scroll a lo ultimo
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight -15)
    
        // LAoagina no es la ultima = pagActual menor a numeroTotalDePag
        const pageIsNotMAx = page < maxPage;
    
        // Si el Scroll esta abajo y El numero de Pagina es menor a la Ultima
        if(scrollIsBottom && pageIsNotMAx){
            page++;
            const { data } = await api('search/movie', {
                params: {
                    query,
                    page
                },
            });
            const movies = data.results;
        
            createMovies(
                movies, 
                genericSection, 
                { 
                    lazyLoad: true, // carga de imagenes
                    clean : false  // visibilidad, scroll visible
                }
            );
        }
    }
}

// Funcion obtener imagenes de pelis en tendencias
async function getTrendingMovies() {

    const { data } = await api('trending/movie/day');
    const movies = data.results;
    maxPage = data.total_pages;

    createMovies(movies, genericSection, { lazyLoad: true, clean : true});

}

async function getPaginatedTrendingMovies() {

    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    // Scroll a lo ultimo
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight -15)

    // LAoagina no es la ultima = pagActual menor a numeroTotalDePag
    const pageIsNotMAx = page < maxPage;

    // Si el Scroll esta abajo y El numero de Pagina es menor a la Ultima
    if(scrollIsBottom && pageIsNotMAx){
        page++;
        const { data } = await api('trending/movie/day', {
            params : { 
                page,
            },
        });
        const movies = data.results;

        createMovies(
            movies, 
            genericSection, 
            { 
                lazyLoad: true, // carga de imagenes
                clean : false  // visibilidad, scroll visible
            }
        );
    }
}

// Funcion obtener detalles de pelis 
async function getMovieById(id) {
    // se recibe un objeto data, que renombramos movies porque es el que coniene la info de la peli
    const { data: movie } = await api('movie/' + id);

    // Asignamos la ruta de la url concatenando el id de cada poster a la peli a una var
    const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;

    //accedemos a la seccion del poster del css para editar el background
    // Para que se pueda ver la flecha de volver en fondos blancos, hacemos un degradado negro en la parte superior
    // Y le asignamos la var que contiene el poster
    headerSection.style.background = `
        linear-gradient(
            180deg, 
            rgba(0, 0, 0, 0.35) 19.27%, 
            rgba(0, 0, 0, 0) 29.17%
        ),
        url(${movieImgUrl})
    `;

    // Asignacion de las propiedades del objeto a las de la seccion
    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average.toFixed(1);
    
    // Agregamos la seccion de categorias similares por pelis
    createCategories(movie.genres, movieDetailCategoriesList);
    
    //Por cada peli llamamos la seccion de pelis relacionadas
    getRelatedMoviesId(id);
}

// Funcion peliculas relacionadas por cada peli
async function getRelatedMoviesId(id) {
    const { data } = await api(`movie/${id}/recommendations`);

    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer);
}

// Consumo del localStorage
function getLikedMovies() {
    const likedMovies = likedMoviesList();

    // convertimos el obj que contiene likedMovies a un Array
    const moviesArray = Object.values(likedMovies);

    createMovies(moviesArray, likedMoviesListArticle, { lazyLoad : true, clean : true});
}
