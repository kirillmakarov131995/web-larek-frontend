import { settings } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { Component } from './base/Component';

interface ISuccess {
	title: string;
	description: string;
}

export class Success extends Component<ISuccess> {
	protected _title: HTMLElement;
	protected _description: HTMLElement;
	protected _close: HTMLElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container, events);

		this._title = this.container.querySelector('.order-success__title');
		this._description = this.container.querySelector(
			'.order-success__description'
		);

		this._close = ensureElement<HTMLElement>(
			'.order-success__close',
			this.container
		);

		this._close.addEventListener('click', () =>
			this.emitChanges(settings.events.success.close)
		);
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}
}
