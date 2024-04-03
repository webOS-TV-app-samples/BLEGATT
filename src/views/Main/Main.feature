Feature: Main
	Scenario: Launch main page
		When Main page is launched.
		Then The page shows texts well.

	Scenario: Open alert
		When User clicks Open button.
		Then The alert is shown.
		And User clicks OK button.
		Then The alert disappears.

	Scenario: Open option menu
		When User clicks Options button.
		Then The menu is shown.
		And User pushes back button on remote control.
		Then The menu disappears.