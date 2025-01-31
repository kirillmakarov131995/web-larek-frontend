import { IItem } from '../../types';
import { CDN_URL, settings } from '../../utils/constants';
import { convertImageUrl } from '../../utils/utils';
import { Model } from './base/Model';

export interface ItemsModelData {
	items: IItem[];
	selectedItem: IItem;
}

export interface IItemsModel extends ItemsModelData {
	getItemsFromId(ids: string[]): IItem[];
	getTotalSumItems(ids: string[]): number;
	setItems(items: IItem[]): void;
	getItemIdsWithPrice(ids: string[]): string[];
	setSelectedItem(item: IItem | string): boolean;
}

export class ItemsModel extends Model<ItemsModelData> implements IItemsModel {
	selectedItem: IItem;
	items: IItem[];

	setSelectedItem(id: string): boolean {
		if (id) {
			const selectedItem = this.getItemsFromId([id]);
			if (selectedItem && selectedItem.length !== 0) {
				this.selectedItem = selectedItem[0];
				// this.emitChanges(settings.events.items.selectedItem.selected);
				return true;
			}
		}

		return false;
	}

	getItemsFromId(ids: string[]) {
		const items: typeof this.items = [];

		for (let i = 0; i < this.items.length; i++) {
			const currentData = this.items[i];
			if (ids.includes(currentData.id)) {
				items.push(currentData);
			}
		}

		return items;
	}

	getTotalSumItems(ids: string[]) {
		let total = 0;
		const items = this.getItemsFromId(ids);

		for (const item of items) {
			total += Number(item.price) || 0;
		}

		return total;
	}

	setItems(items: typeof this.items) {
		this.items = items.map((item) => {
			return { ...item, image: convertImageUrl(CDN_URL, item.image) };
		});

		this.emitChanges(settings.events.items.changed);
	}

	getItemIdsWithPrice(ids: string[]) {
		const filteredItems = this.getItemsFromId(ids).filter((item) => {
			return item.price || item.price > 0;
		});
		const itemIds = filteredItems.map((item) => item.id);

		return itemIds;
	}
}
