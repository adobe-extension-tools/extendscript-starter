class ColorSelector {
	run() {
		$.writeln("About to run ColorSelector");
		
		// Construct the window and the components
		var win = new Window("window", "Color Selector", undefined, { resizeable: false });
		win.alignChildren = "fill";
	
		// The instructions panel - the text color of this panel will change
		var instPanel = win.add("panel", undefined, "Instructions");
		//instPanel.alignment = "fill";
		instPanel.alignChildren = "left";
		var st = instPanel.add("statictext", undefined, "", {multiline: true } );
		st.text = "Use the radio buttons to select either the forground or background.  Then adjust "
		+ "the sliders in the bottom panel.  Each of the sliders represent a color, Red, Green or Blue.   "
		+ "The values of the sliders are show in the 'Color Values' panel.\n\n"
		+ "Using a Graphics Object you can:\n"
		+ "*   Change the background color\n"
		+ "*   Change the foreground color\n"
		+ "*   Change individual elements or the entire window\n\n"
		+ "This sample changes the colors within this panel.";
		st.characters = 50;
	
		// Panel to display the current color values
		var colPanel = win.add("panel", undefined, "Color Values");
		colPanel.orientation = "column";
		var gp1 = colPanel.add("group");
		gp1.orientation = "row";
		gp1.add("statictext", undefined, "Red:");
		var RedText = gp1.add("edittext", undefined, "0.5000");
		gp1.add("statictext", undefined, "Green:");
		var GreenText = gp1.add("edittext", undefined, "0.5000");
		gp1.add("statictext", undefined, "Blue:");
		var BlueText = gp1.add("edittext", undefined, "0.5000");
	
		// Panel to control how the sliders move and to set the foreground/background
		var sliderPanel = win.add("panel", undefined, "Color Controls");
		sliderPanel.alignChildren = ["fill", "fill"];
	
		var gp3 = sliderPanel.add("group");
		gp3.orientation = "row";
		gp3.alignment ="center";
	
		var foreBtn = gp3.add("radiobutton", undefined, "Foreground");
		var backBtn = gp3.add("radiobutton", undefined, "Background");
		var lockBtn = gp3.add("checkbox", undefined, "Lock Sliders");
		foreBtn.value = true;
	
		var sliderRed = sliderPanel.add("slider", undefined, 5, 0, 10);
		var sliderGreen = sliderPanel.add("slider", undefined, 5, 0, 10);
		var sliderBlue = sliderPanel.add("slider", undefined, 5, 0, 10);
	
		// Handlers for sliders to capture changed values and apply colors
		sliderRed.onChanging = function() 
		{
			var newVal = 0;
			if(sliderRed.value != 0)
			{
				newVal = sliderRed.value / 10;
			}
	
			RedText.text = newVal + '';
			if(lockBtn.value)
			{
				sliderGreen.value = sliderBlue.value = this.value;
				GreenText.text = BlueText.text = RedText.text;
			}
			// apply color
			changeColor(1, newVal, foreBtn.value);
		}
	
		sliderGreen.onChanging = function() 
		{
			var newVal = 0;
			if(sliderGreen.value != 0)
			{
				newVal = sliderGreen.value / 10;
			}
	
			GreenText.text = newVal + '';
			if(lockBtn.value)
			{
				sliderRed.value = sliderBlue.value = this.value;
				BlueText.text = RedText.text = GreenText.text;
			}
			// apply color
			changeColor(2, newVal, foreBtn.value);
		}
	
		sliderBlue.onChanging = function() 
		{
			var newVal = 0;
			if(sliderBlue.value != 0)
			{
				newVal = sliderBlue.value / 10;
			}
	
			BlueText.text = newVal + '';
			if(lockBtn.value)
			{
				sliderGreen.value = sliderRed.value = this.value;
				RedText.text = GreenText.text = BlueText.text;
			}
		
			// apply color
			changeColor(3, newVal, foreBtn.value);
	
		}
	
		win.show();
	
		// Apply the color changes to the window and panels
		function changeColor(color: number, val: number, foreground: boolean)
		{
			try
			{
				var Red = parseFloat(RedText.text);
				var Green = parseFloat(GreenText.text);
				var Blue = parseFloat(BlueText.text);
	
				switch(color)
				{
					case 1:
						Red = val;
						break;
					case 2:
						Green = val;
						break;
					case 3:
						Blue = val;
						break;
					default:
						return;	
				}
	
				// Colors: Red, Green, Blue, Alpha
				var colArr = [Red, Green, Blue, 1];
				// Get ScriptUIGraphics object associated with the window and each panel
				var g = win.graphics;
				var g2 = sliderPanel.graphics;
				var g3 = colPanel.graphics;
				var c, c2, c3;
	
				if(foreground) 	// do the foreground
				{
					// Create a Pen object for each color
					// specifying type, color, linewidth
					c  = g.newPen (g.PenType.SOLID_COLOR, colArr, 1);
					c2  = g2.newPen (g2.PenType.SOLID_COLOR, [0, 0, 0, 1], 1);
					c3  = g3.newPen (g3.PenType.SOLID_COLOR, [0, 0, 0, 1], 1);
					// Set the new Pen object as the foregroundColor of the graphics objects
					g.foregroundColor = c;
					g2.foregroundColor = c2;
					g3.foregroundColor = c3;
				}
				else // do the background
				{
					// Create a Brush object for each color
					// specifying type, color, linewidth
					c  = g.newBrush (g.BrushType.SOLID_COLOR, colArr, 1);
					if(File.fs == "Windows")
					{
						defColor = [0.933, 0.918, 0.848, 1];
					}
					else
					{
						defColor = [0.949, 0.949, 0.949, 1];
					}
					c2  = g2.newBrush (g2.BrushType.SOLID_COLOR, defColor, 1);
					c3  = g3.newBrush (g3.BrushType.SOLID_COLOR, defColor, 1);
					// Set the new Brush object as the backgroundColor of the graphics objects
					g.backgroundColor = c;
					g2.backgroundColor = c2;
					g3.backgroundColor = c3;
				}
			}
			catch(error){ alert(error); }
		}
		
		$.writeln("Ran ColorSelector");
		
		return true;
	}
}