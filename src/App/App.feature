Feature: App
	Scenario: Launch the app
		When User launches the app.
		Then App is displayed well.

	Scenario: Close the app
		Given User launches the app.
		When User clicks X button.
		Then The app is closed.

	Scenario: Close the app by back key
		Given User launches the app.
		When User pushes back button on remote control.
		Then The app is closed.