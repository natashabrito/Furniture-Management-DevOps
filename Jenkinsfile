pipeline {

    agent any

    stages {

        stage('Checkout') {

            steps {
                checkout scm
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
