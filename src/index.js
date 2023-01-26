import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '33107811-a5d6527529a2edb6bc3062098';
const BASE_URL = 'https://pixabay.com/api';

const refs = {
  searchFormEl: document.querySelector('#search-form'),
  searchQueryEl: document.querySelector('[name="searchQuery"]'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreDivEl: document.querySelector('.load-more'),
};

let pageCounter = 1;
let pictureCounter = 0;
let searchValue = '';

let gallery = new SimpleLightbox('.gallery a', {
  showCounter: true,
  disableRightClick: true,
  scrollZoom: false,
});

gallery.on('show.simplelightbox', function () {});
refs.loadMoreDivEl.setAttribute('hidden', '');

async function getPictures() {
  try {
    const response = await axios.get(
      `${BASE_URL}/?key=${API_KEY}&q=${searchValue.trim()}&page=${pageCounter}&orientation=horizontal&safesearch=true`,
      {
        params: {
          per_page: 40,
        },
      }
    );

    if (searchValue.trim().length === 0) {
      refs.loadMoreDivEl.setAttribute('hidden', '');

      throw new Error(
        'Sorry, your request is empty. Please enter what you want to see.'
      );
    }

    if (response.data.hits.length === 0 && pageCounter === 1) {
      refs.loadMoreDivEl.setAttribute('hidden', '');

      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    if (pictureCounter === response.data.totalHits) {
      refs.loadMoreDivEl.setAttribute('hidden', '');

      throw new Error(
        "We're sorry, but you've reached the end of search results."
      );
    }

    if (response.data.totalHits !== 0 && pageCounter === 1) {
      Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    }

    response.data.hits.forEach(element => {
      pictureCounter += 1;

      refs.galleryEl.insertAdjacentHTML(
        `beforeend`,
        `<div class="photo-card">
        <a class="gallery__item" href="${element.largeImageURL}"><img class="gallery__image" src=${element.webformatURL} alt="" loading="lazy" /></a>
        <div class="info">
        <p class="info-item"><span><b>Likes:</b></span><span>${element.likes}</span></p>
        <p class="info-item"><span><b>Views:</b></span><span>${element.views}</span></p>
        <p class="info-item"><span><b>Comments:</b></span><span>${element.comments}</span></p>
        <p class="info-item"><span><b>Downloads:</b></span><span>${element.downloads}</span></p>
        </div>
        </div>`
      );
    });

    gallery.refresh();
    refs.loadMoreDivEl.removeAttribute('hidden', '');

    if (pictureCounter === response.data.totalHits && pageCounter !== 1) {
      refs.loadMoreDivEl.setAttribute('hidden', '');

      throw new Error(
        "We're sorry, but you've reached the end of search results."
      );
    }
    if (pictureCounter === response.data.totalHits) {
      refs.loadMoreDivEl.setAttribute('hidden', '');
    }
    pageCounter += 1;
  } catch (error) {
    Notify.warning(error.message);
  }
}

refs.searchFormEl.addEventListener('submit', event => {
  event.preventDefault();

  refs.galleryEl.innerHTML = '';

  pageCounter = 1;
  pictureCounter = 0;

  searchValue = refs.searchQueryEl.value;
  getPictures(URL);
});

refs.loadMoreDivEl.addEventListener('click', () => {
  getPictures(URL);
});
