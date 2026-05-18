pipeline {

    agent any

    stages {

        stage('Checkout') {

            steps {

                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                bat 'docker run --rm -v "%WORKSPACE%:/usr/src" -e SONAR_HOST_URL="http://host.docker.internal:9000" sonarsource/sonar-scanner-cli'
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                bat 'docker run --rm -v "%WORKSPACE%:/src" -v "%WORKSPACE%/odc-reports:/report" -v owasp-data:/usr/share/dependency-check/data owasp/dependency-check --scan /src --format HTML --out /report'
            }
        }

        stage('Build and Start Containers') {

            steps {

                bat 'docker compose down'

                bat 'docker compose up -d --build'
            }
        }

        stage('Verify') {

            steps {

                sleep time: 10, unit: 'SECONDS'

                bat 'curl -s -f http://localhost:5000/furniture'
            }
        }
    }

    post {

        success {

            echo 'Successfully built and started the Furniture DevOps application!'
        }

        failure {

            echo 'Pipeline failed. Please check the logs.'
        }
    }
}