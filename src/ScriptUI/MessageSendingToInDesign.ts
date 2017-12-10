class MessageSendingToInDesign {
	
	/**
	 The context in which this snippet can run.
	 @type String
	*/
	requiredContext = "\tInDesign CS4 must be running.";
	
	constructor() {
		$.level = 1; // Debugging level
	}
	
	run() {
		var retval = true;
		if(!this.canRun()) {
			retval = false;	
			return retval;
		}
		// Create the message object
		var bt = new BridgeTalk();
		// Initialize with the target and message string
		bt.target = "indesign";
		bt.body = "var SnpSentMessage = {}; SnpSentMessage.create = " + createInDesignObjects.toString();
		bt.body += "SnpSentMessage.create();"
		
		// Handle error case
		bt.onError = function(errObj)
		{
			$.writeln(errObj.body);
		}
		
		// Handler to get the result of the message, so we know when it is completed and with what result
		bt.onResult = function(resObj)
		{
			// The result of executing the code is the last line of the script that was executed in the target (InDesign)
			var retval = eval(resObj.body);
			$.writeln("MessageSendingToInDesign: (ESTK) received result = " + retval);
			$.writeln("MessageSendingToInDesign: (ESTK) the process of creating objects in InDesign has finished...");
			// Now we're done, switch the front app to be InDesign to see the result
			BridgeTalk.bringToFront("indesign");
		}
	
		$.writeln("MessageSendingToInDesign: (ESTK) about to send initial message to InDesign");
		// Send the message
		bt.send();
		$.writeln("MessageSendingToInDesign: (ESTK) BridgeTalk.send() invoked, MessageSendingToInDesign.run() exiting");
			 
		return retval;
	}

	canRun() {
		// Must run in ESTK
		// InDesign must be running
		if(BridgeTalk.isRunning("indesign")) {
			return true;
		}
		// Fail if these preconditions are not met. 
		$.writeln("ERROR:: Cannot run MessageSendingToInDesign");
		$.writeln(this.requiredContext);
		return false;
	}
}

function createInDesignObjects() {
	$.writeln("MessageSendingToInDesign: (InDesign) entering createInDesignObjects");
	var mylayername = "snpsendmessagetoidlayer";
	var mydoc = app.documents.add();
	var mylayer = mydoc.layers.add({name: mylayername});
	mydoc.pages.item(0).myframe = mydoc.pages.item(0).textFrames.add(mydoc.layers.item(mylayername));
	mydoc.pages.item(0).myframe.geometricBounds = ["6p0", "6p0", "18p0", "18p0"];
	mydoc.pages.item(0).myframe.contents = "Hello World from MessageSendingToInDesign";
	$.writeln("MessageSendingToInDesign: (InDesign) leaving createInDesignObjects");
	return true;
}