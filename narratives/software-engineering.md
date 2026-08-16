## Artifact
	The selected artifact is the GaiaML Python application. It was developed as an enhancement of the monolithic Jupyter Notebook Pirate Game ML project from CS-370 into a modular scientific command-line application. The application is a CLI tool which allows users to download and process data from the Gaia DR3 archives, train an XGBoost model using engineered feature analysis and apply the trained model to assess new DR3 data. The goal of the project is to show that XGBoost is a powerful option for tackling the issue of finding potential exoplanet host stars among massive tabularized data sets. 

## Justification and Changes
	Project GaiaML was chosen as the artifact to represent the Software Design and Engineering category because it strongly demonstrates the following: 
- The project was reorganized into a modular Python package structure, improving maintainability, reuse, and future expansion.
- Application configuration was centralized through YAML files and a configuration manager, eliminating scattered constants and simplifying future modifications.
- Added a console logging system to simplify debugging and system monitoring.
- Added a custom unit test handler, allowing other modules to quickly access tests and laying the foundation for later automation.
- Created a command-line interface using a simple state machine to handle user inputs and utilize connected modules.
- Enhanced documentation, including a detailed README, comments and supporting documents like flowcharts.

	The project started as a single notebook with two supporting python files. It now exists as a clearly named structure of independent modules which use Python’s package system to share functionality. The application now begins execution through a centralized main.py entry point and uses cli.py to run all user commands safely with error handling, logging and tests. Modules like the logger and tester use the central configuration manager to access static values like save file paths, eliminating dependence on hard-coded relative paths.
	Collectively, these enhancements transformed the original notebook into a maintainable software application with a modular architecture, centralized configuration, improved testing, and comprehensive documentation, providing a strong foundation for future machine learning development.
	
## Course Outcomes
	The course outcomes that I identified during the initial code review have been demonstrated by the progress made in this enhancement. 
    
**Employ strategies for building collaborative environments that enable diverse audiences to support organizational decision making in the field of computer science**

The project demonstrates collaboration by providing a modular codebase with Git version control, making it easier for future contributors to understand, extend, and maintain the application. 

**Design, develop, and deliver professional-quality oral, written, and visual communications that are coherent, technically sound, and appropriately adapted to specific audiences and contexts**

Professional communication was demonstrated through expanded documentation, architecture diagrams, user guides, and inline comments that support both technical and non-technical audiences. 

**Develop a security mindset that anticipates adversarial exploits in software architecture and designs to expose potential vulnerabilities, mitigate design flaws, and ensure privacy and enhanced security of data and resources**

The design for GaiaML was created while paying close attention to common security pitfalls such as data type errors, input validation, exception handling, configuration centralization and Git version control. While the project is not a security-critical application, ensuring correct operation within each module through unit tests and integration testing improves software reliability and maintainability.

## Reflection
	This process of enhancement has been one of the most challenging projects I have undertaken. I was able to make all scheduled features functional. Implementing the logger was the most straight-forward, by using the logging library, which already exposes most of the capabilities I needed. I repackaged them into a custom manager library. Similarly, pyyaml allows easy access to YAML configuration, which I extended in the `config_manager` and its `yaml_helper`. This step took some time to read through the documentation of pyyaml and to refresh my YAML notation. This centralizes configuration values, eliminating magic numbers and reducing duplicated constants throughout the codebase. This also will enable the CLI to edit these values for easier config management.
	The CLI was intentionally designed to remain simple while still providing robust error handling and extensibility. A single while loop reads user inputs and runs them through a nested match-case system to determine intent through decision trees. For example, a user can enter “test” from the main menu, followed by “logger” to access the logger testing functions. This approach embeds input validation, exception handling, logging, and application behavior into a human-readable decision tree.
	The tester also provided an opportunity to learn about Python’s native unittest library. The custom test handler defines tests to be run by any portion of the program. Future enhancement categories will include automated testing to ensure that upstream changes never break deeper modules. 
	Overall, Phase 1 of the GaiaML project has resulted in a stable base around which the XGBoost pipeline can be molded. The modular package structure simplifies future development by allowing new data ingestion, training, and prediction modules to be added with minimal changes to the existing codebase. Comprehensive documentation enables both technical and non-technical users to understand, configure, and use the application effectively.
