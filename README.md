# Code2Text Frontend

This is the frontend application for the Code2Text service, a tool that converts code repositories into human-readable text documents.

## Overview

The Code2Text frontend is built with React, Redux, and Material UI. It provides a user-friendly interface for users to:

1. Upload or connect GitHub repositories
2. Configure and initiate code-to-text conversions
3. Manage their repositories and conversions
4. Download and share converted documents

## Project Structure

```
frontend/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Common UI elements (Logo, etc.)
│   │   └── layout/        # Layout components (Header, Sidebar, etc.)
│   │   └── ...            # Other application pages
│   ├── services/          # API services
│   ├── store/             # Redux store
│   │   ├── slices/        # Redux slices
│   │   └── index.js       # Store configuration
│   ├── theme.js           # Material UI theme configuration
│   ├── App.js             # Main application component
│   └── index.js           # Application entry point
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## Features

- **User Authentication**: Secure login, registration, and password recovery
- **GitHub Integration**: Connect GitHub repositories for analysis and conversion
- **Repository Management**: Upload, sync, analyze, and manage code repositories
- **Conversion Process**: Configure conversion settings, output formats, and processing options
- **Document Management**: View, download, and share converted documents
- **User Settings**: Profile management, notification preferences, and integration settings

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The application will be available at http://localhost:3000.

## Technologies Used

- **React**: UI library for building components
- **Redux**: State management with Redux Toolkit
- **React Router**: Navigation and routing
- **Material UI**: Component library for consistent design
- **Formik**: Form handling with validation
- **Axios**: HTTP client for API requests
- **JWT**: Authentication using JSON Web Tokens

## Integration with Backend

The frontend communicates with the Code2Text backend API using RESTful endpoints. Key integrations include:

- User authentication and profile management
- Repository operations (upload, sync, analyze)
- Conversion processing and document retrieval
- GitHub and Google Drive integrations

## Environment Configuration

Create a `.env` file in the root of the frontend directory with the following variables:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_PAYPAL_CLIENT_ID=test
REACT_APP_GOOGLE_ANALYTICS_ID=
```

## Deployment

The frontend is configured for deployment on Vercel. To deploy:

1. Connect your repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy the application

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 

## Setup

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env` file with the following content:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_PAYPAL_CLIENT_ID=test
REACT_APP_GOOGLE_ANALYTICS_ID=
```

4. For PayPal integration:
   - For development, you can use the PayPal sandbox environment
   - Create a PayPal Developer account at https://developer.paypal.com
   - Create a new app in the PayPal Developer Dashboard
   - Copy the Client ID to your `.env` file
   - For production, update `.env.production` with your live Client ID

## Development

Run the development server:

```bash
npm start
```

## Building for Production

```bash
npm run build
```

## Testing

```bash
npm test
``` 