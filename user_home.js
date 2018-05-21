"use strict";

(function($){
	var current = null;

	var epochTime = {
		DAY: 86400,
		HOUR: 3600,
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
			return this.datesFromCurrentDay(this.weekLength, this.DAY);
		},
		
		weekOfDateObjects: function(){
			return this.createDateObjects(this.epochDates());
		}
	}
	
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
			return timeslot;
		},
		
		initializeTimeslot: function(timeslot, array){
			if(timeslot.timeRangeIsCorrect()){
				console.log("new timeslot created");
				timeslot.showBlockContent();
				timeslot.addTimesToBlockHeader();
				timeslot.addDetailsToBlock();
				timeslot.createDeleteButton();
				timeslot.hideBlockContent();
				this.addTimeslotToArray(timeslot);
				array.push(timeslot.dateOfBlockDay);
			} else {
				console.log("no timeslot created");
			}
		},
		
		addTimeslotToArray: function(timeslot){
			this.timeslotArray.push(timeslot);	
		},
		
		getTimeslotByDate: function(date, blockArray){
			//for every timeslot in the timeslotArray
				//if the date of the timeslot is equal to the date and can be found in the block array
					//return timeslot
				
			var slotArray = this.timeslotArray;
			
			for (var i = 0; i < slotArray.length; i++){
				var timeslot = slotArray[i];
				
				if(timeslot.dateOfBlockDay === date && blockArray.indexOf(date) > -1 ){
					timeslot = timeslot;
				} else {
					console.log("there is no matching date in timeslotArray");
				}
			}
			
			return timeslot;
		},
		
		createTimeslot: function(){
			var date = this.blockDate();
			var slot = this.newTimeslot();

			if(this.timeslotArray.length < 1){
				slot.setBlockNumber(1);
				this.initializeTimeslot(slot, this.block1Array);
			} else if(this.timeslotArray.length >= 1){
				if(this.block1Array.indexOf(date) === -1 && this.block2Array.indexOf(date) === -1){
					slot.setBlockNumber(1);
					this.initializeTimeslot(slot, this.block1Array);
				} else if (this.block1Array.indexOf(date) === -1 && this.block2Array.indexOf(date) != -1){
					var oldTimeslot = this.getTimeslotByDate(date, this.block2Array);

					if (this.time1IsEarlierThanTime2(slot.endTime, oldTimeslot.startTime) === true){
						slot.setBlockNumber(1);
						this.initializeTimeslot(slot, this.block1Array);
					} else if (this.time1IsEarlierThanTime2(oldTimeslot.endTime, slot.startTime) === true){
						oldTimeslot.setBlockNumber(1);
						this.deleteDayBlockFromArray(2, date);
						this.initializeTimeslot(oldTimeslot, this.block1Array);
						slot.setBlockNumber(2);
						this.initializeTimeslot(slot, this.block2Array);
						console.log("new slot start and end times are " + slot.startTime + " " + slot.endTime);
					} else {
						console.log("timeslots overlap " + oldTimeslot.startTime + slot.endTime);
					}
				} else if (this.block1Array.indexOf(date) != -1 && this.block2Array.indexOf(date) === -1){
					oldTimeslot = this.getTimeslotByDate(date, this.block1Array);

					if (this.time1IsEarlierThanTime2(oldTimeslot.endTime, slot.startTime) === true){
						slot.setBlockNumber(2);
						this.initializeTimeslot(slot, this.block2Array);
					} else if (this.time1IsEarlierThanTime2(slot.endTime, oldTimeslot.startTime) === true){
						oldTimeslot.setBlockNumber(2);
						this.deleteDayBlockFromArray(1, date);
						this.initializeTimeslot(oldTimeslot, this.block2Array);
						slot.setBlockNumber(1);
						this.initializeTimeslot(slot, this.block1Array);
						console.log("new slot start and end times are " + slot.startTime + " " + slot.endTime);
					} else {
						console.log("timeslots overlap " + slot.startTime + oldTimeslot.endTime);
					}
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
		
		time1IsEarlierThanTime2: function(time1, time2){
			var isTime1Lesser = true;
			
			if(time1 > time2){
				isTime1Lesser = false;
			} else if (time1 <= time2){
				console.log("Start time entered by user is valid");
			}
			return isTime1Lesser;
		},
		
		test: function(timeslot){
			var array1 = this.block1Array;
			var slot = timeslot;
			slot.log();
			
			if(array1.indexOf(slot.dateOfBlockDay) === -1){
				console.log("this date does not exist in block1");
			} else {
				var indexOfDate = array1.indexOf(slot.dateOfBlockDay);
				var dateOfTimeslotInBlock1 = array1[indexOfDate];
				
				var startTime1 = this.getEndTime(dateOfTimeslotInBlock1);
				var startTime2 = slot.startTime;
				console.log("index of date is: " + dateOfTimeslotInBlock1);
				console.log("Start time 1 is: " + startTime1);
				console.log("Start time 2 is: " + startTime2);
				
				if(this.time1IsEarlierThanTime2(startTime1, startTime2)){
					slot.blockNumber = 2;
				} else {
					console.log("Timeslot two is in the same range as block 1");
				}
			}
			
			console.log(slot.blockIDnumber);
		},
		
		getEndTime: function(date){
			var array = this.timeslotArray;
			var time;
			
			for (var i = 0; i < array.length; i++){
				var timeslot = array[i];
				if (timeslot.dateOfBlockDay === date){
					var time = timeslot.endTime;
				}
			}
			
			console.log(time);
			return time;
		},

		displayCalendar: function(){
			this.textToDisplay(this.formatArrayItems(epochTime.weekOfDateObjects(), this.dateFormat), blockID.dateArray());
			this.textToDisplay(this.formatArrayItems(epochTime.weekOfDateObjects(), this.weekdayFormat),  blockID.weekdayArray());
		}
	}

	function Timeslot(dateOfBlockDay, slotID){
		this.dateOfBlockDay = dateOfBlockDay;
		this.blockIDPrefix = blockID.prefix();
		this.blockNumber = 0;
		this.$timeslotStart = $("#timeslot-start");
		this.$timeslotEnd = $("#timeslot-end");
		this.deleteButton = "";
		this.startTime = this.$timeslotStart.val();
		this.endTime = this.$timeslotEnd.val();
		this.deleted = false;
		this.slotID = slotID;
		
		this.blockIDnumber = function(){
			var idNumber = blockID.number(this.blockNumber);
			console.log("blockIDnumber is: " + idNumber);
			return idNumber;
		};
		
		this.blockID = function(){
			var id = blockID.html(this.blockIDPrefix, this.blockIDnumber());
			return id;
		};
		
		
		this.log = function(){
			console.log("working as expected");
		};
		
		this.setBlockNumber = function(number){
			this.blockNumber = number;
			console.log("setBlockNumber has set block number to: " + this.blockNumber);
			return this.blockNumber;
		};

		this.showBlockContent = function(){
			var content = $(blockID.html(this.blockIDPrefix, this.blockIDnumber()));
			console.log("showing timeslot content");
			console.log(blockID.html(this.blockIDPrefix, this.blockIDnumber()));
			content.show();
		};
		
		this.deletedIsTrue = function(){
			this.deleted = true;
			return this.deleted;
		};
		
		//converts the start and end times of the meetup to text for display
		this.addTimesToBlockHeader = function(){
			var startTime = this.startTime;
			var endTime = this.endTime;
			blockID.header(this.blockNumber).text(this.timeInputToString(startTime) + this.am_pm(startTime) + " to " + this.timeInputToString(endTime) + this.am_pm(endTime));
			//console.log("Start time is " + this.startTime);
		};
		
		this.timeRangeIsCorrect = function(){
			var timesAreValid = false;
			var time1 = this.createTimeObject(this.startTime);
			var time2 = this.createTimeObject(this.endTime);	
			var difference = Math.abs(time1 - time2);
			var hours = (difference/epochTime.HOUR)/1000;
			console.log("difference between times is " + hours);
			
			if(calendarDisplay.time1IsEarlierThanTime2(time1, time2)){
				if(hours < 2 || hours > 24){
					console.log("Time range is outside of matching range");
				} else if(hours >= 2 && hours < 24){
					console.log("Time range is within matching range");
					timesAreValid = true;
				} else if(isNaN(hours)){
					console.log("difference between start and end times is not a valid number");
				}
			} else {
				console.log("Invalid time range entered by user");
			}
			
			return timesAreValid;
		};
		
		this.time1IsEarlierThanTime2 = function(time1, time2){
			var isTime1Lesser = true;
			
			if(time1 >= time2){
				isTime1Lesser = false;
			} else if (time1 < time2){
				console.log("Start time entered by user is valid");
			}
			return isTime1Lesser;
		};
		
		this.putTimeslotsInOrder = function(){
			
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
		
		this.createTimeObject = function(time){
			var initialDate = epochTime.createInitialDay();
			var interval = calendarDisplay.buttonPressed * epochTime.DAY;
			var epochDate = initialDate + interval;
			var newDate = new Date(epochDate * 1000);
			var hours = this.timeInputHours(time);
			var minutes = this.timeInputMinutes(time);
			newDate.setHours(hours, minutes);
			
			console.log(initialDate);
			console.log(interval);
			console.log(epochDate);
			console.log(newDate.toLocaleString());
			
			return newDate;
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
			blockID.details(this.blockNumber).text(this.blockDetails);
		};
		
		//creates a delete button for the content block
		this.createDeleteButton = function(){
			var btn = this.blockID() + "-delete";
			this.deleteButton = btn;
			console.log(this.deleteButton);
		};
		
		//hides the content block on click
		this.hideBlockContent = function(){
			var content = $(this.blockID());
			var number = this.blockNumber;
			var day = this.dateOfBlockDay;
			var id = this.slotID;
			console.log("hideBlockContent blockID is " + this.blockID());
			console.log("hideBlockContent dateOfBlockDay is " + this.dateOfBlockDay);
			$(this.deleteButton).click(function(){
				content.hide();
				calendarDisplay.deleteDayBlockFromArray(number, day);
				calendarDisplay.setDeletedToTrue(id);
				calendarDisplay.deleteTimeslotFromArray();
			});
		};
	};
	
	function init(){
		calendarDisplay.displayCalendar();
	};

	$(document).ready(function(){
		var $submitButton = $("#time-submit");
		var $modal = $("#myModal");
		var $closeButton = $("#closeButton");
		var $dateBlockWrap = $(".dateblock-wrap");
		
		//opens the modal and logs which "add" button was pushed, for use in adding blocks to the correct days
		var showModal = function(btn, n){
			$(btn).click(function(){
				$modal.show();
				calendarDisplay.buttonPressed = n;
				console.log("button pressed is " + calendarDisplay.buttonPressed);
				$("#modalDisplayDate").text(" " + calendarDisplay.dateFormat(calendarDisplay.getBlockDateObject()) + " ")
			});
		};
		
		(function(){
		//close the modal when user hits the close button
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
