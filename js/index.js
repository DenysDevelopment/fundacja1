const isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function () {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function () {
		return (
			isMobile.Android() ||
			isMobile.BlackBerry() ||
			isMobile.iOS() ||
			isMobile.Opera() ||
			isMobile.Windows()
		);
	},
};

const menu = () => {
	if (isMobile.any()) {
		document.body.classList.add('page__body--touch');

		const menuArrow = document.querySelectorAll('.menu__arrow');

		menuArrow.forEach((arrow) => {
			arrow.addEventListener('click', () => {
				arrow.parentElement.classList.toggle('menu__item--active');
			});
		});
	} else {
		document.body.classList.add('page__body--pc');
	}

	const iconMenu = document.querySelector('.menu__icon');
	if (iconMenu != null) {
		const menuBody = document.querySelector('.menu__body');
		iconMenu.addEventListener('click', () => {
			document.body.classList.toggle('page__body--lock');
			iconMenu.classList.toggle('menu__icon--active');
			menuBody.classList.toggle('menu__body--active');
		});
	}
};

menu();

const btnLike = document.querySelectorAll('.news__btn');

btnLike.forEach((btn) => {
	btn.addEventListener('click', () => {
		btn.classList.add('news__btn--active');
	});
});

const header = document.querySelector('.header');
window.addEventListener('scroll', (e) => {
	if (window.pageYOffset > 200) {
		header.classList.add('fixed');
		document.body.style.paddingTop = `${header.offsetHeight}px`;
	} else {
		header.classList.remove('fixed');
		document.body.style.paddingTop = `0px`;
	}
});

(function () {
	let originalPositions = [];
	let daElements = document.querySelectorAll('[data-da]');
	let daElementsArray = [];
	let daMatchMedia = [];
	//Заполняем массивы
	if (daElements.length > 0) {
		let number = 0;
		for (let index = 0; index < daElements.length; index++) {
			const daElement = daElements[index];
			const daMove = daElement.getAttribute('data-da');
			if (daMove != '') {
				const daArray = daMove.split(',');
				const daPlace = daArray[1] ? daArray[1].trim() : 'last';
				const daBreakpoint = daArray[2] ? daArray[2].trim() : '767';
				const daType = daArray[3] === 'min' ? daArray[3].trim() : 'max';
				const daDestination = document.querySelector('.' + daArray[0].trim());
				if (daArray.length > 0 && daDestination) {
					daElement.setAttribute('data-da-index', number);
					//Заполняем массив первоначальных позиций
					originalPositions[number] = {
						parent: daElement.parentNode,
						index: indexInParent(daElement),
					};
					//Заполняем массив элементов
					daElementsArray[number] = {
						element: daElement,
						destination: document.querySelector('.' + daArray[0].trim()),
						place: daPlace,
						breakpoint: daBreakpoint,
						type: daType,
					};
					number++;
				}
			}
		}
		dynamicAdaptSort(daElementsArray);

		//Создаем события в точке брейкпоинта
		for (let index = 0; index < daElementsArray.length; index++) {
			const el = daElementsArray[index];
			const daBreakpoint = el.breakpoint;
			const daType = el.type;

			daMatchMedia.push(
				window.matchMedia('(' + daType + '-width: ' + daBreakpoint + 'px)'),
			);
			daMatchMedia[index].addListener(dynamicAdapt);
		}
	}
	//Основная функция
	function dynamicAdapt(e) {
		for (let index = 0; index < daElementsArray.length; index++) {
			const el = daElementsArray[index];
			const daElement = el.element;
			const daDestination = el.destination;
			const daPlace = el.place;
			const daBreakpoint = el.breakpoint;
			const daClassname = '_dynamic_adapt_' + daBreakpoint;

			if (daMatchMedia[index].matches) {
				//Перебрасываем элементы
				if (!daElement.classList.contains(daClassname)) {
					let actualIndex = indexOfElements(daDestination)[daPlace];
					if (daPlace === 'first') {
						actualIndex = indexOfElements(daDestination)[0];
					} else if (daPlace === 'last') {
						actualIndex =
							indexOfElements(daDestination)[
								indexOfElements(daDestination).length
							];
					}
					daDestination.insertBefore(
						daElement,
						daDestination.children[actualIndex],
					);
					daElement.classList.add(daClassname);
				}
			} else {
				//Возвращаем на место
				if (daElement.classList.contains(daClassname)) {
					dynamicAdaptBack(daElement);
					daElement.classList.remove(daClassname);
				}
			}
		}
		customAdapt();
	}

	//Вызов основной функции
	dynamicAdapt();

	//Функция возврата на место
	function dynamicAdaptBack(el) {
		const daIndex = el.getAttribute('data-da-index');
		const originalPlace = originalPositions[daIndex];
		const parentPlace = originalPlace['parent'];
		const indexPlace = originalPlace['index'];
		const actualIndex = indexOfElements(parentPlace, true)[indexPlace];
		parentPlace.insertBefore(el, parentPlace.children[actualIndex]);
	}
	//Функция получения индекса внутри родителя
	function indexInParent(el) {
		var children = Array.prototype.slice.call(el.parentNode.children);
		return children.indexOf(el);
	}
	//Функция получения массива индексов элементов внутри родителя
	function indexOfElements(parent, back) {
		const children = parent.children;
		const childrenArray = [];
		for (let i = 0; i < children.length; i++) {
			const childrenElement = children[i];
			if (back) {
				childrenArray.push(i);
			} else {
				//Исключая перенесенный элемент
				if (childrenElement.getAttribute('data-da') == null) {
					childrenArray.push(i);
				}
			}
		}
		return childrenArray;
	}
	//Сортировка объекта
	function dynamicAdaptSort(arr) {
		arr.sort(function (a, b) {
			if (a.breakpoint > b.breakpoint) {
				return -1;
			} else {
				return 1;
			}
		});
		arr.sort(function (a, b) {
			if (a.place > b.place) {
				return 1;
			} else {
				return -1;
			}
		});
	}
	//Дополнительные сценарии адаптации
	function customAdapt() {
		//const viewport_width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	}
})();

const gotoSection = () => {
	const links = document.querySelectorAll('[data-goto-section]');
	const header = document.querySelector('.header');

	links.forEach((link) => {
		link.addEventListener('click', (e) => {
			if (link.dataset.gotoSection) {
				e.preventDefault();
				const section = document.querySelector(e.target.dataset.gotoSection);
				const sectionTop = header
					? section.getBoundingClientRect().top - header.offsetHeight
					: section.getBoundingClientRect().top;

				const iconMenu = document.querySelector('.menu__icon');
				const menuBody = document.querySelector('.menu__body');
				document.body.classList.remove('page__body--lock');
				iconMenu.classList.remove('menu__icon--active');
				menuBody.classList.remove('menu__body--active');

				if (
					document
						.querySelector('.menu__icon')
						.classList.contains('menu__icon--lock')
				) {
					document.body.classList.remove('page__body--lock');
					const iconMenu = document
						.querySelector('.menu__icon')
						.classList.remove('menu__icon--active');
					const menuBody = document
						.querySelector('.menu__body')
						.classList.remove('menu__body--active');
				}

				window.scrollBy({
					top: sectionTop,
					behavior: 'smooth',
				});
			}
		});
	});
};

gotoSection();

if (document.querySelector('.intro__slider-swiper')) {
	new Swiper('.intro__slider-swiper', {
		loop: true,
		autoplay: {
			delay: 2000,
		},
		spaceBetween: 20,
		// And if we need scrollbar
		scrollbar: {
			el: '.swiper-scrollbar',
		},
	});
}
if (document.querySelector('.sponsor__slider-swiper')) {
	new Swiper('.sponsor__slider-swiper', {
		loop: true,
		spaceBetween: 20,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
	});
}

const donateCalc = () => {
	const donates = document.querySelectorAll('.donate .donate__text span');
	const donateLine = document.querySelector('.donate__finished');

	if (
		document.querySelectorAll('.donate .donate__text span') &&
		document.querySelector('.donate__finished')
	) {
		const numberFirst = +donates[0].textContent.split(' ').join('');
		const numberSecond = +donates[1].textContent.split(' ').join('');

		donateLine.style.width = `${(numberFirst * 100) / numberSecond}%`;
	}
};
donateCalc();
