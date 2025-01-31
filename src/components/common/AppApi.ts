import { IItem, IItemResponce, IOrderData, IOrderResponce } from '../../types';
import { settings } from '../../utils/constants';
import { Api } from '../base/api';

export interface IAppAPI {
	getItems(): Promise<IItem[]>;
	getItem(id: string): Promise<IItem>;
	submitOrder(order: IOrderData): Promise<IOrderResponce>;
}

export class AppAPI extends Api implements IAppAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getItem(id: string): Promise<IItem> {
		return this.get(`${settings.apiRequests.items.get}/${id}`).then(
			(item: IItem) => {
				return item;
			}
		);
	}

	submitOrder(order: IOrderData): Promise<IOrderResponce> {
		return this.post(settings.apiRequests.order.post, order).then(
			(order: IOrderResponce) => {
				return order;
			}
		);
	}

	getItems(): Promise<IItem[]> {
		return this.get(settings.apiRequests.items.get).then(
			(item: IItemResponce) => {
				return item.items;
			}
		);
	}
}
