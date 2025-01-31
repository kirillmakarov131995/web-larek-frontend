import { IEvents } from '../base/events';
import { Model } from './base/Model';
import { BasketModel } from './BasketModel';
import { ItemsModel } from './ItemsModel';

// into types
export enum EModalType {
	none,
	card,
	basket,
	message,
	form,
	orderForm,
	contactsForm,
}

export class AppModel extends Model<undefined> {
	protected _items: ItemsModel;
	protected _basket: BasketModel;
	protected _modalType: EModalType = EModalType.none;

	constructor(protected events: IEvents) {
		super(events, undefined);

		this._items = new ItemsModel(events, {});
		this._basket = new BasketModel(events, {});
	}

	set currentModal(value: EModalType) {
		this._modalType = value;
	}

	get currentModal() {
		return this._modalType;
	}

	get basketModel() {
		return this._basket;
	}

	get itemsModel() {
		return this._items;
	}
}
