import {
	ICard,
	IItem,
	IViewCardEventData,
	ECardType,
	IFormDataFormat,
} from '../../types';
import { CDN_URL, settings } from '../../utils/constants';
import {
	cloneTemplate,
	convertImageUrl,
	ensureElement,
} from '../../utils/utils';
import { EventEmitter } from '../base/events';
import { AppAPI } from '../common/AppApi';
import { AppModel, EModalType } from '../models/AppModel';
import { IBasketOrderInfo } from '../../types';
import { Modal } from '../views/base/Modal';
import { Basket } from '../views/Basket';
import { Card } from '../views/Cards';
import { ContactsForm } from '../views/forms/ContactsFor';
import { IOrderForm, OrderForm } from '../views/forms/OrderForm';
import { Page } from '../views/pages/Page';
import { Success } from '../views/Success';

export class AppPresenter {
	private debugMode: boolean;

	// Все шаблоны
	private successTemplate = ensureElement<HTMLTemplateElement>('#success');
	private cardCatalogTemplate =
		ensureElement<HTMLTemplateElement>('#card-catalog');
	private cardPreviewTemplate =
		ensureElement<HTMLTemplateElement>('#card-preview');
	private cardBasketTemplate =
		ensureElement<HTMLTemplateElement>('#card-basket');
	private basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
	private orderTemplate = ensureElement<HTMLTemplateElement>('#order');
	private contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

	private basket: Basket;
	private orderForm: OrderForm;
	private contactsForm: ContactsForm;

	constructor(
		protected events: EventEmitter,
		protected api: AppAPI,
		protected appModel: AppModel,
		protected page: Page,
		protected modalWindow: Modal,
		useDebug?: boolean
	) {
		this.debugMode = useDebug ?? false;
	}

	init() {
		// Переиспользуемые части интерфейса
		this.basket = new Basket(cloneTemplate(this.basketTemplate), this.events);
		this.orderForm = new OrderForm(
			cloneTemplate(this.orderTemplate),
			this.events
		);

		this.contactsForm = new ContactsForm(
			cloneTemplate(this.contactsTemplate),
			this.events
		);

		this.setEvents();
		this.loadData();
	}

	async loadData() {
		// Получаем items с сервера
		await this.api
			.getItems()
			.then((items) => this.appModel.itemsModel.setItems(items))
			.catch((err) => {
				console.error(err);
			});
	}

	setEvents() {
		// Чтобы мониторить все события, для отладки
		this.events.onAll(({ eventName, data }) => {
			if (this.debugMode) {
				console.log(
					eventName,
					data,
					`Текущий id окна: ${this.appModel.currentModal}`
				);
			}
		});

		this.setBasketEvents();
		this.setCardEvents();
		this.setFormEvents();

		// Блокируем прокрутку страницы если открыта модалка
		this.events.on(settings.events.modal.open, () => {
			this.page.locked = true;
		});

		// ... и разблокируем
		this.events.on(settings.events.modal.close, () => {
			this.page.locked = false;
		});
	}

	setBasketEvents() {
		// эвент закрытия модального окна об успешной операции
		this.events.on(settings.events.success.close, () => {
			this.modalWindow.close();
		});

		// эвент вызывается когда заказ успешно оформлен на бэкэнде
		this.events.on(settings.events.basket.orderInfo.submited, () => {
			this.appModel.basketModel.clearBasket();
			this.appModel.basketModel.clearOrderInfo();
			this.events.emit(settings.events.basket.items.changed);
		});

		// Изменилось состояние валидации формы заказа
		this.events.on(
			settings.events.basket.orderInfo.changed,
			(data: { form: string; data: Partial<IBasketOrderInfo> }) => {
				const { valid } = this.appModel.basketModel.validateOrderData(
					data.form,
					this.appModel.basketModel.orderInfo
				);

				switch (data.form) {
					case 'order':
						this.orderForm.valid = valid;
						if (data.data.payment)
							this.orderForm.setActiveButton(data.data.payment);
						break;
					case 'contacts':
						this.contactsForm.valid = valid;
						break;
				}
			}
		);

		// ошибки при валидации формы заказа
		this.events.on(
			settings.events.basket.formErrors.change,
			(errors: Partial<IOrderForm>) => {
				if (this.debugMode) console.log(errors);
			}
		);

		// запрос на удаление товара из корзины
		this.events.on(
			settings.events.basket.item.delete,
			(data: IViewCardEventData) => {
				if (this.appModel.basketModel.deleteBasketItem(data.id) && data.card) {
					if (this.appModel.currentModal === EModalType.card) {
						data.card.buttonText = settings.cardPreview.add.text;
						data.card.buttonEvent = settings.events.basket.item.add;
					}
				}
			}
		);

		// события при успешном удалении предмета из корзины
		this.events.on(settings.events.basket.item.removed, () => {
			if (this.appModel.currentModal === EModalType.basket) {
				this.events.emit(settings.events.basket.open);
			} else if (this.appModel.currentModal !== EModalType.card) {
				this.modalWindow.close();
			}

			this.events.emit(settings.events.basket.items.changed);
		});

		// товары в корзине изменились
		this.events.on(settings.events.basket.items.changed, () => {
			this.page.counter = this.appModel.basketModel.getBasketCount();
		});

		// добавлен товар в корзину
		this.events.on(settings.events.basket.item.added, () => {
			if (
				this.appModel.currentModal !== EModalType.basket &&
				this.appModel.currentModal !== EModalType.card
			) {
				this.modalWindow.close();
			}

			this.events.emit(settings.events.basket.items.changed);
		});

		// событие на запрос добавления товара в корзину
		this.events.on(
			settings.events.basket.item.add,
			(data: IViewCardEventData) => {
				if (this.appModel.basketModel.addItemBasket(data.id) && data.card) {
					if (this.appModel.currentModal === EModalType.card) {
						data.card.buttonText = settings.cardPreview.delete.text;
						data.card.buttonEvent = settings.events.basket.item.delete;
					}
				}
			}
		);

		// Открыть корзину
		this.events.on(settings.events.basket.open, () => {
			this.appModel.currentModal = EModalType.basket;

			this.renderModal(this.renderBasket());
		});
	}

	setCardEvents() {
		// данные в хранилище о товаре поменялись
		this.events.on(settings.events.items.changed, () => {
			this.renderCards();
		});

		// открыть модальное окно предпросмотра карточки
		this.events.on(
			settings.events.card.preview.open,
			(data: IViewCardEventData) => {
				this.appModel.currentModal = EModalType.card;

				if (data) {
					let selectedItem: IItem = this.appModel.itemsModel.selectedItem;

					this.api
						.getItem(selectedItem.id)
						.then((result) => {
							selectedItem = result;
							selectedItem.image = convertImageUrl(CDN_URL, result.image);
						})
						.then(() => {
							const isAdded = this.appModel.basketModel.isItemAdded(
								selectedItem.id
							);

							this.renderModal(
								this.renderCard(
									ECardType.preview,
									selectedItem,
									this.cardPreviewTemplate,
									{
										buttonText: isAdded ? 'Убрать из корзины' : 'В корзину',
										buttonEvent: isAdded
											? settings.events.basket.item.delete
											: settings.events.basket.item.add,
									}
								)
							);
						})
						.catch((err) => {
							console.error(err);
						});
				} else {
					this.modalWindow.close();
				}
			}
		);

		// эвент клика по карточке товара
		this.events.on(
			settings.events.card.catalog.clicked,
			(data: IViewCardEventData) => {
				if (data?.id) {
					const isSelected = this.appModel.itemsModel.setSelectedItem(data.id);

					if (isSelected) {
						this.events.emit(settings.events.card.preview.open, data);
					}
				}
			}
		);
	}

	setFormEvents() {
		// Изменилось одно из полей в формах
		this.events.on(
			/^form\.(order|contacts).*:(change|click)/,
			(formData: IFormDataFormat) => {
				const data: Partial<IBasketOrderInfo> = {
					[formData.field === 'button' ? 'payment' : formData.field]:
						formData.value,
				};
				this.appModel.basketModel.setOrderData(formData.form, data);
			}
		);

		// события при submit форм
		this.events.on(
			/^form\.(contacts|order):submit/,
			(data: { form: string }) => {
				const totalItemsPrice = this.appModel.itemsModel.getTotalSumItems(
					this.appModel.basketModel.addedItems
				);

				switch (data.form) {
					case 'order':
						this.events.emit(settings.events.form.contacts.open, {
							form: 'contacts',
						});
						break;
					case 'contacts':
						this.api
							.submitOrder(
								this.appModel.basketModel.getOrderData(
									this.appModel.itemsModel.getItemIdsWithPrice(
										this.appModel.basketModel.addedItems
									),
									totalItemsPrice
								)
							)
							.then((response) => {
								if (response) {
									this.events.emit(settings.events.basket.orderInfo.submited);

									const success = new Success(
										cloneTemplate(this.successTemplate),
										this.events
									);

									this.renderModal(
										success.render({
											title: 'Заказ оформлен',
											description: `Списано ${
												response?.total || 'Неизвестно'
											} ${settings.moneyType}`,
										})
									);
								}
							})
							.catch((err) => {
								console.error(err);
							});
						break;
				}
			}
		);

		// Открыть формы: заказа/информации
		this.events.on(/^form\.(contacts|order):open/, (data: { form: string }) => {
			let contentForm: HTMLFormElement;

			switch (data.form) {
				case 'order':
					this.appModel.currentModal = EModalType.orderForm;

					contentForm = this.orderForm.render({
						payment: this.appModel.basketModel.orderInfo?.payment,
						address: this.appModel.basketModel.orderInfo?.address,
						valid: this.appModel.basketModel.validateOrderData(
							'order',
							this.appModel.basketModel.orderInfo
						).valid,

						errors: [],
					});
					break;
				case 'contacts':
					this.appModel.currentModal = EModalType.contactsForm;

					contentForm = this.contactsForm.render({
						email: this.appModel.basketModel.orderInfo?.email,
						phone: this.appModel.basketModel.orderInfo?.phone,
						valid: this.appModel.basketModel.validateOrderData(
							'contacts',
							this.appModel.basketModel.orderInfo
						).valid,
						errors: [],
					});

					break;
			}

			this.modalWindow.render({
				content: contentForm,
			});
		});
	}

	renderCards(): void {
		const itemList = this.appModel.itemsModel.items.map((item) => {
			const itemElement = this.renderCard(
				ECardType.catalog,
				item,
				this.cardCatalogTemplate,
				{
					...item,
					price: String(
						item.price <= 0 ? 'Бесценна' : `${item.price} ${settings.moneyType}`
					),
					categoryClass: settings.categoryItems[item.category] || null,
					buttonEvent: settings.events.card.catalog.clicked,
				}
			);

			return itemElement;
		});

		this.page.catalog = itemList;
	}

	renderModal(content: HTMLElement) {
		return this.modalWindow.render({
			content,
		});
	}

	renderBasket() {
		const items = this.appModel.itemsModel
			.getItemsFromId(this.appModel.basketModel.getBasketItems())
			.map((item, index) => {
				return this.renderCard(
					ECardType.basket,
					item,
					this.cardBasketTemplate,
					{
						index: index + 1,
						price: `${String(item.price ?? 0)} ${settings.moneyType}`,
						buttonEvent: settings.events.basket.item.delete,
					}
				);
			});

		return this.basket.render({
			items,
			total: this.appModel.itemsModel.getTotalSumItems(
				this.appModel.basketModel.getBasketItems()
			),
		});
	}

	renderCard(
		cardType: ECardType,
		itemData: IItem,
		template = this.cardCatalogTemplate,
		cardSettings: Partial<ICard>
	) {
		const card = new Card(
			cardType,
			itemData.id,
			{ basket: 'basket', card: 'card' },
			cloneTemplate(template),
			this.events
		);

		return card.render({
			...itemData,
			price: String(
				itemData.price <= 0
					? 'Бесценна'
					: `${itemData.price} ${settings.moneyType}`
			),
			categoryClass: settings.categoryItems[itemData.category] || null,

			...cardSettings,
		});
	}
}
