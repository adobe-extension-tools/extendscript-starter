class ActionScriptDemo {
	flashFile: File
	requiredContext: string

	constructor() {
		var scriptsFile = new File($.fileName);
		this.flashFile = new File(scriptsFile.parent.parent.fsName + "/resources/ActionScriptDemo.swf");
		this.requiredContext = "\tNeed to be running in a an application that uses ScriptUI and the ActionScriptDemo.swf file must exist\n";
	}

	run() {
		if(!this.canRun()) {
			return false;
		}

		// Create a dialog
		var flashPalette = new Window('dialog', 'SDK ActionScriptDemo: Flash Palette');
		
		// Set the player bounds to match the palette
		var cBounds = flashPalette.bounds;
		// add the Flash Player control to the palette.	
		
		var flashPlayer = flashPalette.add("flashplayer", cBounds);
		flashPlayer.preferredSize = [350, 175];
		
		// add an additional button to hold a flash launch panel
		flashPalette.btnPanel = flashPalette.add('panel', undefined, '');
		flashPalette.btnPanel.launchButton = flashPalette.btnPanel.add('button', undefined, 'Start Flash');
		flashPalette.btnPanel.closeButton = flashPalette.btnPanel.add('button', undefined, 'Close');
		
		flashPalette.btnPanel.closeButton.onClick = function(){
			flashPalette.close();
		}
		flashPalette.btnPanel.launchButton.onClick = function() {
			// start the flash player
			// Load the Flash file
			try {
				var scriptsFile = new File($.fileName);
				this.flashFile = new File(scriptsFile.parent.parent.fsName + "/resources/ActionScriptDemo.swf");
				flashPlayer.loadMovie(this.flashFile);			
			} catch(e){
				$.writeln(e);
			}
		};
		
		// Called from ActionScript to return a number.
		flashPlayer.getJavaScriptNumber = function() {
			return 12345;
		}

		// Called from ActionScript to return a string.
		flashPlayer.getJavaScriptString = function() {
			return "Hello from ExtendScript (ESTK)";
		}
	
		// Called from ActionScript to activate an alert window
		flashPlayer.launchJavaScript = function() {
			var newWin = new Window('dialog', 'Alert Box');
			newWin.btn = newWin.add('button', undefined, 'Close', {name:'cancel'});	
			newWin.show();
		}
		flashPalette.show();
		return true;
	}

	canRun() {
		if(this.flashFile.exists) { 
			return true;
		}
		$.writeln("ERROR:: Cannot run ActionScriptDemo");
		$.writeln(this.requiredContext);
		return false;
	}
}