export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {
	moneyType: 'cинапсов',

	apiRequests: {
		items: {
			get: '/product/',
		},

		order: {
			post: '/order/',
		},
	},

	errorFormMessages: {
		phone: 'Необходимо указать телефон',
		email: 'Необходимо указать email',
		payment: 'Необходимо указать тип оплаты',
		address: 'Необходимо указать адрес',
	},

	categoryItems: {
		другое: 'other',
		'софт-скил': 'soft',
		дополнительное: 'additional',
		кнопка: 'button',
		'хард-скил': 'hard',
	},

	events: {
		basket: {
			open: 'basket:open',
			item: {
				add: 'basket.item:add',
				delete: 'basket.item:delete',
				added: 'basket.item:added',
				removed: 'basket.item:removed',
			},

			orderInfo: {
				changed: 'basket.orderInfo:changed',
				submited: 'basket.orderInfo:submited',
			},

			items: {
				changed: 'basket.items:changed',
			},

			formErrors: {
				change: 'basket.formErrors:change',
			},
		},

		items: {
			changed: 'items:changed',
			selectedItem: {
				selected: 'items.selectedItem:selected',
			},
		},

		card: {
			clicked: '',
			open: '',

			preview: {
				open: 'card.preview:open',
			},
			catalog: {
				clicked: 'card.catalog:clicked',
			},
		},

		form: {
			contacts: {
				open: 'form.contacts:open',
			},
			order: {
				open: 'form.order:open',
			},
		},

		success: {
			close: 'success:close',
		},

		modal: {
			open: 'modal:open',
			close: 'modal:close',
		},
	},

	cardPreview: {
		add: {
			text: 'В корзину',
		},
		delete: {
			text: 'Убрать из корзины',
		},
	},
};
