import { IEvents } from '../../base/events';
import { Form } from '../base/Form';

export interface IContactsForm {
	email: string;
	phone: string;
}

export class ContactsForm extends Form<IContactsForm> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}
}
