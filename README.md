# Toptal calorie-tracking app

To test this project, start both frontend and backend. By default, 
- frontend will be exposed on http://localhost:4200/
- backend is listening to http://localhost:8080/

if you don't have all the environment but you have docker + vscode, you can use the devcontainer configuration.

See video for a demo of the product.

## Requirements for the Sample Project

**Est. time/effort:** 20 hours  
**Expected delivery time:** 7 days

We would like to see how you would create a simple calorie-tracking app. Users should be able to enter their food entries along with the number of calories for each food entry.

## Task scope and expectations

The purpose of this task is to build a functional, real-life application that meets all of the specified requirements. Our aim is to evaluate your ability to implement real-life functionalities by paying attention to details and following good development practices. We seek to assess your proficiency in these areas:
- Establishing a proper project infrastructure.
- Demonstrating knowledge of basic problem-solving.
- Effectively utilizing your preferred frameworks and libraries.

Please, do not spend too much time creating the layout. The layout should look decent and something you would feel comfortable showing to the client. Imagine this is a demo call for a client. So, they will expect to see e.g. Bootstrap layout, MaterialUI, default Android / iOS form design, etc. Instead of spending a lot of time on creating a custom UI, please rather ensure the functionality is done correctly, and e.g. the user cannot submit incorrect values.

## Task functionalities

### Users should be able to manage food entries

- A user should be able to add a new food entry.
- Food entry should contain the following information:
  - Date/time when the food was taken.
  - Food/product name (i.e. milk, banana, hamburger).
  - Calorie value (numeric value).
- The first screen a user should see is the list of existing food entries.

### Calorie limit warning per day

- The daily threshold limit of calories should be 2.100.
- Ensure the users can see for which day they reached that limit. Also, ensure it is easy to change that limit in the code, per user. You don’t have to create an interface for this purpose.

### Admin role with a simple reporting

- Implement an admin role.
- Admin can see a screen with all added food entries of all users and manage existing food entries (read, update, create, delete).
- Admin should also see the report screen with the following information:
  - The number of added entries in the last 7 days vs. added entries the week before that. Please include the current day in those stats.
  - The average number of calories added per user for the previous 7 days.
- A regular user should not be able to access this reporting screen or access its data.

### User authentication/authorization

- Please use a token authentication method. You don’t have to implement a signup and login process. You can manage everything using a predefined user-specific token in the backend; however, ensure the token can be changed easily during your next interview.

### Filtering by dates

- Users should be able to filter food entries by entry date (date from/date to).
- Place filter fields on the same screen where the list of previously added food entries is.

### Diet-cheating feature

- We would like to allow the user to choose which food entry they don’t want to include in the calculation of consumed calories. So, please allow the user to select a checkbox/switch control so this food entry is not used in a daily limit calculation.

## Assignment guidelines

- For this project, you need to provide functionality based on REST or GraphQL API. Ensure the API can be tested and checked during your next call.
- If you do not feel comfortable building an API, feel free to use Firebase to build the API. Using Firebase is allowed; however, this would limit you in getting backend engagements in Toptal.
- Choose the technologies that you are most comfortable with. Some developers decide to use new technologies for this assignment. However, we are trying to evaluate your skills working with a client. Using new technologies for a short project, for your new client, and during a short period can be a risk that cannot guarantee success.
- During your next call, demonstrate the project in your local environment. We do not want you to spend time deploying this home-take assignment.
- Prepare sample data for the project.
- Ensure the data quality of entered information in the system.

## Milestones and task delivery

- The deadline to submit your completed project is 7 days from the moment you receive the project requirements.
- It means you must submit the project code within 7 days from the moment it was delivered to you by email.
- If you schedule your final interview after the 7-day deadline, make sure to submit your completed project and all code to the private repository before the deadline. Everything that is submitted after the deadline will not be taken into consideration.
- To ensure sufficient review time, please commit all code or documents at least 6 hours before the meeting. Submissions after this time will not be considered.
- Short project video - after you finish the project, please provide us with a simple and short video recording of the functionality and submit it to the GIT repository. Please do not spend too much time on this step. Our goal is to see your project presentation as soon as possible and how you would showcase a quick intro for the client. Therefore, please choose any free or preinstalled software to help you do this.
- Please join the meeting room for this final interview on time. If you miss your interview without prior notice, your application may be closed.

## Code Repository

Please use this private repository to version-control your code:  
https://git.toptal.com/screening-ops/Vincent-kerdraon  
**Username:** Vincent-kerdraon  
**Password:** [redacted]

## Guidelines

- This project will be used to evaluate your skills and should be fully functional without any obvious missing pieces.
- You have 7 days from the date you receive the brief to submit your completed project.
- If you schedule your final interview after the 7-day deadline, make sure to submit your completed project and all code to the private repository before the deadline. Everything that is submitted after the deadline will not be taken into consideration.
- If your interview is scheduled before the 7-day deadline, your project outputs and all code must be submitted to the private repository at least 2 hours before the interview. Failure to meet this requirement will result in your interview being canceled, and your application may be closed.
- After scheduling your interview, review the meeting details in the confirmation email carefully to be sure you are fully prepared for the call.
- Choose a quiet, distraction-free environment for the call with a reliable internet connection and functioning audio/video equipment.
- You will be asked to share your screen, so we recommend joining from a computer.
- Test your technology (camera, microphone, and screen-sharing tools) beforehand to prevent technical issues during the interview.
- Arrive on time and be ready to engage—punctuality and preparation demonstrate professionalism and respect for everyone’s time.
- Please note that your application may be declined if you reschedule your interview less than 12 hours in advance, you’ve rescheduled more than once, or you fail to attend your interview without prior warning.