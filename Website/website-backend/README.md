# Website Backend

This project is a web application built using Flask, designed for user authentication and content exploration. Below are the details regarding the structure and usage of the application.

## Project Structure

```
website-backend
├── app
│   ├── __init__.py          # Initializes the Flask application and sets up configuration
│   ├── routes.py            # Defines the routes for user login, registration, and content exploration
│   ├── models.py            # Contains data models, such as User
│   └── static
│       └── auth.css         # CSS styles for authentication pages
├── templates
│   ├── loginpage.html       # HTML template for the login page
│   ├── explore.html         # HTML template for the explore page
│   └── registerpage.html    # HTML template for the registration page
├── app.py                   # Entry point of the application
├── requirements.txt         # Lists project dependencies
└── README.md                # Documentation for the project
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd website-backend
   ```

2. **Create a virtual environment**:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies**:
   ```
   pip install -r requirements.txt
   ```

4. **Run the application**:
   ```
   python app.py
   ```

## Usage

- Navigate to `http://localhost:5000` in your web browser to access the application.
- Use the login page to authenticate or register a new account.
- After logging in, you will be redirected to the explore page where you can view content.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.