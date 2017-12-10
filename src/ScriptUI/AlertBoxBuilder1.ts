class AlertBoxBuilder1 {
	run() {
		var retval = true;
	
		function createBuilderDialog(): Window {
			// Create an empty dialog window near the upper left of the screen
			var dlg = new Window('dialog', 'Alert Box Builder');
			dlg.frameLocation = [100, 100];
			// Add a container panel for the title and 'message text' strings
			dlg.msgPnl = dlg.add('panel', undefined, 'Messages');
			dlg.msgPnl.alignChildren = "right";
			// add the panel's child components
			dlg.msgPnl.title = dlg.msgPnl.add('group');
			dlg.msgPnl.msg = dlg.msgPnl.add('group');
			dlg.msgPnl.msgWidth = dlg.msgPnl.add('group');
			dlg.msgPnl.msgHeight = dlg.msgPnl.add('group');
			dlg.msgPnl.title.st = dlg.msgPnl.title.add('statictext', undefined, 'Alert box title:');
			dlg.msgPnl.title.et = dlg.msgPnl.title.add('edittext', undefined, 'Sample Alert');
			dlg.msgPnl.title.et.preferredSize = [200,20];
			dlg.msgPnl.msg.st = dlg.msgPnl.msg.add('statictext', undefined, 'Alert message:');
			dlg.msgPnl.msg.et = dlg.msgPnl.msg.add('edittext', undefined, '<your message here>', {multiline:true});
			dlg.msgPnl.msg.et.preferredSize = [200,60];
			dlg.msgPnl.msgWidth.st = dlg.msgPnl.msgWidth.add('statictext', undefined, 'Message width:');
			dlg.msgPnl.msgWidth.sl = dlg.msgPnl.msgWidth.add('slider', undefined, 150, 100, 300);
			dlg.msgPnl.msgWidth.sl.preferredSize = [150, 20];
			dlg.msgPnl.msgWidth.et = dlg.msgPnl.msgWidth.add('edittext');
			dlg.msgPnl.msgWidth.et.preferredSize = [40, 20];
			dlg.msgPnl.msgHeight.st = dlg.msgPnl.msgHeight.add('statictext', undefined, 'Message height:');
			dlg.msgPnl.msgHeight.sl = dlg.msgPnl.msgHeight.add('slider', undefined, 20, 20, 300);
			dlg.msgPnl.msgHeight.sl.preferredSize = [150, 20];
			dlg.msgPnl.msgHeight.et = dlg.msgPnl.msgHeight.add('edittext');
			dlg.msgPnl.msgHeight.et.preferredSize = [40, 20];
			// Add a checkbox to control the presence of buttons to dismiss the alert box
			dlg.hasBtnsCb = dlg.add('checkbox', undefined, 'Has alert buttons?');
			// Add a panel to determine alignment of buttons on the alert box
			dlg.alertBtnsPnl = dlg.add('panel', undefined, 'Button alignment');
			dlg.alertBtnsPnl.orientation = "row";
			dlg.alertBtnsPnl.alignLeftRb =
			dlg.alertBtnsPnl.add('radiobutton', undefined, 'Left');
			dlg.alertBtnsPnl.alignCenterRb =
			dlg.alertBtnsPnl.add('radiobutton', undefined, 'Center');
			dlg.alertBtnsPnl.alignRightRb =
			dlg.alertBtnsPnl.add('radiobutton', undefined, 'Right');
	
			// Add a panel with buttons to test parameters and
			// create the alert box specification
			dlg.btnPnl = dlg.add('panel', undefined, 'Build it');
			dlg.btnPnl.orientation = "row";
			dlg.btnPnl.testBtn = dlg.btnPnl.add('button', undefined, 'Test');
			dlg.btnPnl.buildBtn = dlg.btnPnl.add('button', undefined, 'Build', {name:'ok'});
			dlg.btnPnl.cancelBtn = dlg.btnPnl.add('button', undefined, 'Cancel', {name:'cancel'});
			
			return dlg;
		}
	
	
		/**
		 This function initializes the values in the controls
		 of the builder dialog 
		*/
		function initializeBuilder(builder: Window) {
			// Set up initial control states
			builder.hasBtnsCb.value = true;
			builder.alertBtnsPnl.alignCenterRb.value = true;
			builder.msgPnl.msgWidth.et.text = builder.msgPnl.msgWidth.sl.value;
			builder.msgPnl.msgHeight.et.text = builder.msgPnl.msgHeight.sl.value;
	
			// Attach event callback functions to controls
			// The 'has buttons' checkbox enables or disables the panel that
			// determines the justification of the 'alert' button group
	
			builder.hasBtnsCb.onClick = function () { this.parent.alertBtnsPnl.enabled = this.value; };
	
			// The edittext fields and scrollbars in msgPnl are connected
			builder.msgPnl.msgWidth.et.onChange = function () { this.parent.parent.msgWidth.sl.value = Number(this.text); };
			builder.msgPnl.msgWidth.sl.onChanging = function () { this.parent.parent.msgWidth.et.text = Math.floor(this.value); };
			builder.msgPnl.msgHeight.et.onChange = function () { this.parent.parent.msgHeight.sl.value = Number(this.text); };
			builder.msgPnl.msgHeight.sl.onChanging = function () { this.parent.parent.msgHeight.et.text = Math.floor(this.value); };
			
			// The Test button creates a trial Alert box from
			// the current specifications
			builder.btnPnl.testBtn.onClick = function ()
			{
				$.writeln("Displaying customized alert dialog");
				createTestDialog(createResource(this.parent.parent));
			};

			// The Build and Cancel buttons close this dialog
			builder.btnPnl.buildBtn.onClick = function () { this.parent.parent.close(1); };
			builder.btnPnl.cancelBtn.onClick = function () { this.parent.parent.close(2); };
		} // initializeBuilder
	
	
		/**
		 This function invokes the dialog an returns its result
		*/
		function runBuilder(builder: Window) {
			return builder.show();
		}
	
		/**
		 This function creates and returns a string containing a dialog
		 resource specification that will create an Alert dialog using
		 the parameters the user entered in the builder dialog. 
		*/
		function createResource(builder: Window) {
			// Define the initial part of the resource spec with dialog parameters
			var res = "dialog { " + stringProperty("text", builder.msgPnl.title.et.text) + "\n";
			
			// Define the alert message statictext element, sizing it as user specified
			var textWidth = Number(builder.msgPnl.msgWidth.et.text);
			var textHeight = Number(builder.msgPnl.msgHeight.et.text);
			res += " msg: StaticText { " + stringProperty("text", builder.msgPnl.msg.et.text) + 
				" preferredSize: [" + textWidth + ", " + textHeight + "],\n" +
				" alignment:['center','top'], properties:{multiline:true} }";
			
			// Define buttons if desired
			var hasButtons = builder.hasBtnsCb.value;
			if (hasButtons) {
				var groupAlign = "center";
				// Align buttons as specified
				if (builder.alertBtnsPnl.alignLeftRb.value) {
					groupAlign = "left";
				}
				else if (builder.alertBtnsPnl.alignRightRb.value) {
					groupAlign = "right";
				}
				
				res += ",\n" + " btnGroup: Group {\n" + stringProperty(" alignment", groupAlign) +
					"\n" + " okBtn: Button { " + stringProperty("text", "OK") +"},\n";
				res += " cancelBtn: Button { " + stringProperty("text", "Cancel") +"}" + " }";
			}
	
			// done
			res += "\n}";
			return res;
		}
	
		// Utility string-building function
		function stringProperty(pname: string, pval: string) {
			return pname + ":'" + pval + "', ";
		}
	
		// Display the 	generated alert dialog
		function createTestDialog(resource: string) {
			var target = new Window(resource);
			target.center();
			return target.show();
		}
		//------------- "Main" -------------//
		// Create and initialize the user-input dialog
		var builder = createBuilderDialog(); 
		initializeBuilder(builder);
	
		// Show the user-input dialog, and save the returned resource string
		if (runBuilder(builder) == 1 ){
			// Create the Alert dialog resource-specification string
			var resSpec = createResource(builder);
			// Write the resource string to a file w/platform file-save dialog
			var fname = File.saveDialog('Save resource specification').absoluteURI;
			var f = File(fname);
			if (f.open('w')) {
				var ok = f.write(resSpec);
				if (ok) {
					ok = f.close();
				}
				if (! ok) {
					alert("Error creating " + fname + ": " + f.error);
				}
			}
		}
		
		return retval;
	}	
}
