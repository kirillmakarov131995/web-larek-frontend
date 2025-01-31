import { ECardType, ICard } from '../../types';
import { settings } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { Component } from './base/Component';

export class Card extends Component<ICard> {
	protected _id: string;
	protected _index: HTMLElement;
	protected _buttonEvent?: string;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _price?: HTMLElement;
	protected _category?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(
		protected cardType: ECardType,
		id: string,
		protected blockName: { basket: string; card: string },
		container: HTMLElement,
		events: IEvents
	) {
		super(container, events);

		this._id = id;

		if (cardType !== ECardType.basket) {
			this._image = ensureElement<HTMLImageElement>(
				`.${blockName.card}__image`,
				container
			);
			this._category = ensureElement<HTMLElement>(
				`.${blockName.card}__category`,
				container
			);
		}

		if (cardType === ECardType.basket) {
			this._index = ensureElement<HTMLElement>(
				`.${blockName.basket}__item-index`,
				container
			);
		}

		if (cardType === ECardType.preview) {
			this._description = ensureElement<HTMLElement>(
				`.${blockName.card}__text`,
				container
			);
		}
		if (cardType !== ECardType.catalog) {
			this._button = ensureElement<HTMLButtonElement>(
				`.${blockName.card}__button`,
				container
			);
		}

		this._title = ensureElement<HTMLElement>(
			`.${blockName.card}__title`,
			container
		);

		this._price = ensureElement<HTMLElement>(
			`.${blockName.card}__price`,
			container
		);

		if (this._button) {
			this._button.addEventListener('click', this.handlerCardClick.bind(this));
		} else {
			container.addEventListener('click', this.handlerCardClick.bind(this));
		}
	}

	handlerCardClick() {
		this.emitChanges(this.buttonEvent, {
			id: this.id,
			card: this,
		});
	}

	set buttonEvent(value: string) {
		this._buttonEvent = value || settings.events.card.catalog.clicked;
	}

	get buttonEvent(): string {
		return this._buttonEvent || settings.events.card.catalog.clicked;
	}

	set buttonText(value: string) {
		if (this._button && value) {
			this._button.textContent = value;
		}
	}

	set index(value: number) {
		this.setText(this._index, String(value));
	}

	get index(): number {
		return Number(this._index.textContent) || -1;
	}

	set id(value: string) {
		if (!value) this.container.dataset.id = value;
	}

	get id(): string {
		if (!this._id) return this.container.dataset.id || '';
		else return this._id;
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set price(value: string) {
		this.setText(this._price, value ?? '');
	}

	get price(): string {
		return this._price.textContent || '0';
	}

	set category(value: string) {
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent || '';
	}

	set categoryClass(value: string) {
		if (!value) return;
		if (this._category) {
			this.clearCategoryClasses();
			this.toggleClass(
				this._category,
				`${this.blockName.card}__category_${value}`,
				true
			);
		}
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._description, value);
		}
	}

	clearCategoryClasses() {
		if (this.cardType === ECardType.catalog) {
			this._category.classList.remove(
				...Object.values(settings.categoryItems).map(
					(category) => `${this.blockName.card}__category_${category}`
				)
			);
		}
	}

	changeButton(text: string, eventName?: string) {
		if (this._button) {
			if (text) this.setText(this._button, text);
			if (eventName) this.buttonEvent = eventName;
		}
	}
}
