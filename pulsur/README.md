# Pulsur Project

Pulsur vise à aider les villes et les agences de transport à mieux comprendre la perception et les comportements de mobilité des citoyens.

## Project Structure

This project is organized into several microservices (applications), each residing in its own directory within the `pulsur/` folder:

-   `identification-app/`: Handles user authentication and registration.
-   `user-interface-app/`: Provides the main user-facing dashboards and client IAM.
-   `admin-interface-app/`: The main administration interface for platform managers.
-   `finance-app/`: Manages financial aspects, subscriptions, and billing.
-   `docs/`: Contains API specifications and other design documents (e.g., `openapi.yaml`).

Each application is intended to have its own database and operate independently, communicating via APIs.

## Database Schemas

Each application that requires a database will have its schema defined in an `init.sql` file located within a `db/` subdirectory of the application's main folder.

-   `identification-app/db/init.sql`
-   `user-interface-app/db/init.sql` (placeholder)
-   `admin-interface-app/db/init.sql` (placeholder)
-   `finance-app/db/init.sql` (placeholder)

These SQL files should be used to initialize the database structure for the respective application.

## CI/CD

This project uses GitHub Actions for Continuous Integration and Continuous Delivery (CI/CD). Workflow files are located in the `.github/workflows/` directory at the root of the project.

Each application has its own CI workflow file (e.g., `identification-app-ci.yml`) which is typically triggered by changes within that application's directory. These workflows currently include steps for:

-   Setting up the Node.js environment.
-   Installing application-specific dependencies.
-   Placeholder steps for linting and running tests (to be implemented).

Refer to the individual workflow files in `.github/workflows/` for more details on the CI process for each application.

## Configuration

Each application expects a `config.json` file at its root directory (e.g., `identification-app/config.json`). This file contains application-specific settings like database credentials and URLs. These configuration files are included in the `.gitignore` of each respective application to prevent committing sensitive information.
