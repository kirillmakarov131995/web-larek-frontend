import {
	IBasketOrderFullInfo,
	IBasketOrderInfo,
	IOrderDataRespone,
} from '../../types';
import { settings } from '../../utils/constants';
import { Model } from './base/Model';

export type FormErrors = Partial<Record<keyof IBasketOrderFullInfo, string>>;

interface IBasketModelValidateFormData {
	form: string;
	valid: boolean;
}

interface IBasketModelData {
	addedItems: string[];
	orderInfo: IBasketOrderInfo;
	formErrors: FormErrors;
}

interface IBasketModel extends IBasketModelData {
	clearOrderInfo(): void;
	clearBasket(): void;
	getBasketCount(): number;
	deleteBasketItem(id: string): boolean;
	getOrderData(ids: string[], total: number): IOrderDataRespone;
	getBasketItems(): string[];
	addItemBasket(id: string): boolean;
	setOrderData(form: string, data: Partial<IBasketOrderInfo>): void;
	isItemAdded(id: string): boolean;
	validateOrderData(
		formName: string,
		data: Partial<IBasketOrderInfo>
	): IBasketModelValidateFormData;
}

export class BasketModel
	extends Model<IBasketModelData>
	implements IBasketModel
{
	addedItems: string[] = [];
	orderInfo: IBasketOrderInfo = {
		phone: '',
		address: '',
		payment: '',
		email: '',
	};
	formErrors: FormErrors = {};

	clearOrderInfo() {
		this.orderInfo.email = '';
		this.orderInfo.phone = '';
		this.orderInfo.payment = '';
		this.orderInfo.address = '';
	}

	clearBasket() {
		this.addedItems = [];
		this.emitChanges(settings.events.basket.items.changed);
	}

	getBasketCount() {
		return this.addedItems.length;
	}

	deleteBasketItem(id: string): boolean {
		if (this.addedItems.includes(id)) {
			this.addedItems = this.addedItems.filter((value) => value !== id);
			this.emitChanges(settings.events.basket.item.removed);

			return true;
		}

		return false;
	}

	getOrderData(ids: string[], total: number): IOrderDataRespone {
		return {
			...this.orderInfo,
			items: ids,
			total: total || 0,
		};
	}

	getBasketItems() {
		return this.addedItems;
	}

	addItemBasket(id: string): boolean {
		if (id && !this.addedItems.includes(id)) {
			this.addedItems.push(id);
			this.emitChanges(settings.events.basket.item.added);

			return true;
		}
		return false;
	}

	setOrderData(form: string, data: Partial<IBasketOrderInfo>) {
		this.orderInfo = { ...this.orderInfo, ...data };
		this.emitChanges(settings.events.basket.orderInfo.changed, { form, data });
	}

	isItemAdded(id: string) {
		return this.addedItems.includes(id);
	}

	validateOrderData(
		formName: string,
		data: Partial<IBasketOrderInfo>
	): IBasketModelValidateFormData {
		const errors: typeof this.formErrors = {};

		switch (formName) {
			case 'order':
				if (!data?.payment) {
					errors.payment = settings.errorFormMessages.payment;
				}
				if (!data?.address) {
					errors.address = settings.errorFormMessages.address;
				}
				break;
			case 'contacts':
				if (!data?.email) {
					errors.email = settings.errorFormMessages.email;
				}
				if (!data?.phone) {
					errors.phone = settings.errorFormMessages.phone;
				}
				break;
		}

		const isValid = Object.keys(errors).length === 0;

		this.formErrors = errors;
		this.events.emit(settings.events.basket.formErrors.change, this.formErrors);

		return { form: formName, valid: isValid };
	}
}
