import { IEvents } from '../../base/events';

export interface IModelConstructor {
	new <T>(events: IEvents, data: Partial<T>): Model<T>;
}

/**
 * Базовая модель, чтобы можно было отличить ее от простых объектов с данными
 */
export abstract class Model<T> {
	constructor(protected events: IEvents, data: Partial<T>) {
		Object.assign(this, data);
	}

	// Сообщить всем что модель поменялась
	emitChanges(event: string, payload?: object) {
		// Состав данных можно модифицировать
		this.events.emit(event, payload ?? {});
	}

	// далее можно добавить общие методы для моделей
}
