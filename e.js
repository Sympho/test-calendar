/* Global var */

function dateFormat(dayFull){
	return dayFull.getFullYear()+'-'+dayFull.getMonth()+'-'+dayFull.getDate();
}
function dateDeFormat(text){
	var arr = text.split('-');
	return dateObj = new Date(arr[0], arr[1], arr[2]);
}
var weekRU = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
var monthRU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
var monthTitleRU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
window.selectCell = {};
function classRemove(el, cl) {
	var allclasses = el.className.split(' ');
	allclasses.forEach(function(item,i) {
		if (cl === item) {
			allclasses.splice(i, 1);
		}
	});
	el.className = allclasses.join(' ');
}


/* module: DB (LocalStorage) */

;(function(global,w,d,undefined){

	function isLocalStorage() {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) { return false; }
	}

	if (isLocalStorage()) {

		function db(){

			if (!localStorage.getItem("eventsList")) {
				var eventsList = [];
			}else{
				var eventsList = JSON.parse(localStorage.getItem("eventsList"));
			}

			function rewrite(obj,i){
				eventsList[i] = obj;
				save(eventsList);
			}

			function add(obj){
				eventsList.push(obj);
				save(eventsList);
			}

			function del(i){
				eventsList.splice(i,1);
				save(eventsList);
			}

			function save(arr){
				var strObj = JSON.stringify(arr);
				localStorage.setItem("eventsList", strObj);
			}

			return {
				getAll: function(){
					return eventsList;
				},
				inset: function(dayData){
					var output = false;
					eventsList.forEach(function(item, i, arr) {
						if (dayData.date === item.date) {
							rewrite(dayData,i);
							output = true;
						}
					});
					if (output === false) {
						add(dayData);
						output = true;
					}
					return output;
				},
				erase: function(dayData){
					var output = false;
					eventsList.forEach(function(item, i, arr) {
						if (dayData.date === item.date) {
							del(i);
							output = true;
						}
					});
					return output;
				},
				get: function (colDate){
					var output = {};
					eventsList.forEach(function(item, i, arr) {
						if (colDate === item.date) {
							output = item;
						}
					});
					return output;
				}
			}
		}
		global.db = new db();

	}

}(this,window,window.document));

/* all Events */
console.log(db.getAll());




/* module: MODAL */

;(function(global,w,d,undefined){
	
		w.Modal = function(sel,func){
    		var that = this;

			this.e = d.querySelector(sel);
			this.close = this.e.querySelector('#modal-close');
			this.refreshT = func;
			this.container = this.e.parentNode;

			this.hide = function(){ hide(); }
			this.show = function(t,l,text){ show(t,l,text); }

			this.close.addEventListener('click',function(){
				hide();
			},false);
			
			that.e.querySelector('#event-save').addEventListener('click',function(){
				if(that.bool !== false){

					var ddata = {
						date: dateFormat(that.bool),
						descr: that.evDescr.value,
						members: that.evMembers.value,
						title: that.evTitle.value
					};

					if (ddata.title.length > 0) {
						if(db.inset(ddata)){
							that.hide();
							that.refreshT();
						} 
					}
				}
			},false);

			that.e.querySelector('#event-remove').addEventListener('click',function(){
				if(that.bool !== false){
					var ddata = {
						date: dateFormat(that.bool),
						descr: that.evDescr.value,
						members: that.evMembers.value,
						title: that.evTitle.value
					};

					if(db.erase(ddata)){
						that.hide();
						that.refreshT();
					}
				}
			},false);

			function hide() {
				that.e.style.display = 'none';
				classRemove(selectCell,'new');
			};

			function show(t,l,text) {

				that.e.className = '';
				var pos = {};
				pos.l = l+140;
				pos.t = t-20;

				var contHeight = container.clientHeight;
				var contWidth = container.clientWidth;

				if (l+440 >= contWidth ) {
					that.e.setAttribute("class","tr");
					pos.l = l-311;
				}
				if (t+330 >= contHeight) {
					that.e.setAttribute("class","bl");
					pos.t = t-210;
				}
				if (l+440 >= contWidth && t+330 >= contHeight) {
					that.e.setAttribute("class","br");
					pos.l = l-311;
					pos.t = t-210;
				}

				that.e.style.left = pos.l+'px';
				that.e.style.top = pos.t+'px';

				that.e.style.display = 'block';

				fill(db.get(text),text);
			};

			function fill(eventData,date) {

				date = dateDeFormat(date);
				that.bool = date;
				that.evTitle = that.e.querySelector('[name="event-title"]');
				that.evDate = that.e.querySelector('[name="event-date"]');
				that.evMembers = that.e.querySelector('[name="event-members"]');
				that.evDescr = that.e.querySelector('[name="event-descr"]');

				var evBtnRemove = that.e.querySelector('#event-remove');

				if (eventData.date !== undefined) {
					that.evDate.value = date.getDate()+' '+monthRU[date.getMonth()]+' '+date.getFullYear();
					that.evTitle.value = eventData.title;
					that.evMembers.value = eventData.members;
					that.evDescr.value = eventData.descr;
				}else{
					that.evDate.value = date.getDate()+' '+monthRU[date.getMonth()]+' '+date.getFullYear();
					that.evTitle.value = '';
					that.evMembers.value = '';
					that.evDescr.value = '';
				}

			};
		}

}(this,window,window.document));



/* module: CALENDAR */

(function(global,w,d,undefined){

	w.calendar = _e = function App(sel,options){
		if(!(this instanceof App)){
			return new App(sel,options);
		}
		var that = this;

		this.element = d.querySelector(sel);

		/* default options */
		this.options = {
			"ctrlPrev": "#ctrl-prevmonth",
			"ctrlNext":  "#ctrl-nextmonth",
			"ctrlTitle": "#ctrl-titlemonth",
			"ctrlCurrent": "#ctrl-currmonth",
			"ctrlQuick": "#ctrl-quick",
			"ctrlRefresh": "#ctrl-refresh",
			"ctrlSearch": "#ctrl-search"
		}
		this.opts = ctrlLoop(this.options);

		this.init(this.element,this.opts);

	}
	_e.prototype = {
		ctrlEvent: function(that){
			/* bind ctrl */
			function bindctrl(el){
				var myMonth = el.getAttribute('data-month'), myYear = el.getAttribute('data-year');
				tableMonth(myMonth, myYear, that.element, that);
				that.cell(that);
			}
			that.opts.ctrlPrev.addEventListener('click',function(){
				bindctrl(this);
			},false);

			that.opts.ctrlNext.addEventListener('click',function(){
				bindctrl(this);
			},false);

			that.opts.ctrlCurrent.addEventListener('click',function(){
				tableMonth(that.currDate.getMonth() ,that.currDate.getFullYear(), that.element, that);
				that.cell(that);
			},false);

			that.opts.ctrlRefresh.addEventListener('click',function(){
				var btnRefresh = this;
				var myMonth = this.getAttribute('data-month'), myYear = this.getAttribute('data-year');
				this.innerHTML = "Обновление...";
				if(tableMonth(myMonth, myYear, that.element, that)){
					setTimeout(function(){btnRefresh.innerHTML = "Обновить";},200);
				}
				that.cell(that);
			},false);
		},
		refresh: function (){
			var myMonth = this.opts.ctrlRefresh.getAttribute('data-month'), myYear = this.opts.ctrlRefresh.getAttribute('data-year');
			tableMonth(myMonth, myYear, this.element, this);
			this.cell(this);
		},
		cell: function(that){

			[].forEach.call(d.querySelectorAll('td[rel="cell"]'), function(el) {

				el.addEventListener("click", function(e) {
					if (d.querySelector('td.new')) {
						classRemove(d.querySelector('td.new'),'new');
					}
					window.selectCell = this;

					selectCell.className += ' new';
					var strDate = this.getAttribute('data-day');
					var cellT = selectCell.offsetTop;
					var cellL = selectCell.offsetLeft;

					modal.show(cellT,cellL,strDate);
				});
			});

		},
		init: function (){

			/* build calendar today */
			this.currDate = new Date();
			var that = this;
			tableMonth( that.currDate.getMonth() ,that.currDate.getFullYear(),that.element,that);

			/* bind ctrl */
			this.ctrlEvent(that);
			that.cell(that);
		}
	};

	/* Control */
	function ctrlLoop(opt){
		var objCtrl = {};
		for(var property in opt) {
			objCtrl[property] = d.querySelector(opt[property]);
		}
		return objCtrl;
	}

	/* set data attribute for ctrl */
	function ctrl(btn,data){
		btn.setAttribute("data-month", data.m);
		btn.setAttribute("data-year", data.y);
		if (data.text === true) {
			btn.innerHTML = monthTitleRU[data.m]+' '+data.y;
		}

	}

	/* Biuld the table */
	function tableMonth(myMonth,myYear,containerTable,that) {
		myMonth = parseInt(myMonth);
		myYear = parseInt(myYear);
		var output = '',
			day,
			week = 0,
			container = d.createDocumentFragment();

		/* column's template */
		function chunk(dayFull,dayWeek,dayNum){
			var df = dateFormat(dayFull);
			var isNow = dateFormat(that.currDate);
			if (isNow === df) {
				var classNow = 'grey';
			} else {
				var classNow = '';
			}
			if ( typeof( db.get(df).date ) === 'string') {
				var dayEvent = db.get(df);
				return '<td rel="cell" class="'+classNow+' blue" data-day="'+df+'"><div><span class="weekday">'+ dayWeek +', </span><span class="day">'+dayNum+'</span></div><div class="content"><div class="event"><p>'+dayEvent.title+'</p></div><div class="member"><p>'+dayEvent.members+'</p></div></div></td>';
			}else{
				return '<td rel="cell" class="'+classNow+'" data-day="'+df+'"><div><span class="weekday">'+ dayWeek +', </span><span class="day">'+dayNum+'</span></div><div class="content"></div></td>';
			}

		}

		/* return days */
		function getYMDW(month, year) {
			var date = new Date(year, month, 1);
			var days = [];
			var i = 0;
			while (parseInt(date.getMonth()) === parseInt(month)) {
				days.push( new Date(date) );
				date.setDate(date.getDate() + 1);
			}
			return days;
		}

		var days = getYMDW(myMonth,myYear);

		/* set ctrlTitle */
		ctrl(that.opts.ctrlTitle,{"m":myMonth,"y":myYear, "text": true});
		ctrl(that.opts.ctrlRefresh,{"m":myMonth,"y":myYear});

		var monthPrev = myMonth-1, yearPrev = myYear;
		if (monthPrev < 0) { monthPrev = 11; yearPrev = myYear-1; }

		/* set ctrlPrev */
		ctrl(that.opts.ctrlPrev,{"m":monthPrev,"y":yearPrev});

		var monthNext = myMonth+1, yearNext = myYear;
		if (monthNext > 11) { monthNext = 0; yearNext = myYear+1; }

		/* set ctrlNext */
		ctrl(that.opts.ctrlNext,{"m":monthNext,"y":yearNext});

		/* loop each day in this month */
		for (var i = 0; i < days.length; i++){
			week = days[i].getDay();

			if(week === 1 || i === 0){
				output += '<tr>';

				/* the previous month */
				if(i === 0){

					var daysPrev = getYMDW(monthPrev,yearPrev);
					if(week === 0) {
						var weekPrevious = 7;
					} else {
						var weekPrevious = week;
					}
					for(var j = weekPrevious-1; j > 0; j--) {
						output += chunk(daysPrev[daysPrev.length-j], weekRU[daysPrev[daysPrev.length-j].getDay()], daysPrev[daysPrev.length-j].getDate());
					}
				}
			}
			/* the current month */
			output += chunk(days[i],weekRU[days[i].getDay()],days[i].getDate());
			
			if(week === 0 || i === days.length-1){
				/* the next month */
				if( week > 0){
					var daysNext = getYMDW(monthNext,yearNext);
					var weekNext = 7-week; 
					for(var j = 0; j < weekNext; j++) {
						output += chunk(daysNext[j],weekRU[daysNext[j].getDay()],daysNext[j].getDate());
					}
				}
				output += '</tr> ';
			}
		}

		/* inset in container */
		containerTable.innerHTML = '<table>'+output+'</table>';
		return true;
	}

}(this,window,window.document));
