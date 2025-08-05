
const container = document.querySelector('.container')
const btnStartSlideshow = document.querySelector('.btn-start')
const btnStopSlideshow = document.querySelector('.btn-stop')


let data = [];
let firstItemLink = '';
let columnIndexes;



async function loadData() {
  const res = await fetch('data.json');
  data = await res.json();
  handleURLParams();
}

window.addEventListener('popstate', (e) => {
  handleURLParams();
});


let resizeTimeout
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    handleURLParams()
  }, 400)
});


function getColumnLayout() {
  const width = window.innerWidth;

  if (width < 568) {
    return {
      columnCount: 1,
      columnIndexes: {
        0: data.map((_, i) => i)
      }
    };
  }

  if (width < 968) {
    return {
      columnCount: 2,
      columnIndexes: {
        0: [0, 2, 4, 6, 8, 11, 13],
        1: [1, 3, 5, 7, 9, 10, 12, 14]
      }
    };
  }

  return {
    columnCount: 4,
    columnIndexes: {
      0: [0, 4, 8, 11],
      1: [1, 5, 9, 12],
      2: [2, 6, 13],
      3: [3, 7, 10, 14]
    }
  };
}


function renderGallery() {
  const { columnCount, columnIndexes } = getColumnLayout();

  const parentContainer = document.createElement('div');
  parentContainer.className = 'gallery';

  const columns = Array.from({ length: columnCount }, () => {
    const col = document.createElement('div');
    col.className = 'gallery-column';
    parentContainer.appendChild(col);
    return col;
  });

  Object.entries(columnIndexes).forEach(([colIndex, indexes]) => {
    indexes.forEach(i => {
      const item = data[i];
      if (!item) return;

      const a = document.createElement('a');
      a.className = 'item';
      a.href = `?page=gallery&name=${encodeURIComponent(item.name)}&index=${i}`;
      a.innerHTML = `
        <img src="${item.images.thumbnail}" alt="${item.name}">
        <div class="item-name">
          <h3>${item.name}</h3>
          <span>${item.artist.name}</span>
        </div>
      `;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        btnStartSlideshow.style.display = 'none';
        btnStopSlideshow.style.display = 'block';
        showPageDetailis(i);
        history.pushState({ index: i }, '', a.href);
      });

      columns[colIndex].appendChild(a);
    });
  });

  container.innerHTML = '';
  container.appendChild(parentContainer);
}


function showPageDetailis(index) {
  const page = data[index]
  const prog = ((index + 1) / data.length) * 100;

  container.innerHTML = `${getDescriptionHTML(page, prog)}`;
  const btnPrev = document.querySelector('.first-icon.prev');
  const btnNext = document.querySelector('.first-icon.next');
  const btnOpenModal = document.querySelector('.open-modal');
  const btnCloseModal = document.querySelector('.close-modal');

  btnPrev.classList.add('active');
  btnNext.classList.add('active');

  if (index === 0) {
    btnPrev.classList.remove('active');
  }

  if (index === data.length - 1) {
    btnNext.classList.remove('active');
  }

  btnPrev.addEventListener('click', () => {
    if (index > 0) {
      showPageDetailis(index - 1);
      const url = `?page=gallery&name=${encodeURIComponent(data[index - 1].name)}&index=${index - 1}`;
      history.pushState({ index: index - 1 }, '', url);
    }
  });

  btnNext.addEventListener('click', () => {
    if (index < data.length - 1) {
      showPageDetailis(index + 1);
      const url = `?page=gallery&name=${encodeURIComponent(data[index + 1].name)}&index=${index + 1}`;
      history.pushState({ index: index + 1 }, '', url);
    }
  });

  btnOpenModal.addEventListener("click", () => {
    document.querySelector('.dialog').showModal()
  })

  btnCloseModal.addEventListener('click', () => {
    document.querySelector('.dialog').close()
  })

}

function handleURLParams() {
  const params = new URLSearchParams(location.search);
  const index = parseInt(params.get('index'), 10);

  if (!isNaN(index) && data[index]) {
    showPageDetailis(index);
  } else {
    renderGallery();
  }
}

function getDescriptionHTML(page, prog) {
  return `<div class="descriptions">
        <div class="description-body">
          <div class="images-block">
            <div class="img-gallery">
            <img src="${page.images.hero.small}" alt="${page.name}" />
            <button class="open-modal">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.71431 0L9.21432 1.5L6.85718 3.85714L8.14288 5.14285L10.5 2.78571L12 4.28571V0H7.71431Z" fill="white"/><path d="M3.85714 6.85718L1.5 9.21432L0 7.71431V12H4.28571L2.78571 10.5L5.14285 8.14288L3.85714 6.85718Z" fill="white"/><path d="M8.14288 6.85718L6.85718 8.14288L9.21432 10.5L7.71431 12H12V7.71431L10.5 9.21432L8.14288 6.85718Z" fill="white"/><path d="M4.28571 0H0V4.28571L1.5 2.78571L3.85714 5.14285L5.14285 3.85714L2.78571 1.5L4.28571 0Z" fill="white"/></svg>
            <span>VIEW IMAGE</span>
            </button>
            </div>
            <div class="name-block">
              <div class="text-inner">
                <h1>${page.name}</h1>
                <span>${page.artist.name}</span>
              </div>
              <img class="img-artist" src="${page.artist.image}" alt="${page.artist.name}" />
            </div>
            </div>
            <div class="text-block">
            <span class="year">${page.year}</span>
            <div>
            <p>${page.description}</p>
            <a href="${page.source}" target="_blank">GO TO SOURCE</a>
            </div>
            </div>
        </div>
        <div class="proggress" 
        style="background: linear-gradient(to right, var(--dark-grey) 0% ${prog}%, var(--grey) ${prog}% 100%)"></div>
        <div class="swiper-block">
          <div class="name-page">
            <h3>${page.name}</h3>
            <span>${page.artist.name}</span>
          </div>
          <div class="button-page">
            <svg class="first-icon prev" width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.6275 12.1123L24.1656 22.3818V1.84277L3.6275 12.1123Z" stroke="#7d7d7d" stroke-width="2"/>
            <rect x="-0.371478" y="0.371478" width="0.742956" height="23.0316" transform="matrix(-1 0 0 1 0.742945 0)" fill="#D8D8D8" stroke="#7d7d7d" stroke-width="0.742956"/></svg>
            <svg class="first-icon next" width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.066 12.1123L1.52789 22.3818V1.84277L22.066 12.1123Z" stroke="#7d7d7d" stroke-width="2"/>
            <rect x="24.5791" y="0.371478" width="0.742956" height="23.0316" fill="#D8D8D8" stroke="#7d7d7d" stroke-width="0.742956"/></svg>
          </div>
        </div>
        <dialog class="dialog">
        <div class="dialog-inner">
        <button class="close-modal" type="button">close</button>
          <picture>
            <source media="(min-width: 1024px)" srcset="${page.images.hero.large}">
            <source media="(min-width: 768px)" srcset="${page.images.hero.small}">
            <source media="(max-width: 568px)" srcset="${page.images.thumbnail}">
            <img src="${page.images.gallery}" alt="${page.name}" class="img-modal">
         </picture>
           </div>
          </dialog>
      </div>
  `;
}

btnStartSlideshow.addEventListener('click', () => {
  if (data.length > 0) {
    showPageDetailis(0);
    history.pushState({ index: 0 }, '', firstItemLink);
    btnStartSlideshow.style.display = 'none';
    btnStopSlideshow.style.display = 'block'
  }
});

btnStopSlideshow.addEventListener('click', () => {
  btnStartSlideshow.style.display = 'block';
  btnStopSlideshow.style.display = 'none'
  history.pushState({}, '', '/');
  container.innerHTML = '';
  renderGallery();
})


loadData()