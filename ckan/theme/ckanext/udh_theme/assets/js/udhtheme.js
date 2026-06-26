// Enable JavaScript's strict mode. Strict mode catches some common
// programming errors and throws exceptions, prevents some unsafe actions from
// being taken, and disables some confusing and bad JavaScript features.
'use strict';

ckan.module('udhtheme_popover_info', function ($) {
	return {
		initialize: function () {
			//We only go through the popover creation if "type" and "title" are available.
			if (!!this.options.type && !!this.options.title) {
				let content;
				let html = true;

				if (!!this.options.idcontent) {
					content = document.getElementById(this.options.idcontent).innerHTML;
				}

				this.el.popover({
					title: this.options.title,
					content: content,
					html: html,
					placement: 'right'
				});
			}
		}
	};
});
