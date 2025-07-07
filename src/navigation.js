let page = 1;
let maxPage;
let infiniteScroll;

//llamado al evento de click, cambiamos la url agregando el valor del input buscador
// func Navigator- searchPage
searchFormBtn.addEventListener('click', () =>{
    location.hash = '#search=' + searchFormInput.value;
});

trendingBtn.addEventListener('click', () =>{
    location.hash = '#trends=';
});

arrowBtn.addEventListener('click', () =>{
    //devolver a la ventana anterior visitada
    location.hash = window.history.back(); 
});

// Ejecutar la funcion navigator() apenas carga la pagina
window.addEventListener('DOMContentLoaded', navigator, false);
// Detectar el cambio del #hash
window.addEventListener('hashchange', navigator, false);
// 
window.addEventListener('scroll', infiniteScroll, false);

function navigator() {
    console.log({ location });

    // Si infiniteScroll tiene algun valor, (Cada vez que llamamos la func Navigator, le quitamos el escuchador de eventos del infinite scroll)
    if (infiniteScroll) {
        window.removeEventListener('scroll', infiniteScroll, {passive: false});
        infiniteScroll = undefined;
    }

    if(location.hash.startsWith('#trends')) {
        trendsPage()
    } else if (location.hash.startsWith('#search=')) {
        searchPage();
    } else if (location.hash.startsWith('#movie=')) {
        movieDetailsPage();
    } else if (location.hash.startsWith('#category=')) {
        categoriesPage();
    } else {
        homePage();
    }

    //Scroll siempre arriba
    window.scrollTo(0, 0);

    // volvemos a preguntar si infiniteScroll ya tiene algun valor. Si si, activamos el infiniteScroll con el escuchador de eventos.
    // (infiniteScroll si tendra un valor, porque en este punto la funcion trendPage llama la func infiniteScroll)
    if (infiniteScroll) {
        window.addEventListener('scroll', infiniteScroll, {passive: false});
    }
}

function homePage() {
    console.log('HOME!!');

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.add('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.remove('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');

    trendingPreviewSection.classList.remove('inactive');
    likedMoviesSection.classList.remove('inactive');
    categoriesPreviewSection.classList.remove('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.add('inactive');
    
    getTrendingMoviesPreview();
    getCategoriesMoviesPreview();
    getLikedMovies();
}

function categoriesPage() {
    console.log('CATEGORIES!!');

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');   

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    likedMoviesSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    //extraemos el id del location.hash (url), para saber que id es que categoria
    // esto retorna un array: ['#category', 'id-name']
    const [_, categoryData] = location.hash.split('=');
    const [categoryId, categoryName] = categoryData.split('-');
    
    // Titulo de Categorias
    headerCategoryTitle.innerHTML = categoryName;

    getMoviesCategory(categoryId);

    infiniteScroll = getPaginatedMoviesByCategory(categoryId);

}

function movieDetailsPage() {
    console.log('MOVIE!!');

    headerSection.classList.add('header-container--long');
    // headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.add('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.add('inactive');   

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    likedMoviesSection.classList.add('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.remove('inactive');

     //extraemos el valor del location.hash (url), para saber que palabra se está buscando
    // esto retorna un array: ['#search', 'titulo']
    //guardamos el titulo en (query)
    const [_, movieId] = location.hash.split('=');

    //llamado a la funct del main
    getMovieById(movieId);

}

function searchPage() {
    console.log('SEARCH!!');

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');   

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    likedMoviesSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

     //extraemos el valor del location.hash (url), para saber que palabra se está buscando
    // esto retorna un array: ['#search', 'titulo']
    //guardamos el titulo en (query)
    const [_, query] = location.hash.split('=');

    //llamado a la funct del main
    getMoviesBySearch(query);

    infiniteScroll = getPaginatedMoviesBySearch(query);
}

function trendsPage() {
    console.log('TRENDS!!');

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');   

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    likedMoviesSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    // Titulo de Tendencias
    headerCategoryTitle.innerHTML = 'Tendencias';

    getTrendingMovies();
    
    infiniteScroll = getPaginatedTrendingMovies;

}