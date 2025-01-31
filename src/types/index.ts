export interface IFormDataFormat {
	form: string;
	field: string;
	value: string | number | boolean;
}

export interface IBasketOrderFullInfo extends IBasketOrderInfo {
	items: string[];
}

export enum ECardType {
	catalog,
	basket,
	preview,
}

export interface ICard {
	index: number;
	title: string;
	description: string;
	image: string;
	price: string;
	category: string;
	categoryClass: string;
	buttonText: string;
	buttonEvent: string;
}

export interface IViewCardEventData {
	id: string;
	card?: ICard;
}

export interface IBasketOrderInfo {
	phone: string;
	address: string;
	payment: OrderPaymentTypes;
	email: string;
}

export type OrderPaymentTypes = 'cash' | 'card' | '';

export type ItemCategoryTypes =
	| 'софт-скил'
	| 'другое'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скил';

export interface IItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: ItemCategoryTypes;
	price: number;
}

export interface IOrderDataRespone extends IBasketOrderFullInfo {
	total: number;
}

export type OrderPaymentType = 'cash' | 'card' | '';

export interface IOrderData {
	payment: OrderPaymentType;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IItemResponce {
	items: IItem[];
	total: number;
}

export interface IOrderResponce {
	id: string;
	total: number;
}
