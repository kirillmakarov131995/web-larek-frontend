import { ensureAllElements, ensureElement } from '../../../utils/utils';
import { Component } from '../../views/base/Component';
import { IEvents } from '../../base/events';

interface IFormState {
	valid: boolean;
	errors: string[];
}
export interface IFormConstructor {
	new <T>(container: HTMLFormElement, events: IEvents): T;
}

export class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _buttons: HTMLButtonElement[] = [];
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);

		this._buttons.push(
			...ensureAllElements<HTMLButtonElement>(
				'button[type=button]',
				this.container
			)
		);

		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`form.${this.container.name}:submit`, {
				form: this.container.name,
			});
		});

		this._buttons.forEach((button) => {
			button.addEventListener('click', (e: Event) => {
				e.preventDefault();
				this.events.emit(`form.${this.container.name}.${button.name}:click`, {
					form: this.container.name,
					field: 'button',
					value: button.name,
				});
			});
		});
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`form.${this.container.name}.${String(field)}:change`, {
			form: this.container.name,
			field,
			value,
		});
	}

	set value(value: { elementName: string; value: string }) {
		if (value && this.container.elements.namedItem(value.elementName)) {
			(
				this.container.elements.namedItem(value.elementName) as HTMLInputElement
			).value = value.value;
		}
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}
