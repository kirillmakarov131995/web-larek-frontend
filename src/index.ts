import { EventEmitter } from './components/base/events';
import { AppAPI } from './components/common/AppApi';
import { AppModel } from './components/models/AppModel';
import { AppPresenter } from './components/presenters/AppPresenter';
import { Modal } from './components/views/base/Modal';
import { Page } from './components/views/pages/Page';
import { API_URL, CDN_URL } from './utils/constants';
import './scss/styles.scss';

const api = new AppAPI(CDN_URL, API_URL);
const eventEmitter = new EventEmitter();
const page = new Page(
	document.querySelector('.page__wrapper') as HTMLElement,
	eventEmitter
);
const modalWindow = new Modal(
	document.querySelector('#modal-container'),
	eventEmitter
);

const appModel = new AppModel(eventEmitter);

const mainPagePresenter = new AppPresenter(
	eventEmitter,
	api,
	appModel,
	page,
	modalWindow,
	true
);

mainPagePresenter.init();
