import Notiflix from 'notiflix';
import axios from 'axios';
//---------------------------------------------
const BASE_URL = 'https://pixabay.com/api/';
const KEY = '31604149-1ec6bd5e260d55d5538125f55';
//-------------------------------Клас обробки запиту--------------

class NewsApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchArticles() {
    const search = this.searchQuery;
    const numPage = this.page;

    return axios({
      url: BASE_URL,
      params: {
        key: KEY,
        q: search,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 20,
        page: numPage, //
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(data => {
      this.incrementPage();
      return data.data  //.hits;
    });
  }
  //-----------------------------------------
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
//-------------------------------------------------------Робота з DOM ------------------

const newsApiService = new NewsApiService();

const refs = {
  searchForm: document.getElementById('search-form'), //Форма
  articlesContainer: document.querySelector('.gallery'), //Список
  loadMoreBtn: document.querySelector('.load-more'), //Кнопка  загрузити більше
};

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();

  clearArticlesContainer();

  newsApiService.query = e.path[0].childNodes[1].value;
  newsApiService.resetPage();
  newsApiService.fetchArticles().then(appendArticlesMarkup);
  newsApiService.fetchArticles().then(a=> console.log(a))
}

function onLoadMore() {
  newsApiService.fetchArticles().then(appendArticlesMarkup);
}

//  ---------------------------------------------------Додати на сторінку----------------------------------------------
function appendArticlesMarkup(posts) {
   console.log(posts.total)

  if (!posts.hits.length) {
    //
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    refs.loadMoreBtn.classList.add('hidden');

    const markup = posts.hits //

      .map(({ webformatURL, likes, views, comments, downloads }) => {
        return `   <div class="photo-card">
        <img src="${webformatURL}" alt="" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            ${likes}
          </p>
          <p class="info-item">
            <b>Views</b>
            ${views}
          </p>
          <p class="info-item">
            <b>Comments</b>
            ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            ${downloads}
          </p>
        </div>
      </div>
      `;
      })
      .join('');
    refs.articlesContainer.innerHTML = markup;
  }
}
// --------------------------------------------Очистити сторінку-----------------------------------------------------
function clearArticlesContainer() {
  refs.articlesContainer.innerHTML = '';
}
