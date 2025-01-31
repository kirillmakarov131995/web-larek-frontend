import { ensureElement } from '../../../utils/utils';
import { Component } from '../../views/base/Component';
import { IEvents } from '../../base/events';
import { settings } from '../../../utils/constants';

interface IModalData {
	content: HTMLElement;
}

export class Modal extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container, events);

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.container.classList.add('modal_active');
		this.events.emit(settings.events.modal.open);
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		this.events.emit(settings.events.modal.close);
	}

	render(data: IModalData): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}
}
