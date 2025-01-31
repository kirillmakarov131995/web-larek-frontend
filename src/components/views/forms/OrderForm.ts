import { OrderPaymentTypes } from '../../../types';
import { IEvents } from '../../base/events';
import { Form } from '../base/Form';

export interface IOrderForm {
	address: string;
	payment: OrderPaymentTypes;
}

export class OrderForm extends Form<IOrderForm> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	set payment(value: OrderPaymentTypes) {
		this.unelectButtons();

		if (value) {
			(
				this.container.elements.namedItem(value) as HTMLInputElement
			)?.classList.add('button_alt-active');
		}
	}

	setActiveButton(value: OrderPaymentTypes) {
		this.payment = value;
	}

	unelectButtons() {
		const selectedButtons = this.container.querySelectorAll('.button_alt');
		if (selectedButtons) {
			selectedButtons.forEach((button) => {
				button.classList.remove('button_alt-active');
			});
		}
	}
}
