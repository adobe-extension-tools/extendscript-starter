function createDeepFolderStructure(foldersArray: Folder[] | string[], maxDepth: number) {
  if (typeof foldersArray !== 'object' || foldersArray.length <= 0) {
    throw new Error('No valid folders array was provided!');
  }
  // if the first folder already exists, throw error
  for (var i = 0; i < app.project.rootItem.children.numItems; i++) {
    var curChild = app.project.rootItem.children[i];
    if (curChild.type === ProjectItemType.BIN && curChild.name === foldersArray[0]) {
      throw new Error('Folder with name "' + curChild.name + '" already exists!');
    }
  }
  // create the deep folder structure
  var currentBin = app.project.rootItem.createBin(foldersArray[0]);
  for (var i = 1; i < foldersArray.length && i < maxDepth; i++) {
    currentBin = currentBin.createBin(foldersArray[i]);
  }
}

function getVersionInfo() {
  return 'PPro ' + app.version + 'x' + app.build;
}

function getUserName() {
  var	homeDir		= new File('~/');
  var	userName	= homeDir.displayName;
  homeDir.close();
  return userName;
}

function keepPanelLoaded() {
  app.setExtensionPersistent("com.adobe.PProPanel", 0); // 0, while testing (to enable rapid reload); 1 for "Never unload me, even when not visible."
}

function updateGrowingFile() {
  var numItems	= app.project.rootItem.children.numItems;
  for (var i = 0; i < numItems; i++){
    var currentItem = app.project.rootItem.children[i];
    if (currentItem){
      currentItem.refreshMedia();
    }
  }
}

function getSep() {
  if (Folder.fs == 'Macintosh') {
    return '/';
  } else {
    return '\\';
  }
}

function saveProject() {
  app.project.save();
}

function exportCurrentFrameAsPNG() {
  app.enableQE();
  var activeSequence	= qe.project.getActiveSequence(); 	// note: make sure a sequence is active in PPro UI
  if (activeSequence) {
    var time			= activeSequence.CTI.timecode; 	// CTI = Current Time Indicator.

    var removeThese = /:|;/ig;    // Why? Because Windows chokes on colons.
    time = time.replace(removeThese, '_');
    var outputPath		= new File("~/Desktop");
    var outputFileName	= outputPath.fsName + getSep() + time + '___' + activeSequence.name;

    activeSequence.exportFramePNG(time, outputFileName);
  } else {
    updateEventPanel("No active sequence.");
  }
}

function renameFootage() {
  var item = app.project.rootItem.children[0]; // assumes the zero-th item in the project is footage.
  if (item) {
    item.name = item.name + ", updated by PProPanel.";
  } else {
    updateEventPanel("No project items found.");
  }
}

function getActiveSequenceName() {
  if (app.project.activeSequence) {
    return app.project.activeSequence.name;
  } else {
    return "No active sequence.";
  }
}

function registerProjectPanelChangedFxn() {
  const success = app.bind("onSourceClipSelectedInProjectPanel", projectPanelSelectionChanged);
}

function projectPanelSelectionChanged() {
  var remainingArgs 	= arguments.length;
      var message 		= arguments.length + " items selected: ";
      
  for (var i = 0; i < arguments.length; i++) {
          message += arguments[i].name;
          remainingArgs--;
          if (remainingArgs > 1) {
              message += ', ';
          }
          if (remainingArgs === 1){
              message += ", and ";
          } 
          if (remainingArgs === 0) {
              message += ".";
          }
      }
      app.setSDKEventMessage(message, 'info');
  }

function getProjectPanelMeta() {
  updateEventPanel(app.project.getProjectPanelMetadata());
}

function setProjectPanelMeta() {
  const metadata = "<?xml version='1.0'?><md.paths version='1.0'><metadata_path><internal>true</internal><namespace>http://ns.adobe.com/exif/1.0/</namespace><description>ColorSpace</description><entry_name>ColorSpace</entry_name><parent_id>http://ns.adobe.com/exif/1.0/</parent_id></metadata_path><metadata_path><internal>false</internal><namespace>http://amwa.tv/mxf/as/11/core/</namespace><description>audioTrackLayout</description><entry_name>audioTrackLayout</entry_name><parent_id>http://amwa.tv/mxf/as/11/core/</parent_id></metadata_path><metadata_path><internal>false</internal><namespace>http://ns.useplus.org/ldf/xmp/1.0/</namespace><description>ImageCreator</description><entry_name>ImageCreator</entry_name><parent_id>http://ns.useplus.org/ldf/xmp/1.0/</parent_id></metadata_path></md.paths>";
  app.project.setProjectPanelMetadata(metadata);
}

function exportSequenceAsPrProj() {
  var activeSequence = app.project.activeSequence;
  if (activeSequence) {

    var startTimeOffset		= activeSequence.zeroPoint;  
    var prProjExtension		= '.prproj';
    var outputName			= activeSequence.name;
    var outFolder			= Folder.selectDialog();
  
    if (outFolder) {
      var completeOutputPath =	outFolder.fsName + 
                    getSep() +
                    outputName +
                    prProjExtension;
    
      app.project.activeSequence.exportAsProject(completeOutputPath);
  
      updateEventPanel("Exported " + app.project.activeSequence.name + " to " +completeOutputPath + ".");
    } else {
      updateEventPanel("Could not find or create output folder.");
    }

    // Here's how to import N sequences from a project.
    //
    // var seqIDsToBeImported = new Array;
    // seqIDsToBeImported[0] = ID1;
    // ...
    // seqIDsToBeImported[N] = IDN;
    //
    //app.project.importSequences(pathToPrProj, seqIDsToBeImported);
    
  }else {
    updateEventPanel("No active sequence.");
  }
}

function createSequenceMarkers() {
  var activeSequence = app.project.activeSequence;
  if (activeSequence) {
    var markers		= activeSequence.markers; 
    if (markers) {
      var numMarkers	= markers.numMarkers;
      if (numMarkers > 0) {
        var marker_index = 1;
        for(var current_marker	=	markers.getFirstMarker();
            current_marker	!==	undefined; 
            current_marker	=	markers.getNextMarker(current_marker)){
          if (current_marker.name !== "") {
            updateEventPanel(	'Marker ' + marker_index + ' name = ' + current_marker.name + '.');
          } else {
            updateEventPanel(	'Marker ' + marker_index + ' has no name.');
          }

          if (current_marker.end.seconds > 0) {
            updateEventPanel(	'Marker ' + marker_index + ' duration = ' + (current_marker.end.seconds - current_marker.start.seconds) + ' seconds.');
          } else {
            updateEventPanel(	'Marker ' + marker_index + ' has no duration.');
          }
          updateEventPanel('Marker ' + marker_index + ' starts at ' + current_marker.start.seconds + ' seconds.');
          marker_index = marker_index + 1;
        }
      }
    }

    var newCommentMarker			= markers.createMarker(12.345);
    newCommentMarker.name			= 'Marker created by PProPanel.';
    newCommentMarker.comments		= 'Here are some comments, inserted by PProPanel.';
    newCommentMarker.end			= 15.6789;

    var newWebMarker				= markers.createMarker(14.345);
    newWebMarker.name			= 'Web marker created by PProPanel.';
    newWebMarker.comments		= 'Here are some comments, inserted by PProPanel.';
    newWebMarker.end			= 17.6789;
    newWebMarker.setTypeAsWebLink("http://www.adobe.com", "frame target");
  } else {
    updateEventPanel("No active sequence.");
  }
}

function exportFCPXML() {
  if (app.project.activeSequence) {
    var projPath			= new File(app.project.path);
    var parentDir			= projPath.parent;
    var outputName			= app.project.activeSequence.name;
    var xmlExtension		= '.xml';
    var outputPath			= Folder.selectDialog("Choose the output directory");
  
    if (outputPath) {
      var completeOutputPath = outputPath.fsName + getSep() + outputName + xmlExtension;
      app.project.activeSequence.exportAsFinalCutProXML(completeOutputPath, 1); // 1 == suppress UI
      var info = 	"Exported FCP XML for " + 
            app.project.activeSequence.name + 
            " to " + 
            completeOutputPath + 
            ".";
      updateEventPanel(info);
    } else {
      updateEventPanel("No output path chosen.");
    }
  } else {
    updateEventPanel("No active sequence.");
  }
}

function openInSource() {
  var fileToOpen = File.openDialog ("Choose file to open.", 0, false);
  if (fileToOpen) {
    app.sourceMonitor.openFilePath(fileToOpen.fsName);
    app.sourceMonitor.play(1.73); // playback speed as float, 1.0 = normal speed forward
    fileToOpen.close(); 
  } else {
    updateEventPanel("No file chosen.");		
  }
}

function searchForBinWithName(nameToFind) {
  // deep-search a folder by name in project
  var deepSearchBin = function(inFolder) {
    if (inFolder && inFolder.name === nameToFind && inFolder.type === 2) {
      return inFolder;
    } else {
      for (var i = 0; i < inFolder.children.numItems; i++) {
        if (inFolder.children[i] && inFolder.children[i].type === 2) {
          var foundBin = deepSearchBin(inFolder.children[i]);
          if (foundBin) return foundBin;
        }
      }
    }
    return undefined;
  };
  return deepSearchBin(app.project.rootItem);
}

function importFiles() {
  if (app.project) {
    var fileOrFilesToImport	= File.openDialog (	"Choose files to import", 	// title
                          0, 							// filter available files? 
                          true); 						// allow multiple?

    // New in 11.1; you can determine which bin will be targeted, before importing.

    var currentTargetBin = app.project.getInsertionBin();

    if (currentTargetBin.nodeId === app.project.rootItem.nodeId){
      // If we're here, then the target bin is the root of the project.
    }
    if (fileOrFilesToImport) {
      // Of course, panels are welcome to override that default insertion bin behavior... :)
      var targetBin = getPPPInsertionBin();
      if (targetBin) {
        targetBin.select();
        // We have an array of File objects; importFiles() takes an array of paths.
        var importThese: File[] = [];
        if (importThese){
          for (var i = 0; i < fileOrFilesToImport.length; i++) {
            importThese[i] = fileOrFilesToImport[i].fsName;
          }
          app.project.importFiles(importThese, 
                      1,				// suppress warnings 
                      targetBin,
                      0);				// import as numbered stills
        }
      } else {
        updateEventPanel("Could not find or create target bin.");
      }
    } 
  }
}

function muteFun() {
  if (app.project.activeSequence){
    for (var i = 0; i < app.project.activeSequence.audioTracks.numTracks; i++){
      var currentTrack	= app.project.activeSequence.audioTracks[i];
      if (Math.random() > 0.5){
        currentTrack.setMute(!(currentTrack.isMuted()));
      }
    }
  } else {
    updateEventPanel("No active sequence found.");
  }
}

function disableImportWorkspaceWithProjects() {
  var prefToModify	= 'FE.Prefs.ImportWorkspace';
  var appProperties 	= app.properties;
  
  if (appProperties){
    var propertyExists 		= app.properties.doesPropertyExist(prefToModify);
    var propertyIsReadOnly 	= app.properties.isPropertyReadOnly(prefToModify);
    var propertyValue 		= app.properties.getProperty(prefToModify);
  
    // optional third parameter possible: 0 = non-persistent,  1 = persistent (default)
    appProperties.setProperty(prefToModify, false, 1);
    var safetyCheck = app.properties.getProperty(prefToModify);

    if (safetyCheck != propertyValue){
      updateEventPanel("Changed \'Import Workspaces with Projects\' from " + propertyValue + " to " + safetyCheck + ".");
    }
  } else {
    updateEventPanel("Properties not found.");
  }
}

function replaceMedia() {
  
  // 	Note: 	This method of changing paths for projectItems is from the time
  //			before PPro supported full-res AND proxy paths for each projectItem. 
  //			This can still be used, and will change the hi-res projectItem path, but
  //			if your panel supports proxy workflows, it should rely instead upon
  //			projectItem.setProxyPath() instead. 

  var firstProjectItem = app.project.rootItem.children[0]; 
  if (firstProjectItem) {
    if (firstProjectItem.canChangeMediaPath()) {
    
      // 	NEW in 9.0: setScaleToFrameSize() ensures that for all clips created from this footage, 
      //	auto scale to frame size will be ON, regardless of the current user preference. 
      //	This is	important for proxy workflows, to avoid mis-scaling upon replacement. 

      //	Addendum: This setting will be in effect the NEXT time the projectItem is added to a 
      //	sequence; it will not affect or reinterpret clips from this projectItem, already in
      //	sequences.

      firstProjectItem.setScaleToFrameSize();
      
      var replacementMedia = File.openDialog(	"Choose new media file, for " + 
                          firstProjectItem.name, 
                          0, 						// file filter
                          false); 				// allow multiple?
      
      if (replacementMedia) {
        firstProjectItem.name = replacementMedia.name + ", formerly known as " + firstProjectItem.name;
        firstProjectItem.changeMediaPath(replacementMedia.fsName);
        replacementMedia.close(); 
      } 
    } else {
      updateEventPanel("Couldn't change path of " + firstProjectItem.name + ".");
    }
  } else {
    updateEventPanel("No project items found.");
  }
}

function openProject() {
  var filterString = "";
  if (Folder.fs === 'Windows'){
    filterString = "All files:*.*";
  }
  var projToOpen	= File.openDialog ("Choose project:", filterString, false);
  if ((projToOpen) && projToOpen.exists) {
    app.openDocument(	projToOpen.fsName,
              1,					// suppress 'Convert Project' dialogs?
              1,					// suppress 'Locate Files' dialogs?
              1);					// suppress warning dialogs?
    projToOpen.close();
  }	
}

function exportFramesForMarkers(){
  app.enableQE();
  var activeSequence = app.project.activeSequence;
  if (activeSequence) {
    var markers			= activeSequence.markers; 
    var markerCount		= markers.numMarkers;
    if (markerCount > 0){
      var firstMarker = markers.getFirstMarker();

      activeSequence.setPlayerPosition(firstMarker.start.ticks);

      exportCurrentFrameAsPNG();

      var previousMarker = 0;

      if (firstMarker){
        for(var i = 0; i < markerCount; i++){
          if (i === 0){
            currentMarker = markers.getNextMarker(firstMarker);
          } else {
            currentMarker = markers.getNextMarker(previousMarker);
          }
          if (currentMarker){
            activeSequence.setPlayerPosition(currentMarker.start.ticks);
            previousMarker = currentMarker;
            exportCurrentFrameAsPNG();
          }
        }
      }
    } else {
      updateEventPanel("No markers applied to " + activeSequence.name + ".");
    }
  } else {
    updateEventPanel("No active sequence.");
  }
}

function createSequence(name) {
  var someID = "xyz123";
  var seqName = prompt('Name of sequence?',	 '<<<default>>>', 'Sequence Naming Prompt');
  app.project.createNewSequence(seqName, someID);
}

function createSequenceFromPreset(presetPath) {
  app.enableQE();
  var seqName = prompt('Name of sequence?',	 '<<<default>>>', 'Sequence Naming Prompt');
  if (seqName) {
    qe.project.newSequence(seqName, presetPath);
  }
}

function transcode(outputPresetPath) {
  app.encoder.bind('onEncoderJobComplete',	onEncoderJobComplete);
  app.encoder.bind('onEncoderJobError', 		onEncoderJobError);
  app.encoder.bind('onEncoderJobProgress', 	onEncoderJobProgress);
  app.encoder.bind('onEncoderJobQueued', 		onEncoderJobQueued);
  app.encoder.bind('onEncoderJobCanceled',	onEncoderJobCanceled);

  var firstProjectItem = app.project.rootItem.children[0];
  if (firstProjectItem){

    app.encoder.launchEncoder();	// This can take a while; let's get the ball rolling.

    var fileOutputPath	= Folder.selectDialog("Choose the output directory");
    if (fileOutputPath){
      var outputName	= firstProjectItem.name.search('[.]');
      if (outputName == -1){
        outputName	= firstProjectItem.name.length;
      }
      outFileName	= firstProjectItem.name.substr(0, outputName);
      outFileName	= outFileName.replace('/', '-');
      var completeOutputPath	= fileOutputPath.fsName + getSep() + outFileName + '.mxf';
      var removeFromQueue		= false;
      var rangeToEncode		= app.encoder.ENCODE_IN_TO_OUT;
      app.encoder.encodeProjectItem(	firstProjectItem, 
                      completeOutputPath, 
                      outputPresetPath, 
                      rangeToEncode, 
                      removeFromQueue); 
      app.encoder.startBatch();
    }
  } else {
    updateEventPanel("No project items found.");
  }
}

function transcodeExternal(outputPresetPath) {
  app.encoder.launchEncoder();
  var fileToTranscode = File.openDialog ("Choose file to open.", 0, false);
  if (fileToTranscode) {
    var fileOutputPath = Folder.selectDialog("Choose the output directory");
    if (fileOutputPath){

      var srcInPoint		= 1.0; 	// encode start time at 1s (optional--if omitted, encode entire file)
      var srcOutPoint		= 3.0; // encode stop time at 3s (optional--if omitted, encode entire file)
      var removeFromQueue	= false;

      var result = app.encoder.encodeFile(fileToTranscode.fsName, 
                        fileOutputPath.fsName, 
                        outputPresetPath, 
                        removeFromQueue, 
                        srcInPoint, 
                        srcOutPoint);
    }
  }
}

function render(outputPresetPath) {
  app.enableQE();
  var activeSequence = qe.project.getActiveSequence();	// we use a QE DOM function, to determine the output extension.
  if (activeSequence)	{
    app.encoder.launchEncoder();	// This can take a while; let's get the ball rolling.

    var timeSecs	= activeSequence.CTI.secs;		// Just for reference, here's how to access the CTI 
    var timeFrames	= activeSequence.CTI.frames;	// (Current Time Indicator), for the active sequence. 
    var timeTicks	= activeSequence.CTI.ticks;
    var timeString	= activeSequence.CTI.timecode;

    var seqInPoint	= app.project.activeSequence.getInPoint();	// new in 9.0
    var seqOutPoint	= app.project.activeSequence.getOutPoint();	// new in 9.0

    var projPath	= new File(app.project.path);
    var outputPath  = Folder.selectDialog("Choose the output directory");

    if ((outputPath) && projPath.exists){
      var outPreset		= new File(outputPresetPath);
      if (outPreset.exists === true){
        var outputFormatExtension		=	activeSequence.getExportFileExtension(outPreset.fsName);
        if (outputFormatExtension){
          var outputFilename	= 	activeSequence.name + '.' + outputFormatExtension;

          var fullPathToFile	= 	outputPath.fsName 	+ 
                      getSep() 	+ 
                      activeSequence.name + 
                      "." + 
                      outputFormatExtension;			

          var outFileTest = new File(fullPathToFile);

          if (outFileTest.exists){
            var destroyExisting	= confirm("A file with that name already exists; overwrite?", false, "Are you sure...?");
            if (destroyExisting){
              outFileTest.remove();
              outFileTest.close();
            }
          }

          app.encoder.bind('onEncoderJobComplete',	onEncoderJobComplete);
          app.encoder.bind('onEncoderJobError', 		onEncoderJobError);
          app.encoder.bind('onEncoderJobProgress', 	onEncoderJobProgress);
          app.encoder.bind('onEncoderJobQueued', 		onEncoderJobQueued);
          app.encoder.bind('onEncoderJobCanceled',	onEncoderJobCanceled);


          // use these 0 or 1 settings to disable some/all metadata creation.

          app.encoder.setSidecarXMPEnabled(0);
          app.encoder.setEmbeddedXMPEnabled(0);

          /* 

          For reference, here's how to export from within PPro (blocking further user interaction).
          
          var seq = app.project.activeSequence; 
          
          if (seq) {
            seq.exportAsMediaDirect(fullPathToFile,  
                        outPreset.fsName, 
                        app.encoder.ENCODE_WORKAREA);

            Bonus: Here's how to compute a sequence's duration, in ticks. 254016000000 ticks/second.
            var sequenceDuration = app.project.activeSequence.end - app.project.activeSequence.zeroPoint;						
          }
          
          */
          
          var jobID = app.encoder.encodeSequence(	app.project.activeSequence,
                              fullPathToFile,
                              outPreset.fsName,
                              app.encoder.ENCODE_WORKAREA, 
                              1);	   // Remove from queue upon successful completion?					
          message('jobID = ' + jobID);
          outPreset.close();
        }
      } else {
        updateEventPanel("Could not find output preset.");
      }
    } else {
      updateEventPanel("Could not find/create output path.");
    }
    projPath.close();
  } else {
    updateEventPanel("No active sequence.");
  }
}

function saveProjectAs() {
  var sessionCounter	= 1;
  var outputPath		= Folder.selectDialog("Choose the output directory");
  if (outputPath) {
    var absPath		= outputPath.fsName;
    var outputName	= String(app.project.name);
    var array		= outputName.split('.', 2);

    outputName = array[0]+ sessionCounter + '.' + array[1]; 
    sessionCounter++;
    
    var fullOutPath = absPath + getSep() + outputName;
    app.project.saveAs(	fullOutPath);
    app.openDocument(	fullOutPath,
              1,					// suppress 'Convert Project?' dialogs
              1,					// suppress 'Locate Files' dialogs
              1);					// suppress warning dialogs
  }
}

function mungeXMP() {
  var projectItem	= app.project.rootItem.children[0]; // assumes first item is footage.
  if (projectItem) {
    if (ExternalObject.AdobeXMPScript === undefined) {
      ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript'); 
    }

    if (ExternalObject.AdobeXMPScript !== undefined) { 	// safety-conscious!
      
      var xmpBlob					= projectItem.getXMPMetadata();
      var xmp						= new XMPMeta(xmpBlob);
      var oldSceneVal				= "";
      var oldDMCreatorVal 		= "";
      
      if (xmp.doesPropertyExist(XMPConst.NS_DM, "scene") === true){
        var myScene = xmp.getProperty(XMPConst.NS_DM, "scene");
        oldSceneVal	= myScene.value;
      }

      if (xmp.doesPropertyExist(XMPConst.NS_DM, "creator") === true){
        var myCreator = xmp.getProperty(XMPConst.NS_DM, "creator");
        oldCreatorVale	= myCreator.value;
      }

      // Regardless of whether there WAS scene or creator data, set scene and creator data. 

      xmp.setProperty(XMPConst.NS_DM, "scene",	oldSceneVal 	+ " Added by PProPanel sample!");
      xmp.setProperty(XMPConst.NS_DM, "creator",	oldDMCreatorVal + " Added by PProPanel sample!");

      // That was the NS_DM creator; here's the NS_DC creator.

      var creatorProp             = "creator";
      var containsDMCreatorValue  = xmp.doesPropertyExist(XMPConst.NS_DC, creatorProp);
      var numCreatorValuesPresent = xmp.countArrayItems(XMPConst.NS_DC, creatorProp);
      var CreatorsSeparatedBy4PoundSigns = "";
      
      if(numCreatorValuesPresent > 0) {
        for (var z = 0; z < numCreatorValuesPresent; z++){
          CreatorsSeparatedBy4PoundSigns = CreatorsSeparatedBy4PoundSigns + xmp.getArrayItem(XMPConst.NS_DC, creatorProp, z + 1);
          CreatorsSeparatedBy4PoundSigns = CreatorsSeparatedBy4PoundSigns + "####";
        }
        updateEventPanel(CreatorsSeparatedBy4PoundSigns);

        if (confirm("Replace previous?", false, "Replace existing Creator?")) {
          xmp.deleteProperty(XMPConst.NS_DC, "creator");
        }
        xmp.appendArrayItem(XMPConst.NS_DC, // If no values exist, appendArrayItem will create a value.
                  creatorProp,
                  numCreatorValuesPresent + " creator values were already present.",
                  null, 
                  XMPConst.ARRAY_IS_ORDERED);

      } else {

        xmp.appendArrayItem(XMPConst.NS_DC, 
                  creatorProp,
                  "PProPanel wrote the first value into NS_DC creator field.",
                  null, 
                  XMPConst.ARRAY_IS_ORDERED);
      }
      var xmpAsString = xmp.serialize();			// either way, serialize and write XMP.
      projectItem.setXMPMetadata(xmpAsString);
    }
  } else {
    updateEventPanel("Project item required.");
  }
}

function getProductionByName(nameToGet) {
  var production;
  for (var i = 0; i < productionList.numProductions; i++) {
    var currentProduction = productionList[i];

    if (currentProduction.name == nameToGet) {
      production = currentProduction;
    }
  }
  return production;
}

function pokeAnywhere() {
  var token				= app.anywhere.getAuthenticationToken();
  var productionList		= app.anywhere.listProductions();
  var isProductionOpen	= app.anywhere.isProductionOpen();
  if (isProductionOpen === true) {
    var sessionURL			= app.anywhere.getCurrentEditingSessionURL();
    var selectionURL		= app.anywhere.getCurrentEditingSessionSelectionURL();
    var activeSequenceURL	= app.anywhere.getCurrentEditingSessionActiveSequenceURL();

    var theOneIAskedFor = getProductionByName("test");

    if (theOneIAskedFor) {
      var out	= theOneIAskedFor.name + ", " + theOneIAskedFor.description;
      updateEventPanel("Found: " + out);	// todo: put useful code here.
    }
  } else {
    updateEventPanel("No Production open.");
  }
}

function dumpOMF() {
  var activeSequence	= app.project.activeSequence;
  if (activeSequence) {
    var outputPath	= Folder.selectDialog("Choose the output directory");
    if (outputPath){
      var absPath	= outputPath.fsName;
          var outputName	= String(activeSequence.name) + '.omf';

      var fullOutPathWithName = absPath + getSep() + outputName;

      app.project.exportOMF(	app.project.activeSequence,		// sequence
                  fullOutPathWithName, 		// output file path
                  'OMFTitle',						// OMF title
                  48000,							// sample rate (48000 or 96000)
                  16,								// bits per sample (16 or 24)
                  1,								// audio encapsulated flag (1 : yes or 0 : no)
                  0,								// audio file format (0 : AIFF or 1 : WAV)
                  0,								// trim audio files (0 : no or 1 : yes)
                  0,								// handle frames (if trim is 1, handle frames from 0 to 1000)
                  0);								// include pan flag (0 : no or 1 : yes)
    }
  } else {
    updateEventPanel("No active sequence.");
  }
}

function addClipMarkers() {
  if (app.project.rootItem.children.numItems > 0){
    var projectItem	= app.project.rootItem.children[0]; // assumes first item is footage.
    if (projectItem) {
      if (projectItem.type == ProjectItemType.CLIP ||
        projectItem.type == ProjectItemType.FILE) {
        
        markers	= projectItem.getMarkers();

        if (markers) {
          var num_markers		= markers.numMarkers;

          var new_marker		= markers.createMarker(12.345);
          
          var guid 			= new_marker.guid; // new in 11.1
          
          new_marker.name		= 'Marker created by PProPanel.';
          new_marker.comments	= 'Here are some comments, inserted by PProPanel.';
          new_marker.end		= 15.6789;

          //default marker type == comment. To change marker type, call one of these:

          // new_marker.setTypeAsChapter();
          // new_marker.setTypeAsWebLink();
          // new_marker.setTypeAsSegmentation();
          // new_marker.setTypeAsComment();
        }
      } else {
        updateEventPanel("Can only add markers to footage items.");
      }
    } else {
      updateEventPanel("Could not find first projectItem.");
    }
  } else {
    updateEventPanel("Project is empty.");
  }
}

function modifyProjectMetadata() {
  var kPProPrivateProjectMetadataURI	= "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";

  var namefield	= "Column.Intrinsic.Name";
  var tapename	= "Column.Intrinsic.TapeName";
  var desc		= "Column.PropertyText.Description";
  var logNote    	= "Column.Intrinsic.LogNote";
  var newField	= "ExampleFieldName";

  if (app.isDocumentOpen()) {
    var projectItem	= app.project.rootItem.children[0]; // just grabs first projectItem.
    if (projectItem) {
      if (ExternalObject.AdobeXMPScript === undefined) {
        ExternalObject.AdobeXMPScript	= new ExternalObject('lib:AdobeXMPScript');
      }
      if (ExternalObject.AdobeXMPScript !== undefined) {	// safety-conscious!
        var projectMetadata		= projectItem.getProjectMetadata();
        var successfullyAdded	= app.project.addPropertyToProjectMetadataSchema(newField, "ExampleFieldLabel",	2);

        var xmp	= new XMPMeta(projectMetadata);
        var obj	= xmp.dumpObject();

        // var aliases = xmp.dumpAliases();

        var namespaces					= XMPMeta.dumpNamespaces();
        var found_name					= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, namefield);
        var found_tapename				= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, tapename);
        var found_desc					= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, desc);
        var found_custom				= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, newField);
        var foundLogNote       			= xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, logNote);
        var oldLogValue        			= "";
        var appendThis          		= "This log note inserted by PProPanel.";
        var appendTextWasActuallyNew	= false;
          
          if(foundLogNote){
          var oldLogNote = xmp.getProperty(kPProPrivateProjectMetadataURI, logNote);
          if (oldLogNote){
            oldLogValue = oldLogNote.value;
          }
          }

        xmp.setProperty(kPProPrivateProjectMetadataURI, tapename, 	"***TAPENAME***");
        xmp.setProperty(kPProPrivateProjectMetadataURI, desc, 		"***DESCRIPTION***");
        xmp.setProperty(kPProPrivateProjectMetadataURI, namefield, 	"***NEWNAME***");
        xmp.setProperty(kPProPrivateProjectMetadataURI, newField, 	"PProPanel set this, using addPropertyToProjectMetadataSchema().");


        var array	= [];
        array[0]	= tapename;
        array[1]	= desc;
        array[2]	= namefield;
        array[3]	= newField;

        var concatenatedLogNotes = "";

        if (oldLogValue != appendThis){ // if that value is not exactly what we were going to add
          if (oldLogValue.length > 0){		// if we have a valid value
            concatenatedLogNotes += "Previous log notes: " + oldLogValue + "    ||||    ";
          }
          concatenatedLogNotes += appendThis;
          xmp.setProperty(kPProPrivateProjectMetadataURI, logNote, concatenatedLogNotes);
          array[4]    = logNote;
        }

        var str = xmp.serialize();
        projectItem.setProjectMetadata(str, array);

        // test: is it in there?

        var newblob		= projectItem.getProjectMetadata();
        var newXMP		= new XMPMeta(newblob);
        var foundYet	= newXMP.doesPropertyExist(kPProPrivateProjectMetadataURI, newField);

        if (foundYet){
          updateEventPanel("PProPanel successfully added a field to the project metadata schema, and set a value for it.");
        }
      }
    } else {
      updateEventPanel("No project items found.");
    }
  }
}

function updatePAR() {
  var item = app.project.rootItem.children[0]; 
  if (item) {
    if ((item.type == ProjectItemType.FILE) || (item.type == ProjectItemType.CLIP)){
      // If there is an item, and it's either a clip or file...
      item.setOverridePixelAspectRatio(185,  100); // anamorphic is BACK!	  ;)
    } else {
      updateEventPanel('You cannot override the PAR of bins or sequences.');
    }
  } else {
    updateEventPanel("No project items found.");
  }
}

function getnumAEProjectItems() {
  var bt		= new BridgeTalk();
  bt.target	= 'aftereffects';
  bt.body		= //'updateEventPanel("Items in AE project: " + app.project.rootFolder.numItems);app.quit();';
          'alert("Items in AE project: " + app.project.rootFolder.numItems);app.quit();';
  bt.send();
}

function updateEventPanel(message) {
  app.setSDKEventMessage(message, 'info');
  //app.setSDKEventMessage('Here is some information.', 'info');
  //app.setSDKEventMessage('Here is a warning.', 'warning');
  //app.setSDKEventMessage('Here is an error.', 'error');  // Very annoying; use sparingly.
}

function walkAllBinsForFootage(parentItem, outPath) {
  for (var j = 0; j < parentItem.children.numItems; j++){
    var currentChild	= parentItem.children[j];
    if (currentChild){
      if (currentChild.type == ProjectItemType.BIN){
        walkAllBinsForFootage(currentChild, outPath);		// warning; recursion!
      } else {
        dumpProjectItemXMP(currentChild, outPath);
      }
    }
  }
}

function searchBinForProjItemByName(i, currentItem, nameToFind){
  for (var j = i; j < currentItem.children.numItems; j++){
    var currentChild	= currentItem.children[j];
    if (currentChild){
      if (currentChild.type == ProjectItemType.BIN){
        return searchBinForProjItemByName(j, currentChild, nameToFind);		// warning; recursion!
      } else {
          if (currentChild.name == nameToFind){
          return currentChild;
          } else {
          currentChild = currentItem.children[j+1];
          if (currentChild){
            return searchBinForProjItemByName(0, currentChild, nameToFind);
          }
        }
      }
    }
  }
}

function dumpXMPFromSequences() {
  var outPath		= Folder.selectDialog("Choose the output directory");
  var projForSeq	= 0;
  var seqCount	= app.project.sequences.numSequences;

  for (var i = 0; i < seqCount; i++){
    var currentSeq	= app.project.sequences[i];
    if (currentSeq){
      projForSeq = searchBinForProjItemByName(0, app.project.rootItem, currentSeq.name);
      if (projForSeq){
        dumpProjectItemXMP(projForSeq, outPath.fsName);
      } else {
        updateEventPanel("Couldn't find projectItem for sequence " + currentSeq.name);
      }
    }
  }
}

function dumpProjectItemXMP(projectItem, outPath) {
  var xmpBlob				= projectItem.getXMPMetadata();
  var outFileName			= projectItem.name + '.xmp';
  var completeOutputPath	= outPath + getSep() + outFileName;
  var outFile				= new File(completeOutputPath);

  if (outFile){
    outFile.encoding = "UTF8";
    outFile.open("w", "TEXT", "????");
    outFile.write(xmpBlob.toString());
    outFile.close();
  }
}

function addSubClip() {
  var startTimeSeconds	= 1.23743;
  var endTimeSeconds		= 3.5235;
  var hasHardBoundaries	= 0;

  var sessionCounter		= 1;
  var takeVideo			= 1; // optional, defaults to 1
  var takeAudio			= 1; //	optional, defaults to 1

  var projectItem			= app.project.rootItem.children[0]; // just grabs the first item

  if (projectItem) {
    if ((projectItem.type == ProjectItemType.CLIP)	|| (projectItem.type == ProjectItemType.FILE)) {
      var newSubClipName	= prompt('Name of subclip?',	projectItem.name + '_' + sessionCounter, 'Name your subclip');
      
      var newSubClip 	= projectItem.createSubClip(newSubClipName, 
                            startTimeSeconds, 
                            endTimeSeconds, 
                            hasHardBoundaries,
                            takeVideo,
                            takeAudio);

      if (newSubClip){
        newSubClip.setStartTime(12.345); // In seconds. New in 11.0
      }
    } else {
      updateEventPanel("Could not sub-clip " + projectItem.name + ".");
    }
  } else {
    updateEventPanel("No project item found.");
  }
}

function dumpXMPFromAllProjectItems() {
  var	numItemsInRoot	= app.project.rootItem.children.numItems;

  if (numItemsInRoot > 0) {
    var outPath = Folder.selectDialog("Choose the output directory");
    if (outPath) {
      for (var i = 0; i < numItemsInRoot; i++){
        var currentItem	= app.project.rootItem.children[i];
        if (currentItem){
          if (currentItem.type == ProjectItemType.BIN){
            walkAllBinsForFootage(currentItem, outPath.fsName);
          } else {
            dumpProjectItemXMP(currentItem, outPath.fsName);
          }
        }
      }
    }
  } else {
    updateEventPanel("No project items found.");
  }
}

function exportAAF() {
  var sessionCounter	= 1;
  if (app.project.activeSequence){
    var outputPath	= Folder.selectDialog("Choose the output directory");
    if (outputPath) {
      var absPath			= outputPath.fsName;
      var outputName		= String(app.project.name);
      var array			= outputName.split('.', 2);

      outputName = array[0]+ sessionCounter + '.' + array[1]; 
      sessionCounter++;
      
      var fullOutPath = absPath + getSep() + outputName + '.aaf';

      //var optionalPathToOutputPreset = null;  New in 11.0.0, you can specify an output preset.

      app.project.exportAAF(	app.project.activeSequence,			// which sequence
                  fullOutPath,						// output path
                  1,									// mix down video?
                  0,									// explode to mono?
                  96000,								// sample rate
                  16,									// bits per sample
                  0,									// embed audio? 
                  0,									// audio file format? 0 = aiff, 1 = wav
                  0,									// trim sources? 
                  0/*,								// number of 'handle' frames
                  optionalPathToOutputPreset*/);		// optional; .epr file to use
    } else {
      updateEventPanel("Couldn't create AAF output.");
      }
  } else {
    updateEventPanel("No active sequence.");
  }
}

function setScratchDisk() {
  var scratchPath = Folder.selectDialog("Choose new scratch disk directory");
  if ((scratchPath) && scratchPath.exists) {
    app.setScratchDiskPath(scratchPath.fsName, ScratchDiskType.FirstAutoSaveFolder); // see ScratchDiskType object, in ESTK.
  }
}

function getSequenceProxySetting() {
  var returnVal	= 'No sequence detected.';
  var seq			= app.project.activeSequence;

  if (seq) {
    if (seq.getEnableProxies() > 0) {
      returnVal	= 'true';
    } else {
      returnVal	= 'false';
    }
  }
  return returnVal;
}

function toggleProxyState() {
  var seq	= app.project.activeSequence;
  if (seq) {
    var update	= "Proxies for " + seq.name + " turned ";

    if (seq.getEnableProxies() > 0) {
      seq.setEnableProxies(false);
      update	= update + "OFF.";
      app.setSDKEventMessage(update, 'info');
    } else {
      seq.setEnableProxies(true);
      update	= update + "ON.";
      app.setSDKEventMessage(update, 'info');
    }
  } else {
    updateEventPanel("No active sequence.");
  }
}

function setProxiesON() {
  var firstProjectItem = app.project.rootItem.children[0]; 

  if (firstProjectItem) {
    if (firstProjectItem.canProxy()){
      var shouldAttachProxy	= true;
      if (firstProjectItem.hasProxy()) {
        shouldAttachProxy	= confirm(firstProjectItem.name + " already has an assigned proxy. Re-assign anyway?", false, "Are you sure...?");
      }
      if (shouldAttachProxy) {
        var proxyPath	= File.openDialog("Choose proxy for " + firstProjectItem.name + ":" );
        if (proxyPath.exists){
          firstProjectItem.attachProxy(proxyPath.fsName, 0);
        } else {
          updateEventPanel("Could not attach proxy from " + proxyPath + ".");
        }
      }
    } else {
      updateEventPanel("Cannot attach a proxy to " + firstProjectItem.name + ".");
    }
  } else {
    updateEventPanel("No project item available.");
  }
}

function clearCache() {
  app.enableQE();

  MediaType 	= {};

  // Magical constants from Premiere Pro's internal automation..

  MediaType.VIDEO = "228CDA18-3625-4d2d-951E-348879E4ED93";
  MediaType.AUDIO = "80B8E3D5-6DCA-4195-AEFB-CB5F407AB009";
  MediaType.ANY	= "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF";
  qe.project.deletePreviewFiles(MediaType.ANY);
  updateEventPanel("All video and audio preview files deleted.");
}

function randomizeSequenceSelection() {
  var sequence			= app.project.activeSequence;

  if (sequence){
    var trackGroups			= [ sequence.audioTracks, sequence.videoTracks ];
    var trackGroupNames		= [ "audioTracks", "videoTracks" ];
    var updateUI			= true;
    var before;

    for(var gi = 0; gi<2; gi++)	{
      message(trackGroupNames[gi]);
      group	= trackGroups[gi];
      for(var ti=0; ti<group.numTracks; ti++){
        var track		= group[ti];
        var clips		= track.clips;
        var transitions	= track.transitions;
        var beforeSelected;
        var afterSelected;

        message("track : " + ti + "	 clip count: " + clips.numTracks + "	  transition count: " + transitions.numTracks);	 

        for(var ci=0; ci<clips.numTracks; ci++){
          var clip	= clips[ci];
          name		= (clip.projectItem === undefined ? "<null>" : clip.projectItem.name);
          before		= clip.isSelected();

          // randomly select clips
          clip.setSelected((Math.random() > 0.5), updateUI);

          beforeSelected	= before ? "Y" : "N";			  
          afterSelected	= clip.selected ? "Y" : "N";
          message("clip : " + ci + "	 " + name + "		" + beforeSelected + " -> " + afterSelected);		 
        }

        for(var tni=0; tni<transitions.numTracks; ++tni){
          var transition	= transitions[tni];
          before			= transition.isSelected();
    
          // randomly select transitions
          transition.setSelected((Math.random() > 0.5), updateUI);

          beforeSelected	= before ? "Y" : "N";			  
          afterSelected	= transition.selected ? "Y" : "N";

          message('transition: ' + tni + "		" + beforeSelected + " -> " + afterSelected);
        }
      }
    }			
  } else {
    updateEventPanel("No active sequence found.");
  }
  
}

// Define a couple of callback functions, for AME to use during render.

function message(msg) {
  $.writeln(msg);	 // Using '$' object will invoke ExtendScript Toolkit, if installed.
}

function onEncoderJobComplete(jobID, outputFilePath) {
  var eoName;

  if (Folder.fs == 'Macintosh') {
    eoName = "PlugPlugExternalObject";							
  } else {
    eoName = "PlugPlugExternalObject.dll";
  }
      
  var suffixAddedByPPro	= '_1'; // You should really test for any suffix.
  var withoutExtension	= outputFilePath.slice(0,-4); // trusting 3 char extension
  var lastIndex			= outputFilePath.lastIndexOf(".");
  var extension			= outputFilePath.substr(lastIndex + 1);

  if (outputFilePath.indexOf(suffixAddedByPPro)){
    updateEventPanel(" Output filename was changed: the output preset name may have been added, or there may have been an existing file with that name. This would be a good place to deal with such occurrences.");
  }
      
  var mylib		= new ExternalObject('lib:' + eoName);
  var eventObj	= new CSXSEvent();

  eventObj.type	= "com.adobe.csxs.events.PProPanelRenderEvent";
  eventObj.data	= "Rendered Job " + jobID + ", to " + outputFilePath + ".";

  eventObj.dispatch();
}

function onEncoderJobError(jobID, errorMessage) {
  var eoName; 

  if (Folder.fs === 'Macintosh') {
    eoName	= "PlugPlugExternalObject";							
  } else {
    eoName	= "PlugPlugExternalObject.dll";
  }
      
  var mylib		= new ExternalObject('lib:' + eoName);
  var eventObj	= new CSXSEvent();

  eventObj.type	= "com.adobe.csxs.events.PProPanelRenderEvent";
  eventObj.data	= "Job " + jobID + " failed, due to " + errorMessage + ".";
  eventObj.dispatch();
}

function onEncoderJobProgress(jobID, progress) {
  message('onEncoderJobProgress called. jobID = ' + jobID + '. progress = ' + progress + '.');
}

function onEncoderJobQueued(jobID) {
  app.encoder.startBatch();
}

function onEncoderJobCanceled(jobID) {
  message('OnEncoderJobCanceled called. jobID = ' + jobID +  '.');
}

function onPlayWithKeyframes () {
  var seq = app.project.activeSequence;
  if (seq) {
    var firstVideoTrack	= seq.videoTracks[0];
    if (firstVideoTrack){
      var firstClip	= firstVideoTrack.clips[0];
      if (firstClip){
        var clipComponents	= firstClip.components;
        if (clipComponents){
          for (var i = 0; i < clipComponents.numItems; ++i){
            message('component ' + i + ' = ' + clipComponents[i].matchName + ' : ' + clipComponents[i].displayName);
          }
          if (clipComponents.numItems > 2){
            
            // 0 = clip
            // 1 = Opacity
            var blur	= clipComponents[2]; // Assume Gaussian Blur is the first effect applied to the clip.
            if (blur){
              var blurProps	= blur.properties;
              if (blurProps){
                for( var j = 0; j < blurProps.numItems; ++j){
                  message('param ' + j + ' = ' + blurProps[j].displayName);
                }
                var blurriness	= blurProps[0];
                if (blurriness){
                  if (!blurriness.isTimeVarying()){
                    blurriness.setTimeVarying(true);
                  }
                  for(var k = 0; k < 20; ++k){
                    updateUI	= (k==9);  		// Decide how often to update PPro's UI
                    blurriness.addKey(k);
                    var blurVal	= Math.sin(3.14159*i/5)*20+25;
                    blurriness.setValueAtKey(k, blurVal, updateUI);
                  }
                }
                var repeatEdgePixels	= blurProps[2];
                if (repeatEdgePixels){
                  if (!repeatEdgePixels.getValue()){
                    updateUI	= true;
                    repeatEdgePixels.setValue(true, updateUI);
                  }
                }
                // look for keyframe nearest to 4s with 1/10 second tolerance
                var keyFrameTime	= blurriness.findNearestKey(4.0, 0.1);
                if (keyFrameTime !== undefined){
                  message('Found keyframe = ' + keyFrameTime.seconds);
                } else {
                  message('Keyframe not found.');
                }

                // scan keyframes, forward

                keyFrameTime	= blurriness.findNearestKey(0.0, 0.1);
                var lastKeyFrameTime	= keyFrameTime;
                while(keyFrameTime !== undefined){
                  message('keyframe @ ' + keyFrameTime.seconds);
                  lastKeyFrameTime	= keyFrameTime;
                  keyFrameTime		= blurriness.findNextKey(keyFrameTime);
                }

                // scan keyframes, backward
                keyFrameTime	= lastKeyFrameTime;
                while(keyFrameTime	!== undefined){
                  message('keyframe @ ' + keyFrameTime.seconds);
                  lastKeyFrameTime	= keyFrameTime;
                  keyFrameTime		= blurriness.findPreviousKey(keyFrameTime);
                }

                // get all keyframes

                var blurKeyframesArray	= blurriness.getKeys();
                if (blurKeyframesArray){
                  message(blurKeyframesArray.length + ' keyframes found');
                }

                // remove keyframe at 19s
                blurriness.removeKey(19);

                // remove keyframes in range from 0s to 5s
                var shouldUpdateUI	= true;
                blurriness.removeKeyRange(0,5, shouldUpdateUI);
              }

          } else {
              updateEventPanel("Please apply the Gaussian Blur effect to the first clip in the first video track of the active sequence.");
        }
          }
        }
      }
    }
  } else {
    updateEventPanel("No active sequence found.");
  }
}

function extractFileNameFromPath(fullPath){
  var lastDot	= fullPath.lastIndexOf(".");
  var lastSep	= fullPath.lastIndexOf("/");

  if (lastDot > -1){
    return fullPath.substr( (lastSep +1), (fullPath.length - (lastDot + 1)));
  } else {
    return fullPath;
  }
}

function onProxyTranscodeJobComplete(jobID, outputFilePath) {
  var suffixAddedByPPro	= '_1'; // You should really test for any suffix.
  var withoutExtension	= outputFilePath.slice(0,-4); // trusting 3 char extension
  var lastIndex			= outputFilePath.lastIndexOf(".");
  var extension			= outputFilePath.substr(lastIndex + 1);

  var wrapper		= [];
  wrapper[0]		= outputFilePath;
  
  var nameToFind	= 'Proxies generated by PProPanel';
  var targetBin	= getPPPInsertionBin();
  if (targetBin){
    app.project.importFiles(wrapper);
  }
}

function onProxyTranscodeJobError (jobID, errorMessage) {
    updateEventPanel(errorMessage);
}

function onProxyTranscodeJobQueued(jobID) {
    app.encoder.startBatch();
}

function ingestFiles(outputPresetPath) {
  app.encoder.bind('onEncoderJobComplete',	onProxyTranscodeJobComplete);
  app.encoder.bind('onEncoderJobError',		onProxyTranscodeJobError);
  app.encoder.bind('onEncoderJobQueued',		onProxyTranscodeJobQueued);
  app.encoder.bind('onEncoderJobCanceled',	onEncoderJobCanceled);

  if (app.project) {
    var fileOrFilesToImport	= File.openDialog (	"Choose full resolution files to import", 	// title
                          0, 											// filter available files? 
                          true); 										// allow multiple?
    if (fileOrFilesToImport) {

      var nameToFind	= 'Proxies generated by PProPanel';
      var targetBin	= searchForBinWithName(nameToFind);

      if (targetBin === 0) {
        // If panel can't find the target bin, it creates it.
        app.project.rootItem.createBin(nameToFind);
        targetBin = searchForBinWithName(nameToFind);
      }	
      if (targetBin){

        targetBin.select();

        // We have an array of File objects; importFiles() takes an array of paths.
        var importThese = [];

        if (importThese){
          for (var i = 0; i < fileOrFilesToImport.length; i++) {
            importThese[i]			= fileOrFilesToImport[i].fsName;
            var justFileName		= extractFileNameFromPath(importThese[i]);
            var suffix				= '_PROXY.mp4'; 
            var containingPath		= fileOrFilesToImport[i].parent.fsName;
            var completeProxyPath	= containingPath + getSep() + justFileName + suffix; 

            var jobID				=	app.encoder.encodeFile(fileOrFilesToImport[i].fsName, 
                          completeProxyPath, 
                          outputPresetPath, 
                          0);
          }

          app.project.importFiles(importThese, 
                      1,				// suppress warnings 
                      targetBin,
                      0);				// import as numbered stills
        }
      } else {
        updateEventPanel("Could not find or create target bin.");
      }
    } else {
      updateEventPanel("No files to import.");
    }
  } else {
    updateEventPanel("No project found.");
  }
}

function insertOrAppend() {
  var seq = app.project.activeSequence;
  if (seq){
    var first = app.project.rootItem.children[0];
    if (first){
      var vTrack1 = seq.videoTracks[0];
      if (vTrack1){
        
        // If there are already clips in this track,
        // append this one to the end. Otherwise, 
        // insert at start time.

        if (vTrack1.clips.numItems > 0){
          var lastClip = vTrack1.clips[(vTrack1.clips.numItems - 1)];
          if (lastClip){
            vTrack1.insertClip(first, lastClip.end.seconds);
          }
        }else {
            vTrack1.insertClip(first, '00;00;00;00');
        }
      } else {
        updateEventPanel("Could not find first video track.");
      }
    } else {
      updateEventPanel("Couldn't locate first projectItem.");
    }
  } else {
    updateEventPanel("No active sequence found.");
  }
}

function overWrite() {
  var seq = app.project.activeSequence;
  if (seq){
    var first = app.project.rootItem.children[0];
    if (first) {
      var vTrack1 = seq.videoTracks[0];
      if (vTrack1){
        var now = seq.getPlayerPosition();
        vTrack1.overwriteClip(first, now.seconds);
      } else {
        updateEventPanel("Could not find first video track.");
      }
    } else {
      updateEventPanel("Couldn't locate first projectItem.");
    }
  } else {
    updateEventPanel("No active sequence found.");
  }
}

function closeFrontSourceClip() {
  app.sourceMonitor.closeClip();
}

function closeAllClipsInSourceMonitor() {
  app.sourceMonitor.closeAllClips();
}

function changeLabel() {
  var first = app.project.rootItem.children[0];
  if (first){
    var newLabel = 4;  // 4 = Cerulean. 0 = Violet, 15 = Yellow.
    var currentLabel = first.getColorLabel();
    app.setSDKEventMessage("Previous Label color = " + currentLabel + ".", 'info');
    first.setColorLabel(newLabel);
    app.setSDKEventMessage("New Label color = " + newLabel + ".", 'info');
  } else {
    updateEventPanel("Couldn't locate first projectItem.");
  }
}

function getPPPInsertionBin() {
  var nameToFind = "Here's where PProPanel puts things.";

  var targetBin	= searchForBinWithName(nameToFind);

  if (targetBin === 0) {
    // If panel can't find the target bin, it creates it.
    app.project.rootItem.createBin(nameToFind);
    targetBin	= searchForBinWithName(nameToFind);
  }
  if (targetBin) {
    targetBin.select();
    return targetBin;
  }
}

function importComps() {
  var targetBin = getPPPInsertionBin();
  if (targetBin){
    var filterString = "";
    if (Folder.fs === 'Windows'){
      filterString = "All files:*.*";
    }
    var aepToImport	= 	File.openDialog (	"Choose After Effects project", 	// title
                        0, 									// filter available files? 
                        false);								// allow multiple?
    if (aepToImport) {
      var importAll 	=	confirm("Import all compositions in project?", false, "Import all?");
      if (importAll){
        var result 	= 	app.project.importAllAEComps(aepToImport.fsName, targetBin);
      } else {
        var compName = 	prompt(	'Name of composition to import?',	 
                    '', 
                    'Which Comp to import');
        if (compName){
          var importAECompResult = app.project.importAEComps(aepToImport.fsName, [compName], targetBin);
        } else {
          updateEventPanel("Could not find Composition.");
        }
      }
    } else {
      updateEventPanel("Could not open project.");
    }
  } else {
    updateEventPanel("Could not find or create target bin.");
  }
}