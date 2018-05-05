"use strict";

(function($){
	var epochTime = {
		day: 86400,
		newDate: new Date(),
		weekLength: 7,

		createInitialDay: function(){
			var day = this.newDate;
			day.setHours(0,0,0,0);
		
			return day/1000;
		},

		datesFromCurrentDay: function(n, interval){
			var startingDay = this.createInitialDay();
			var dates = [];
	
			for (var i = 0; i < n; i++){
				var day = startingDay;
				startingDay = day + interval;
				dates.push(day);
				}
	
			return dates;
		},

		createDateObjects: function(epochDateArray){
			var dateArray = [];

			for (var i = 0; i < epochDateArray.length; i++){
				var date = epochDateArray[i]
				var newDateObject = new Date(date * 1000);
				dateArray.push(newDateObject);
			}
		
			return dateArray;
		},
		
		epochDates: function(){
			return this.datesFromCurrentDay(this.weekLength, this.day);
		},
		
		weekOfDateObjects: function(){
			return this.createDateObjects(this.epochDates());
		}
	}

	var calendarDisplay = {
		buttonPressed: 0,
		numberForNewTimeslot: 1,
		block1Array: [],
		block2Array: [],
		timeslotArray: [],
		arrayOfTimeslotIDs: [],
		dayBlockNumber: 1,
		timeslotUniqueID: 1,
		currentDate: "",

		logDayBlockArray: function(){
			console.log(this.dayBlockArray);
		},

		weekdayFormat: function(day){
			return day.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
		},

		dateFormat: function(day){
			return day.toLocaleDateString();
		},

		formatArrayItems: function(array1, format){
			var formattedArray = [];
				
			for (var i = 0; i < array1.length; i++){
				var item = array1[i];
				var formattedItem = format(item);
				formattedArray.push(formattedItem);
			}
				
			return formattedArray;
		},

		textToDisplay: function(msgArray, selectorArray){	
			for (var i = 0; i < msgArray.length; i++){
				var msg = msgArray[i];
				var inner = selectorArray[i];
				$(inner).text(msg);
			}
		},

		blockDate: function(){
			var date = blockID.date().text();
			return date;
		},

		getBlockDateObject: function(){
			var blockObject =  epochTime.weekOfDateObjects()[this.buttonPressed];
			return blockObject;
		},
		
		createTimeslotID: function(){
			var id = this.timeslotUniqueID++;
			return id;
		},

		newTimeslot: function(){
			var timeslot = new Timeslot(this.blockDate(), this.createTimeslotID());
			console.log("new timeslot created");
			timeslot.showBlockContent();
			timeslot.addTimesToBlockHeader();
			timeslot.addDetailsToBlock();
			timeslot.createDeleteButton();
			timeslot.hideBlockContent();
			return timeslot;
		},
		
		createTimeslot: function(){
			var date = this.blockDate();
			
			if(this.timeslotArray.length < 1){
				this.dayBlockNumber = 1;
				var slot = this.newTimeslot();
				var day = slot.dateOfBlockDay;
				this.timeslotArray.push(slot);
				this.block1Array.push(day);
			} else if(this.timeslotArray.length >= 1){
				if(this.block1Array.indexOf(date) === -1){
					this.dayBlockNumber = 1;
					var slot = this.newTimeslot();
					var day = slot.dateOfBlockDay;
					this.timeslotArray.push(slot);
					this.block1Array.push(day);
				} else if (this.block1Array.indexOf(date) != -1 && this.block2Array.indexOf(date) === -1){
					this.dayBlockNumber = 2;
					var slot = this.newTimeslot();
					var day = slot.dateOfBlockDay;
					this.timeslotArray.push(slot);
					this.block2Array.push(day);
				} 
			}
			console.log(this.timeslotArray);
			console.log(this.block1Array);
			console.log(this.block2Array);
		},
		
		deleteDayBlockFromArray: function(blockNumber, blockDate){
			var block = "block" + blockNumber;
			var date = blockDate;
			console.log("date is " + date);
			if(this.block1Array.indexOf(date) != -1 && block === "block1"){
				this.block1Array.splice((this.block1Array.indexOf(date)), 1);
			} else if(this.block2Array.indexOf(date) != -1 && block === "block2"){
				this.block2Array.splice((this.block2Array.indexOf(date)), 1);
			}
		},
		
		deleteTimeslotFromArray: function(){
			var array = this.timeslotArray;
			for(var i = 0; i < array.length; i++){
				var item = array[i];
				if(item.deleted === true){
					array.splice(i, 1);
				}
			}
			console.log(array);
		},
		
		setDeletedToTrue: function(number){
			var array = this.timeslotArray;
			for(var i = 0; i < array.length; i++){
				var item = array[i];
				if(item.slotID === number){
					item.deletedIsTrue();
				} 
			} 
			console.log(this.timeslotArray);
			console.log(item);
		},
		
		timeInputRegEx: function(time){
			var exp = /^([\d]|0[\d]|1?[\d]|2[0-3]):([0-5]?[\d]$)/.exec(time);
			if (!exp) {
				throw new Error('Not a valid input: '+ time);
			}
			return exp;
		},

		displayCalendar: function(){
			this.textToDisplay(this.formatArrayItems(epochTime.weekOfDateObjects(), this.dateFormat), blockID.dateArray());
			this.textToDisplay(this.formatArrayItems(epochTime.weekOfDateObjects(), this.weekdayFormat),  blockID.weekdayArray());
		}
	}

	function Timeslot(dateOfBlockDay, slotID){
		this.dateOfBlockDay = dateOfBlockDay;
		this.blockIDPrefix = blockID.prefix();
		this.blockIDnumber = blockID.number(calendarDisplay.dayBlockNumber);
		this.$timeslotStart = $("#timeslot-start");
		this.$timeslotEnd = $("#timeslot-end");
		this.deleteButton = "";
		this.startTime = this.$timeslotStart.val();
		this.endTime = this.$timeslotEnd.val();
		this.blockID = blockID.html(this.blockIDPrefix, this.blockIDnumber);
		this.deleted = false;
		this.slotID = slotID;

		this.showBlockContent = function(){
			var content = $(blockID.html(this.blockIDPrefix, this.blockIDnumber));
			console.log("showing timeslot content");
			console.log(blockID.html(this.blockIDPrefix, this.blockIDnumber));
			content.show();
		};
		
		this.deletedIsTrue = function(){
			this.deleted = true;
			return this.deleted;
		};
		
		//converts the start and end times of the meetup to text for display
		this.addTimesToBlockHeader = function(){
			blockID.header(calendarDisplay.dayBlockNumber).text(this.timeInputToString(this.startTime) + this.am_pm(this.startTime) + " to " + this.timeInputToString(this.endTime) + this.am_pm(this.endTime));
			//console.log("Start time is " + this.startTime);
		};
		
		//chooses "am" or "pm" for display on calendar based the on user time input
		this.am_pm = function(time){
			var suffix = "am";
			var hours = this.timeInputHours(time);
			if(hours < 12){
				suffix = "am";
			} else if (hours >= 12){
				suffix = "pm";
			}
			return suffix;
		};
		
		//returns the hour portion of user time input
		this.timeInputHours = function(time){
			var exp = calendarDisplay.timeInputRegEx(time);
			return exp[1];
		};
		
		//returns the minute portion of user time input
		this.timeInputMinutes = function(time){
			var exp = calendarDisplay.timeInputRegEx(time);
			return exp[2];
		};
		
		//creates a new, formatted string from the user time input, for display
		this.timeInputToString = function(time){
			var hour = this.formatInputHours(time);
			var timeString = hour + ":" + this.timeInputMinutes(time);
			console.log(timeString);
			
			return timeString;
		};
		
		//formats the hour portion of user time input
		this.formatInputHours = function(time){
			var hour = this.timeInputHours(time);
			if(hour > 12){
				hour = Math.abs(hour) - 12;
			} else if (hour <= 12 && hour >= 1){
				hour = Math.abs(hour);
			} else if (Math.abs(hour) === 0){
				hour = 12;
			}
			console.log(hour);
			return hour;
		};
		
		//semi-placeholder for when more "detailed" details are required.
		this.blockDetails = function(){
			return "Available";
		};
		
		//converts block details of meetup into text for display
		this.addDetailsToBlock = function(){
			blockID.details(calendarDisplay.dayBlockNumber).text(this.blockDetails);
		};
		
		//creates a delete button for the content block
		this.createDeleteButton = function(){
			var btn = this.blockID + "-delete";
			this.deleteButton = btn;
			console.log(this.deleteButton);
		};
		
		//hides the content block on click
		this.hideBlockContent = function(){
			var content = $(this.blockID);
			var number = calendarDisplay.dayBlockNumber;
			var day = this.dateOfBlockDay;
			var id = this.slotID;
			console.log("hidden is " + this.blockID);
			$(this.deleteButton).click(function(){
				content.hide();
				calendarDisplay.deleteDayBlockFromArray(number, day);
				calendarDisplay.setDeletedToTrue(id);
				calendarDisplay.deleteTimeslotFromArray();
			});
		};
	};

	var blockID = {
		dayName: "day",
		blockName: "block",
		weekdayName: "weekday",
		addButtonID: "#addButton",

		html: function(prefix, base){
			var id = "#" + prefix + "-" + base;
			return id;
		},

		numbered: function(id, n){
			var name = id;
			name = name + n;
			return name;
		},

		prefix: function(){
			return this.dayName + calendarDisplay.buttonPressed;
		},

		number: function(number){
			console.log(this.blockName + number);
			return this.blockName + number;
		},

		dateArray: function(){
			var datesByID = [];
			for (var i = 0; i < epochTime.weekLength; i++){
				datesByID.push(this.html(this.numbered(this.dayName, i), "date"));
			}
			return datesByID;
		},

		weekdayArray: function(){
			var weekdaysByID = [];
			for (var i = 0; i < epochTime.weekLength; i++){
				weekdaysByID.push(this.html(this.numbered(this.dayName, i), this.weekdayName));
			}
			return weekdaysByID;
		},
		
		createButtonIDs: function(baseName){
			var btnArray = [];
			
			for (var i = 0; i < epochTime.weekLength; i++){
				var btn = baseName + i;
				btnArray.push(btn);
			}
			return btnArray;
		},
		
		//creates a date hmtl prefix
		date: function(){
			return $(this.html(this.prefix(), "date"));
		},

		header: function(number){
			return $(this.html(this.prefix(), this.number(number) + "-header"));
		},

		details: function(number){
			return $(this.html(this.prefix(), this.number(number) + "-Details"));
		}
	}
	
	function init(){
		calendarDisplay.displayCalendar();
	};

	$(document).ready(function(){
		var $submitButton = $("#time-submit");
		var $modal = $("#myModal");
		var $closeButton = $("#closeButton");
		
		//opens the modal and logs which "add" button was pushed, for use in adding blocks to the correct days
		var showModal = function(btn, n){
			$(btn).click(function(){
				$modal.show();
				calendarDisplay.buttonPressed = n;
				console.log("button pressed is " + calendarDisplay.buttonPressed);
				$("#modalDisplayDate").text(" " + calendarDisplay.dateFormat(calendarDisplay.getBlockDateObject()) + " ")
			});
		};
		
		//close the modal when user hits the close button
		(function(){
			$closeButton.click(function(){
				$modal.hide();
			});
		})();

		//close the modal when the user hits the submit button, and add a new timeslot to an array
		(function(){
			$submitButton.click(function(){
				$modal.hide();
				calendarDisplay.createTimeslot();
			});
		})();

		//creates button IDs for the "add" buttons
		(function(){
			var buttonIDs = blockID.createButtonIDs(blockID.addButtonID);
			for (var i = 0; i < buttonIDs.length; i++){
				var btn = buttonIDs[i];
				showModal(btn, i);
			}
		})();
			
	});	

	window.onload = init();

})(jQuery);
